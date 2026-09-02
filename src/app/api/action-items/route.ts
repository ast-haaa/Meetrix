import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { CreateActionItemSchema } from '@/lib/validations';
import { MOCK_ACTION_ITEMS } from '@/lib/mockData';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const meetingId = searchParams.get('meetingId');
    const decisionId = searchParams.get('decisionId');

    const where: any = {};
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (meetingId) where.meetingId = meetingId;
    if (decisionId) where.decisionId = decisionId;

    const actionItems = await prisma.actionItem.findMany({
      where,
      include: {
        meeting: { select: { title: true } },
        decision: { select: { title: true } },
        assignee: true,
        owner: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (actionItems.length === 0) {
      return NextResponse.json({ actionItems: MOCK_ACTION_ITEMS, isMock: true }, { status: 200 });
    }

    return NextResponse.json({ actionItems, count: actionItems.length, isMock: false }, { status: 200 });
  } catch (error: any) {
    console.warn('[API GET /api/action-items] Database query fallback:', error.message);
    return NextResponse.json({ actionItems: MOCK_ACTION_ITEMS, isMock: true }, { status: 200 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = CreateActionItemSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid action item input parameters', details: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { meetingId, decisionId, assigneeId, ownerId, title, description, status, priority, dueDate } = validation.data;

    // Verify parent meeting exists
    const meeting = await prisma.meeting.findUnique({ where: { id: meetingId } });
    if (!meeting) {
      return NextResponse.json({ error: `Meeting with ID "${meetingId}" not found` }, { status: 404 });
    }

    const actionItem = await prisma.actionItem.create({
      data: {
        meetingId,
        decisionId,
        assigneeId,
        ownerId,
        title,
        description,
        status,
        priority,
        dueDate: dueDate ? new Date(dueDate) : undefined,
      },
    });

    return NextResponse.json({ success: true, actionItem }, { status: 201 });
  } catch (error: any) {
    console.error('[API POST /api/action-items] Error:', error);
    return NextResponse.json({ error: 'Internal server error', message: error.message }, { status: 500 });
  }
}
