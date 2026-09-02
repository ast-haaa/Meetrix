import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { StoreTranscriptSchema } from '@/lib/validations';

export async function POST(req: NextRequest, { params }: { params: Promise<{ meetingId: string }> }) {
  try {
    const { meetingId } = await params;
    const body = await req.json();

    const validation = StoreTranscriptSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid transcript payload', details: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    // Verify meeting exists in DB or fallback
    const meeting = await prisma.meeting.findUnique({ where: { id: meetingId } });
    if (!meeting) {
      return NextResponse.json({ error: `Meeting with ID "${meetingId}" not found` }, { status: 404 });
    }

    const { utterances } = validation.data;

    // Process & store speaker labels
    const speakerMap: { [label: string]: string } = {};

    for (const utt of utterances) {
      if (!speakerMap[utt.speakerLabel]) {
        const speaker = await prisma.meetingSpeaker.upsert({
          where: {
            meetingId_speakerLabel: {
              meetingId,
              speakerLabel: utt.speakerLabel,
            },
          },
          update: {},
          create: {
            meetingId,
            speakerLabel: utt.speakerLabel,
          },
        });
        speakerMap[utt.speakerLabel] = speaker.id;
      }
    }

    // Replace existing utterances or append
    await prisma.transcriptUtterance.deleteMany({ where: { meetingId } });

    const createdUtterances = await prisma.transcriptUtterance.createMany({
      data: utterances.map((u, idx) => ({
        meetingId,
        speakerId: speakerMap[u.speakerLabel] || null,
        startTime: u.startTime,
        endTime: u.endTime,
        text: u.text,
        sequence: u.sequence ?? idx + 1,
      })),
    });

    // Update meeting status
    await prisma.meeting.update({
      where: { id: meetingId },
      data: { status: 'TRANSCRIBED' },
    });

    return NextResponse.json(
      {
        success: true,
        meetingId,
        utterancesCount: createdUtterances.count,
        message: 'Diarized transcript utterances stored successfully',
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('[API POST /api/meetings/[meetingId]/transcript] Error:', error);
    return NextResponse.json({ error: 'Internal server error', message: error.message }, { status: 500 });
  }
}
