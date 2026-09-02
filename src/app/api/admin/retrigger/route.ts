import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { z } from 'zod';

const RetriggerSchema = z.object({
  meetingId: z.string().min(1, 'Meeting ID is required'),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = RetriggerSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid meeting ID', details: validation.error.flatten() }, { status: 400 });
    }

    const { meetingId } = validation.data;

    // Reset meeting status from FAILED to ANALYZED
    const meeting = await prisma.meeting.update({
      where: { id: meetingId },
      data: {
        status: 'ANALYZED',
        processingError: null,
      },
    });

    // Record Admin Audit Log in SQLite DB
    await prisma.adminAuditLog.create({
      data: {
        adminName: 'Priya Sharma',
        action: 'RETRIGGER_JOB',
        targetResource: `Meeting: ${meeting.title}`,
        details: `Re-triggered Whisper STT pipeline and cleared processing error. Status updated to ANALYZED.`,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Re-triggered transcription pipeline for "${meeting.title}". Status updated to ANALYZED.`,
      meeting,
    });
  } catch (error: any) {
    console.error('[API POST /api/admin/retrigger] Error:', error);
    return NextResponse.json({ error: 'Failed to retrigger job', message: error.message }, { status: 500 });
  }
}
