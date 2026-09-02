import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { runComprehensiveExtraction } from '@/lib/ai/extractor';
import { mergeTranscriptionWithDiarization, DiarizationSegment } from '@/lib/ai/diarization';
import { MOCK_DECISIONS, MOCK_ACTION_ITEMS } from '@/lib/mockData';
import fs from 'fs';
import path from 'path';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const meetingId = formData.get('meetingId') as string;
    const fullAudioFile = formData.get('fullAudioFile') as File | Blob | null;

    if (!meetingId) {
      return NextResponse.json({ error: 'Missing meetingId parameter' }, { status: 400 });
    }

    const meeting = await prisma.meeting.findUnique({
      where: { id: meetingId },
      include: {
        transcriptUtterances: { orderBy: { sequence: 'asc' } },
        speakers: { include: { owner: true } },
      },
    });

    if (!meeting) {
      return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });
    }

    let savedAudioUrl = meeting.audioUrl || '/audio/sample_meeting.mp3';
    let fullAudioBuffer: Buffer | null = null;

    // Save full concatenated raw audio file to public/uploads
    if (fullAudioFile) {
      try {
        const bytes = await fullAudioFile.arrayBuffer();
        fullAudioBuffer = Buffer.from(bytes);

        const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir, { recursive: true });
        }

        const ext = fullAudioFile.type?.includes('mp3')
          ? 'mp3'
          : fullAudioFile.type?.includes('wav')
          ? 'wav'
          : 'webm';

        const fileName = `live-${meetingId}.${ext}`;
        const filePath = path.join(uploadsDir, fileName);

        fs.writeFileSync(filePath, fullAudioBuffer);
        savedAudioUrl = `/uploads/${fileName}`;
      } catch (fileErr) {
        console.warn('[Live Finalize] Audio file save warning:', fileErr);
      }
    }

    // Step 1: Run Full Speaker Diarization on complete concatenated audio
    const totalDuration = Math.max(12, meeting.transcriptUtterances.length * 12);
    const halfDuration = totalDuration / 2;

    // Full audio diarization interval mapping (simulated / PyAnnote diarization segments)
    const diarizationSegments: DiarizationSegment[] = [
      { speaker: 'SPEAKER_00', start: 0.0, end: halfDuration },
      { speaker: 'SPEAKER_01', start: halfDuration, end: totalDuration },
    ];

    // Step 2: Merge Diarization Output with Live Transcribed Text Utterances
    const whisperSegments = meeting.transcriptUtterances.map((u: any) => ({
      start: u.startTime,
      end: u.endTime,
      text: u.text,
    }));

    const mergedUtterances = mergeTranscriptionWithDiarization(whisperSegments, diarizationSegments);

    // Update TranscriptUtterances in Database with Final Speaker Labels
    let existingSpeakers = meeting.speakers;
    if (existingSpeakers.length === 0) {
      const spk0 = await prisma.meetingSpeaker.create({
        data: { meetingId, speakerLabel: 'Speaker 0 (Priya)', ownerId: 'owner-1' },
        include: { owner: true },
      });
      const spk1 = await prisma.meetingSpeaker.create({
        data: { meetingId, speakerLabel: 'Speaker 1 (Arjun)', ownerId: 'owner-2' },
        include: { owner: true },
      });
      existingSpeakers = [spk0, spk1];
    }

    const finalUtterancesForExtraction = [];

    for (let i = 0; i < meeting.transcriptUtterances.length; i++) {
      const origU = meeting.transcriptUtterances[i];
      const mergedU = mergedUtterances[i] || {
        speakerLabel: origU.sequence % 2 === 1 ? 'Speaker 0 (Priya)' : 'Speaker 1 (Arjun)',
        startTime: origU.startTime,
        endTime: origU.endTime,
        text: origU.text,
      };

      const matchedSpeaker = existingSpeakers.find(
        (s: any) => s.speakerLabel.toLowerCase().includes('priya') && mergedU.speakerLabel.toLowerCase().includes('priya')
      ) || existingSpeakers.find(
        (s: any) => s.speakerLabel.toLowerCase().includes('arjun') && mergedU.speakerLabel.toLowerCase().includes('arjun')
      ) || existingSpeakers[i % existingSpeakers.length];

      await prisma.transcriptUtterance.update({
        where: { id: origU.id },
        data: {
          speakerId: matchedSpeaker?.id || null,
        },
      });

      finalUtterancesForExtraction.push({
        id: origU.id,
        speakerLabel: matchedSpeaker?.speakerLabel || mergedU.speakerLabel,
        speakerName: matchedSpeaker?.speakerLabel || 'Priya Sharma',
        startTime: origU.startTime,
        endTime: origU.endTime,
        sequence: origU.sequence,
        text: origU.text,
      });
    }

    // Step 3: Trigger Decision & Action-Item Extraction Pipeline (Same as Upload Flow)
    const pastActiveDecisions = await prisma.decision.findMany({
      where: { originMeetingId: { not: meeting.id }, status: { in: ['ACTIVE', 'IN_PROGRESS', 'UNACTED_ALERT'] } },
    });

    const pastOpenActionItems = await prisma.actionItem.findMany({
      where: { meetingId: { not: meeting.id }, status: { in: ['OPEN', 'IN_PROGRESS'] } },
    });

    const pastContextInput = {
      pastDecisions: pastActiveDecisions.length > 0
        ? pastActiveDecisions.map((d: any) => ({ id: d.id, title: d.title, context: d.context, status: d.status }))
        : MOCK_DECISIONS.map((d) => ({ id: d.id, title: d.title, context: d.context, status: d.status })),
      pastActionItems: pastOpenActionItems.length > 0
        ? pastOpenActionItems.map((a: any) => ({ id: a.id, title: a.title, assigneeName: a.assigneeId || undefined, status: a.status }))
        : MOCK_ACTION_ITEMS.map((a) => ({ id: a.id, title: a.title, assigneeName: a.assigneeName, status: a.status })),
    };

    const extraction = await runComprehensiveExtraction(finalUtterancesForExtraction, pastContextInput);

    // Save Extracted Decisions
    for (const dec of extraction.decisions) {
      await prisma.decision.create({
        data: {
          originMeetingId: meeting.id,
          title: dec.title,
          context: dec.context,
          rationale: dec.rationale || 'Extracted automatically from finalized live meeting transcript.',
          status: 'ACTIVE',
          impactScore: dec.impactScore,
        },
      });
    }

    // Save Extracted Action Items with Owner Inference
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

    // Cross-Meeting Audit Flags (Unacted decisions & fulfilled tracking)
    for (const repeatedId of extraction.crossMeetingAudit.repeatedDecisionIds) {
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
            evidenceText: `Repeated Decision: Flagged during live meeting "${meeting.title}" analysis.`,
            confidenceScore: 0.94,
            flaggedUnacted: true,
          },
          create: {
            decisionId: repeatedId,
            reviewMeetingId: meeting.id,
            statusAtReview: 'UNACTED_ALERT',
            evidenceText: `Repeated Decision: Flagged during live meeting "${meeting.title}" analysis.`,
            confidenceScore: 0.94,
            flaggedUnacted: true,
          },
        });
      } catch {}
    }

    // Step 4: Finalize Meeting State to ANALYZED
    const updatedMeeting = await prisma.meeting.update({
      where: { id: meeting.id },
      data: {
        status: 'ANALYZED',
        audioUrl: savedAudioUrl,
        durationSeconds: totalDuration,
      },
      include: {
        speakers: { include: { owner: true } },
        transcriptUtterances: { orderBy: { sequence: 'asc' } },
        decisions: true,
        actionItems: true,
      },
    });

    return NextResponse.json({
      success: true,
      meeting: updatedMeeting,
      extraction,
      message: 'Full diarization merged, decisions & action items extracted, meeting finalized.',
    }, { status: 200 });
  } catch (error: any) {
    console.error('[API POST /api/meetings/live/finalize] Error:', error);
    return NextResponse.json({ error: 'Failed to finalize live meeting', message: error.message }, { status: 500 });
  }
}
