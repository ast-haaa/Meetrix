import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { CreateDecisionSchema } from '@/lib/validations';
import { MOCK_DECISIONS } from '@/lib/mockData';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const projectId = searchParams.get('projectId');
    const originMeetingId = searchParams.get('originMeetingId');

    const where: any = {};
    if (status) where.status = status;
    if (projectId) where.projectId = projectId;
    if (originMeetingId) where.originMeetingId = originMeetingId;

    const decisions = await prisma.decision.findMany({
      where,
      include: {
        originMeeting: { select: { title: true } },
        actionItems: true,
        followThroughs: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (decisions.length === 0) {
      return NextResponse.json({ decisions: MOCK_DECISIONS, isMock: true }, { status: 200 });
    }

    return NextResponse.json({ decisions, count: decisions.length, isMock: false }, { status: 200 });
  } catch (error: any) {
    console.warn('[API GET /api/decisions] Database fetch fallback:', error.message);
    return NextResponse.json({ decisions: MOCK_DECISIONS, isMock: true }, { status: 200 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = CreateDecisionSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { originMeetingId, projectId, title, context, rationale, status, impactScore } = validation.data;

    // Check origin meeting exists
    const meeting = await prisma.meeting.findUnique({ where: { id: originMeetingId } });
    if (!meeting) {
      return NextResponse.json(
        { error: `Origin meeting with ID "${originMeetingId}" does not exist` },
        { status: 404 }
      );
    }

    const decision = await prisma.decision.create({
      data: {
        originMeetingId,
        projectId: projectId || meeting.projectId,
        title,
        context,
        rationale,
        status,
        impactScore,
      },
    });

    return NextResponse.json({ success: true, decision }, { status: 201 });
  } catch (error: any) {
    console.error('[API POST /api/decisions] Creation error:', error);
    return NextResponse.json({ error: 'Internal server error', message: error.message }, { status: 500 });
  }
}
