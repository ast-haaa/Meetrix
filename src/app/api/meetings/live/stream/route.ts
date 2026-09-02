import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const meetingId = searchParams.get('meetingId');

    if (!meetingId) {
      return NextResponse.json({ error: 'Missing meetingId parameter' }, { status: 400 });
    }

    const utterances = await prisma.transcriptUtterance.findMany({
      where: { meetingId },
      orderBy: { sequence: 'asc' },
      include: {
        speaker: {
          include: { owner: true },
        },
      },
    });

    const formattedUtterances = utterances.map((u: any) => ({
      id: u.id,
      speakerLabel: u.speaker?.speakerLabel || 'Speaker 0 (Priya)',
      speakerName: u.speaker?.owner?.name || u.speaker?.speakerLabel || 'Priya Sharma',
      startTime: u.startTime,
      endTime: u.endTime,
      sequence: u.sequence,
      text: u.text,
    }));

    return NextResponse.json({
      success: true,
      meetingId,
      utterances: formattedUtterances,
    }, { status: 200 });
  } catch (error: any) {
    console.error('[API GET /api/meetings/live/stream] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch transcript stream', message: error.message }, { status: 500 });
  }
}
