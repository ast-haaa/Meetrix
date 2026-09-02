import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { UpdateActionItemSchema } from '@/lib/validations';
import { MOCK_ACTION_ITEMS } from '@/lib/mockData';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const item = await prisma.actionItem.findUnique({
      where: { id },
      include: {
        meeting: true,
        decision: true,
        assignee: true,
        owner: true,
      },
    });

    if (!item) {
      const mock = MOCK_ACTION_ITEMS.find((a) => a.id === id) || MOCK_ACTION_ITEMS[0];
      return NextResponse.json({ actionItem: mock, isMock: true }, { status: 200 });
    }

    return NextResponse.json({ actionItem: item, isMock: false }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: 'Internal server error', message: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();

    const validation = UpdateActionItemSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid update payload', details: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const existing = await prisma.actionItem.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: `Action item with ID "${id}" not found` }, { status: 404 });
    }

    const data: any = { ...validation.data };
    if (data.dueDate) data.dueDate = new Date(data.dueDate);

    const updated = await prisma.actionItem.update({
      where: { id },
      data,
    });

    return NextResponse.json({ success: true, actionItem: updated }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: 'Internal server error', message: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const existing = await prisma.actionItem.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: `Action item with ID "${id}" not found` }, { status: 404 });
    }

    await prisma.actionItem.delete({ where: { id } });
    return NextResponse.json({ success: true, message: `Action item ${id} deleted` }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: 'Internal server error', message: error.message }, { status: 500 });
  }
}
