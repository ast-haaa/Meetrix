import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { UpdateDecisionSchema } from '@/lib/validations';
import { MOCK_DECISIONS } from '@/lib/mockData';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const decision = await prisma.decision.findUnique({
      where: { id },
      include: {
        originMeeting: true,
        actionItems: true,
        followThroughs: {
          include: { reviewMeeting: true },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!decision) {
      const mock = MOCK_DECISIONS.find((d) => d.id === id) || MOCK_DECISIONS[0];
      return NextResponse.json({ decision: mock, isMock: true }, { status: 200 });
    }

    return NextResponse.json({ decision, isMock: false }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: 'Internal server error', message: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();

    const validation = UpdateDecisionSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid update payload', details: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const existing = await prisma.decision.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: `Decision with ID "${id}" not found` }, { status: 404 });
    }

    const updated = await prisma.decision.update({
      where: { id },
      data: validation.data,
    });

    return NextResponse.json({ success: true, decision: updated }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: 'Internal server error', message: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const existing = await prisma.decision.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: `Decision with ID "${id}" not found` }, { status: 404 });
    }

    await prisma.decision.delete({ where: { id } });
    return NextResponse.json({ success: true, message: `Decision ${id} deleted` }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: 'Internal server error', message: error.message }, { status: 500 });
  }
}
