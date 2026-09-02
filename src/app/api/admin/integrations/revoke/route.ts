import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { z } from 'zod';

const RevokeIntegrationSchema = z.object({
  provider: z.enum(['SLACK', 'JIRA', 'LINEAR']),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = RevokeIntegrationSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid provider', details: validation.error.flatten() }, { status: 400 });
    }

    const { provider } = validation.data;

    // Update integration setting in DB
    const updated = await prisma.integrationSetting.updateMany({
      where: { provider },
      data: {
        enabled: false,
        encryptedWebhookUrl: null,
        encryptedApiToken: null,
      },
    });

    // Record Admin Audit Log
    await prisma.adminAuditLog.create({
      data: {
        adminName: 'Priya Sharma',
        action: 'REVOKE_INTEGRATION',
        targetResource: `Provider: ${provider}`,
        details: `Revoked ${provider} integration credentials and disabled webhook dispatcher across organization.`,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Revoked ${provider} integration. Credentials cleared and webhook dispatching disabled.`,
    });
  } catch (error: any) {
    console.error('[API POST /api/admin/integrations/revoke] Error:', error);
    return NextResponse.json({ error: 'Failed to revoke integration', message: error.message }, { status: 500 });
  }
}
