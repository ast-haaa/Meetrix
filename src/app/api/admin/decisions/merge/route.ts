import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { z } from 'zod';

const MergeDecisionSchema = z.object({
  primaryDecisionId: z.string().min(1, 'Primary decision ID is required'),
  secondaryDecisionId: z.string().min(1, 'Secondary decision ID is required'),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = MergeDecisionSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid merge parameters', details: validation.error.flatten() }, { status: 400 });
    }

    const { primaryDecisionId, secondaryDecisionId } = validation.data;

    const primary = await prisma.decision.findUnique({ where: { id: primaryDecisionId } });
    const secondary = await prisma.decision.findUnique({ where: { id: secondaryDecisionId } });

    if (!primary || !secondary) {
      return NextResponse.json({ error: 'One or both decisions were not found in database' }, { status: 404 });
    }

    // 1. Reassign action items from secondary to primary
    await prisma.actionItem.updateMany({
      where: { decisionId: secondaryDecisionId },
      data: { decisionId: primaryDecisionId },
    });

    // 2. Delete duplicate secondary decision from database
    await prisma.decision.delete({
      where: { id: secondaryDecisionId },
    });

    // 3. Record Admin Audit Log
    await prisma.adminAuditLog.create({
      data: {
        adminName: 'Priya Sharma',
        action: 'MERGE_DECISION',
        targetResource: `Primary Decision: ${primary.title}`,
        details: `Merged duplicate decision "${secondary.title}" (ID: ${secondary.id}) into "${primary.title}". Reassigned action items and deleted duplicate.`,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Successfully merged "${secondary.title}" into "${primary.title}".`,
      primaryDecision: primary,
    });
  } catch (error: any) {
    console.error('[API POST /api/admin/decisions/merge] Error:', error);
    return NextResponse.json({ error: 'Failed to merge decisions', message: error.message }, { status: 500 });
  }
}
