import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check if meeting exists
    const existingMeeting = await prisma.meeting.findUnique({
      where: { id },
    });

    if (!existingMeeting) {
      return NextResponse.json({ error: 'Meeting not found in database' }, { status: 404 });
    }

    // Delete meeting with cascading deletes on related tables
    await prisma.meeting.delete({
      where: { id },
    });

    console.log(`[API DELETE /api/admin/meetings/${id}] Real database deletion completed.`);

    return NextResponse.json({
      success: true,
      message: `Meeting "${existingMeeting.title}" and all related decisions/action items deleted from database.`,
      deletedMeetingId: id,
    });
  } catch (error: any) {
    console.error('[API DELETE /api/admin/meetings/[id]] Error:', error);
    return NextResponse.json({ error: 'Failed to delete meeting from database', message: error.message }, { status: 500 });
  }
}
