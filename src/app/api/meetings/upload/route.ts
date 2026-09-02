import { NextRequest, NextResponse } from 'next/server';
import { runTranscriptionAndDiarizationPipeline, processAndPersistMeetingAudio } from '@/lib/ai/whisperService';
import { runComprehensiveExtraction } from '@/lib/ai/extractor';
import { traceDecisionFollowThrough } from '@/lib/ai/decisionTracer';
import { prisma } from '@/lib/db/prisma';
import { MOCK_DECISIONS, MOCK_ACTION_ITEMS } from '@/lib/mockData';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const title = (formData.get('title') as string) || 'Audio Meeting Recording';
    const description = (formData.get('description') as string) || 'Ingested meeting audio';

    if (!file) {
      return NextResponse.json(
        { error: 'No audio file uploaded. Please select a valid audio or video file.' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Get default Organization for DB record
    let org = await prisma.organization.findFirst();
    if (!org) {
      org = await prisma.organization.create({
        data: { name: 'Meetrix Workspace', slug: 'meetrix-corp' },
      });
    }

    // 1. Create initial Meeting DB record
    const meeting = await prisma.meeting.create({
      data: {
        title: title || file.name,
        description,
        organizationId: org.id,
        status: 'PROCESSING',
      },
    });

    try {
      // 2. Run Transcription & Diarization Pipeline with format validation, chunking, and retries
      const pipelineResult = await processAndPersistMeetingAudio(meeting.id, buffer, file.name, file.type);

      // Fetch Past Context (Past Active Decisions & Past Open Action Items) for Cross-Meeting Audit
      const pastActiveDecisions = await prisma.decision.findMany({
        where: {
          originMeetingId: { not: meeting.id },
          status: { in: ['ACTIVE', 'IN_PROGRESS', 'UNACTED_ALERT'] },
        },
      });

      const pastOpenActionItems = await prisma.actionItem.findMany({
        where: {
          meetingId: { not: meeting.id },
          status: { in: ['OPEN', 'IN_PROGRESS'] },
        },
      });

      const pastContextInput = {
        pastDecisions: pastActiveDecisions.length > 0
          ? pastActiveDecisions.map((d) => ({ id: d.id, title: d.title, context: d.context, status: d.status }))
          : MOCK_DECISIONS.map((d) => ({ id: d.id, title: d.title, context: d.context, status: d.status })),
        pastActionItems: pastOpenActionItems.length > 0
          ? pastOpenActionItems.map((a) => ({ id: a.id, title: a.title, assigneeName: a.assigneeId || undefined, status: a.status }))
          : MOCK_ACTION_ITEMS.map((a) => ({ id: a.id, title: a.title, assigneeName: a.assigneeName, status: a.status })),
      };

      // 3. Run LLM Structured Extraction with Owner Inference & Cross-Meeting Audit
      const extraction = await runComprehensiveExtraction(pipelineResult.utterances, pastContextInput);

      // Store Extracted Decisions in Database
      for (const dec of extraction.decisions) {
        await prisma.decision.create({
          data: {
            originMeetingId: meeting.id,
            title: dec.title,
            context: dec.context,
            rationale: dec.rationale || 'Extracted automatically from diarized transcript.',
            status: 'ACTIVE',
            impactScore: dec.impactScore,
          },
        });
      }

      // Store Extracted Action Items with Owner Inference in Database
      for (const act of extraction.actionItems) {
        await prisma.actionItem.create({
          data: {
            meetingId: meeting.id,
            title: act.title,
            description: `${act.description || 'Assigned task ticket.'}\n\nOwner Inference: ${act.ownerInferenceReasoning}`,
            status: 'OPEN',
            priority: act.priority,
            dueDate: new Date(Date.now() + act.dueDateDaysFromNow * 24 * 60 * 60 * 1000),
          },
        });
      }

      // Process Cross-Meeting Audit Flags (Repeated Decisions & Unacted Past Action Items)
      const audit = extraction.crossMeetingAudit;

      // Flag Repeated / Unresolved Decisions
      for (const repeatedId of audit.repeatedDecisionIds) {
        try {
          await prisma.decision.update({
            where: { id: repeatedId },
            data: { status: 'UNACTED_ALERT' },
          });

          await prisma.followThroughTracking.upsert({
            where: {
              decisionId_reviewMeetingId: {
                decisionId: repeatedId,
                reviewMeetingId: meeting.id,
              },
            },
            update: {
              statusAtReview: 'UNACTED_ALERT',
              evidenceText: `Repeated Decision Detected: Decision was re-discussed in meeting "${meeting.title}" because work was never resolved.`,
              confidenceScore: 0.93,
              flaggedUnacted: true,
            },
            create: {
              decisionId: repeatedId,
              reviewMeetingId: meeting.id,
              statusAtReview: 'UNACTED_ALERT',
              evidenceText: `Repeated Decision Detected: Decision was re-discussed in meeting "${meeting.title}" because work was never resolved.`,
              confidenceScore: 0.93,
              flaggedUnacted: true,
            },
          });
        } catch (e) {
          // Ignore if mock ID
        }
      }

      // Flag Fulfilled Past Decisions
      for (const fulfilledId of audit.fulfilledDecisionIds) {
        try {
          await prisma.decision.update({
            where: { id: fulfilledId },
            data: { status: 'FULFILLED' },
          });
        } catch (e) {
          // Ignore if mock ID
        }
      }

      // Update final meeting status
      const updatedMeeting = await prisma.meeting.update({
        where: { id: meeting.id },
        data: { status: 'ANALYZED' },
        include: {
          speakers: { include: { owner: true } },
          transcriptUtterances: { orderBy: { sequence: 'asc' } },
          decisions: true,
          actionItems: true,
        },
      });

      return NextResponse.json(
        {
          success: true,
          meeting: updatedMeeting,
          extraction,
          message: 'Audio transcribed, decisions & action items extracted with owner inference and cross-meeting audit.',
        },
        { status: 201 }
      );
    } catch (pipelineError: any) {
      await prisma.meeting.update({
        where: { id: meeting.id },
        data: {
          status: 'FAILED',
          processingError: pipelineError.message,
        },
      });

      if (pipelineError.message.includes('Unsupported audio format') || pipelineError.message.includes('Unsupported MIME type')) {
        return NextResponse.json({ error: pipelineError.message }, { status: 400 });
      }

      return NextResponse.json(
        { error: 'Transcription & Extraction pipeline failed', details: pipelineError.message },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('[API POST /api/meetings/upload] Server error:', error);
    return NextResponse.json({ error: 'Internal server error', message: error.message }, { status: 500 });
  }
}
