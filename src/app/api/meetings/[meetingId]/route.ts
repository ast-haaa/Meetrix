import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { MOCK_MEETINGS } from '@/lib/mockData';

export async function GET(req: NextRequest, { params }: { params: Promise<{ meetingId: string }> }) {
  try {
    const { meetingId } = await params;

    const meeting = await prisma.meeting.findUnique({
      where: { id: meetingId },
      include: {
        speakers: { include: { owner: true } },
        transcriptUtterances: { orderBy: { sequence: 'asc' } },
        decisions: { include: { actionItems: true, followThroughs: true } },
        actionItems: true,
      },
    });

    if (!meeting) {
      const mockMeeting = MOCK_MEETINGS.find((m) => m.id === meetingId) || MOCK_MEETINGS[0];
      return NextResponse.json({ meeting: mockMeeting, isMock: true }, { status: 200 });
    }

    return NextResponse.json({ meeting, isMock: false }, { status: 200 });
  } catch (error: any) {
    console.error('[API GET /api/meetings/[meetingId]] Error:', error);
    return NextResponse.json({ error: 'Internal server error', message: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ meetingId: string }> }) {
  try {
    const { meetingId } = await params;

    const existing = await prisma.meeting.findUnique({ where: { id: meetingId } });
    if (!existing) {
      return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });
    }

    await prisma.meeting.delete({ where: { id: meetingId } });
    return NextResponse.json({ success: true, message: `Meeting ${meetingId} deleted` }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: 'Internal server error', message: error.message }, { status: 500 });
  }
}
