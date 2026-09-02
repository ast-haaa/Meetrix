import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { CheckFollowThroughSchema } from '@/lib/validations';
import { traceDecisionFollowThrough } from '@/lib/ai/decisionTracer';
import { MOCK_DECISIONS } from '@/lib/mockData';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: decisionId } = await params;
    const body = await req.json();

    const validation = CheckFollowThroughSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { reviewMeetingId } = validation.data;

    // Fetch decision and review meeting from DB or mock fallback
    let decision = await prisma.decision.findUnique({
      where: { id: decisionId },
    });

    if (!decision) {
      const mockDec = MOCK_DECISIONS.find((d) => d.id === decisionId);
      if (mockDec) {
        decision = {
          id: mockDec.id,
          originMeetingId: mockDec.originMeetingId,
          projectId: mockDec.projectId || null,
          title: mockDec.title,
          context: mockDec.context,
          rationale: mockDec.rationale || null,
          status: mockDec.status,
          impactScore: mockDec.impactScore,
          createdAt: new Date(mockDec.createdAt),
          updatedAt: new Date(mockDec.updatedAt),
        };
      }
    }

    if (!decision) {
      return NextResponse.json({ error: `Decision with ID "${decisionId}" not found` }, { status: 404 });
    }

    // Fetch review meeting transcript
    const reviewMeeting = await prisma.meeting.findUnique({
      where: { id: reviewMeetingId },
      include: { transcriptUtterances: { orderBy: { sequence: 'asc' } } },
    });

    const transcriptText = reviewMeeting
      ? reviewMeeting.transcriptUtterances.map((u) => u.text).join(' ')
      : 'Weekly review meeting transcript analysis: No active pull request or code commits submitted for this decision.';

    // Run decision follow-through evaluation tracer algorithm
    const traceResults = await traceDecisionFollowThrough(
      [{ id: decision.id, title: decision.title, context: decision.context, status: decision.status }],
      transcriptText
    );

    const result = traceResults[0];

    // Save or update FollowThroughTracking in database if DB is active
    let followThroughRecord;
    try {
      if (reviewMeeting) {
        followThroughRecord = await prisma.followThroughTracking.upsert({
          where: {
            decisionId_reviewMeetingId: {
              decisionId,
              reviewMeetingId,
            },
          },
          update: {
            statusAtReview: result.newStatus,
            evidenceText: result.evidenceText,
            confidenceScore: result.confidenceScore,
            flaggedUnacted: result.flaggedUnacted,
          },
          create: {
            decisionId,
            reviewMeetingId,
            statusAtReview: result.newStatus,
            evidenceText: result.evidenceText,
            confidenceScore: result.confidenceScore,
            flaggedUnacted: result.flaggedUnacted,
          },
        });

        // Update Decision status if unacted alert flagged
        if (result.flaggedUnacted) {
          await prisma.decision.update({
            where: { id: decisionId },
            data: { status: 'UNACTED_ALERT' },
          });
        }
      }
    } catch (dbErr) {
      console.warn('[Check Follow-Through] DB write warning:', dbErr);
    }

    return NextResponse.json(
      {
        success: true,
        decisionId,
        reviewMeetingId,
        evaluation: {
          newStatus: result.newStatus,
          evidenceText: result.evidenceText,
          confidenceScore: result.confidenceScore,
          flaggedUnacted: result.flaggedUnacted,
        },
        followThroughRecord,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('[API POST /api/decisions/[id]/check-follow-through] Error:', error);
    return NextResponse.json({ error: 'Internal server error', message: error.message }, { status: 500 });
  }
}
