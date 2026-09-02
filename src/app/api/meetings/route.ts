import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { CreateMeetingSchema } from '@/lib/validations';
import { MOCK_MEETINGS } from '@/lib/mockData';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const projectId = searchParams.get('projectId');

    const where: any = {};
    if (status) where.status = status;
    if (projectId) where.projectId = projectId;

    const meetings = await prisma.meeting.findMany({
      where,
      include: {
        speakers: { include: { owner: true } },
        decisions: true,
        actionItems: true,
        transcriptUtterances: {
          orderBy: { sequence: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (meetings.length === 0) {
      return NextResponse.json({ meetings: MOCK_MEETINGS, isMock: true }, { status: 200 });
    }

    return NextResponse.json({ meetings, count: meetings.length, isMock: false }, { status: 200 });
  } catch (error: any) {
    console.warn('[API GET /api/meetings] Error fetching meetings:', error.message);
    return NextResponse.json({ meetings: MOCK_MEETINGS, isMock: true, error: error.message }, { status: 200 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = CreateMeetingSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input parameters', details: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { title, description, organizationId, projectId, scheduledAt, durationSeconds, audioUrl } = validation.data;

    // Get fallback organization if not provided
    let targetOrgId = organizationId;
    if (!targetOrgId) {
      const defaultOrg = await prisma.organization.findFirst();
      targetOrgId = defaultOrg?.id;
    }

    if (!targetOrgId) {
      return NextResponse.json({ error: 'No organization found. Please seed or create an organization first.' }, { status: 422 });
    }

    const meeting = await prisma.meeting.create({
      data: {
        title,
        description,
        organizationId: targetOrgId,
        projectId,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : new Date(),
        durationSeconds: durationSeconds || 0,
        audioUrl,
        status: 'UPLOADING',
      },
    });

    return NextResponse.json({ success: true, meeting }, { status: 201 });
  } catch (error: any) {
    console.error('[API POST /api/meetings] Failed to create meeting:', error);
    return NextResponse.json({ error: 'Internal server error', message: error.message }, { status: 500 });
  }
}
