import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { MOCK_DECISIONS } from '@/lib/mockData';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: decisionId } = await params;

    const decision = await prisma.decision.findUnique({
      where: { id: decisionId },
      include: {
        originMeeting: true,
        actionItems: { include: { assignee: true } },
        followThroughs: {
          include: { reviewMeeting: true },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!decision) {
      const mock = MOCK_DECISIONS.find((d) => d.id === decisionId) || MOCK_DECISIONS[0];
      return NextResponse.json(
        {
          decisionId,
          status: mock.status,
          impactScore: mock.impactScore,
          history: mock.latestFollowThrough ? [mock.latestFollowThrough] : [],
          isMock: true,
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        decisionId: decision.id,
        title: decision.title,
        status: decision.status,
        impactScore: decision.impactScore,
        originMeeting: decision.originMeeting,
        actionItems: decision.actionItems,
        followThroughHistory: decision.followThroughs,
        isMock: false,
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json({ error: 'Internal server error', message: error.message }, { status: 500 });
  }
}
