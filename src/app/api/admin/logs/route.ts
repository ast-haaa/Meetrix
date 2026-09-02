import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function GET() {
  try {
    const logs = await prisma.adminAuditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return NextResponse.json({
      success: true,
      logs: logs.map((l) => ({
        id: l.id,
        adminName: l.adminName,
        action: l.action,
        targetResource: l.targetResource,
        details: l.details,
        createdAt: l.createdAt.toISOString(),
      })),
    });
  } catch (error: any) {
    console.error('[API GET /api/admin/logs] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch admin audit logs', message: error.message }, { status: 500 });
  }
}
