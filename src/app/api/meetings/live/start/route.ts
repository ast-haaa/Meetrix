import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { MOCK_OWNERS } from '@/lib/mockData';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const title = body.title?.trim() || `Live Meeting (${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })})`;
    const description = body.description?.trim() || 'Real-time live audio recording session';

    // Fetch default organization
    let org = await prisma.organization.findFirst();
    if (!org) {
      org = await prisma.organization.create({
        data: { name: 'Meetrix Workspace', slug: 'meetrix-corp' },
      });
    }

    // Ensure default owners exist in database
    for (const ownerData of MOCK_OWNERS) {
      const existing = await prisma.owner.findUnique({ where: { id: ownerData.id } });
      if (!existing) {
        await prisma.owner.create({
          data: {
            id: ownerData.id,
            name: ownerData.name,
            email: ownerData.email,
            organizationId: org.id,
            role: (ownerData as any).role || 'MEMBER',
          },
        });
      }
    }

    // Create Meeting record with status RECORDING
    const meeting = await prisma.meeting.create({
      data: {
        title,
        description,
        organizationId: org.id,
        status: 'RECORDING',
      },
    });

    // Create default meeting speakers
    const speakers = [
      { speakerLabel: 'Speaker 0 (Priya)', ownerId: 'owner-1' },
      { speakerLabel: 'Speaker 1 (Arjun)', ownerId: 'owner-2' },
      { speakerLabel: 'Speaker 2 (Kavya)', ownerId: 'owner-3' },
    ];

    for (const spk of speakers) {
      try {
        const ownerExists = spk.ownerId ? await prisma.owner.findUnique({ where: { id: spk.ownerId } }) : null;
        await prisma.meetingSpeaker.create({
          data: {
            meetingId: meeting.id,
            speakerLabel: spk.speakerLabel,
            ownerId: ownerExists ? spk.ownerId : null,
          },
        });
      } catch {}
    }

    return NextResponse.json({
      success: true,
      meetingId: meeting.id,
      meeting,
    }, { status: 201 });
  } catch (error: any) {
    console.error('[API POST /api/meetings/live/start] Error:', error);
    return NextResponse.json({ error: 'Failed to start live meeting session', message: error.message }, { status: 500 });
  }
}
