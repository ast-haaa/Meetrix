import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { encryptText, decryptText, maskSecret } from '@/lib/crypto';
import { z } from 'zod';

const IntegrationConfigSchema = z.object({
  slackWebhookUrl: z.string().url('Invalid Slack Webhook URL').optional().or(z.literal('')),
  jiraHostUrl: z.string().url('Invalid Jira Host URL').optional().or(z.literal('')),
  jiraUserEmail: z.string().email('Invalid Jira User Email').optional().or(z.literal('')),
  jiraApiToken: z.string().optional().or(z.literal('')),
  enabled: z.boolean().default(true),
});

export async function GET() {
  try {
    let org = await prisma.organization.findFirst();
    if (!org) {
      return NextResponse.json({ slack: null, jira: null });
    }

    const slackSetting = await prisma.integrationSetting.findUnique({
      where: { organizationId_provider: { organizationId: org.id, provider: 'SLACK' } },
    });

    const jiraSetting = await prisma.integrationSetting.findUnique({
      where: { organizationId_provider: { organizationId: org.id, provider: 'JIRA' } },
    });

    const slackUrlDecrypted = decryptText(slackSetting?.encryptedWebhookUrl);
    const jiraHostDecrypted = decryptText(jiraSetting?.encryptedHostUrl);
    const jiraEmailDecrypted = decryptText(jiraSetting?.encryptedUserEmail);
    const jiraTokenDecrypted = decryptText(jiraSetting?.encryptedApiToken);

    return NextResponse.json({
      slack: {
        configured: Boolean(slackUrlDecrypted),
        webhookUrlMasked: maskSecret(slackUrlDecrypted),
        rawWebhookUrl: slackUrlDecrypted || '',
        enabled: slackSetting?.enabled ?? true,
      },
      jira: {
        configured: Boolean(jiraHostDecrypted && jiraTokenDecrypted),
        hostUrl: jiraHostDecrypted || 'https://meetrix-workspace.atlassian.net',
        userEmail: jiraEmailDecrypted || 'priya@meetrix.ai',
        apiTokenMasked: maskSecret(jiraTokenDecrypted),
        rawApiToken: jiraTokenDecrypted || '',
        enabled: jiraSetting?.enabled ?? true,
      },
    });
  } catch (error: any) {
    console.error('[API GET /api/settings/integrations] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch settings', message: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = IntegrationConfigSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid configuration', details: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { slackWebhookUrl, jiraHostUrl, jiraUserEmail, jiraApiToken, enabled } = validation.data;

    let org = await prisma.organization.findFirst();
    if (!org) {
      org = await prisma.organization.create({
        data: { name: 'Meetrix Workspace', slug: 'meetrix-corp' },
      });
    }

    // Save encrypted Slack credentials at rest
    if (slackWebhookUrl !== undefined) {
      await prisma.integrationSetting.upsert({
        where: { organizationId_provider: { organizationId: org.id, provider: 'SLACK' } },
        update: {
          encryptedWebhookUrl: encryptText(slackWebhookUrl),
          enabled,
        },
        create: {
          organizationId: org.id,
          provider: 'SLACK',
          encryptedWebhookUrl: encryptText(slackWebhookUrl),
          enabled,
        },
      });
    }

    // Save encrypted Jira credentials at rest
    if (jiraHostUrl !== undefined || jiraApiToken !== undefined) {
      await prisma.integrationSetting.upsert({
        where: { organizationId_provider: { organizationId: org.id, provider: 'JIRA' } },
        update: {
          encryptedHostUrl: encryptText(jiraHostUrl),
          encryptedUserEmail: encryptText(jiraUserEmail),
          encryptedApiToken: encryptText(jiraApiToken),
          enabled,
        },
        create: {
          organizationId: org.id,
          provider: 'JIRA',
          encryptedHostUrl: encryptText(jiraHostUrl),
          encryptedUserEmail: encryptText(jiraUserEmail),
          encryptedApiToken: encryptText(jiraApiToken),
          enabled,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Integration credentials saved and encrypted at rest.',
    });
  } catch (error: any) {
    console.error('[API POST /api/settings/integrations] Error:', error);
    return NextResponse.json({ error: 'Failed to save settings', message: error.message }, { status: 500 });
  }
}
