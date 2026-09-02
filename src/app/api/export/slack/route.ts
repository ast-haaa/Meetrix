import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { decryptText } from '@/lib/crypto';
import { z } from 'zod';

const SlackPayloadSchema = z.object({
  actionItemId: z.string().optional(),
  title: z.string().min(1, 'Title required'),
  description: z.string().optional(),
  status: z.string().optional().default('COMPLETED'),
  assigneeName: z.string().optional(),
  priority: z.string().optional(),
  meetingTitle: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = SlackPayloadSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid Slack message payload', details: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { title, description, status, assigneeName, priority, meetingTitle } = validation.data;

    // Fetch decrypted Slack webhook URL from DB
    let webhookUrl: string | null = null;
    const org = await prisma.organization.findFirst();

    if (org) {
      const setting = await prisma.integrationSetting.findUnique({
        where: { organizationId_provider: { organizationId: org.id, provider: 'SLACK' } },
      });
      webhookUrl = decryptText(setting?.encryptedWebhookUrl);
    }

    // Fallback URL if none stored in DB
    const finalWebhookUrl = webhookUrl || process.env.SLACK_WEBHOOK_URL;

    if (!finalWebhookUrl) {
      console.log('[Slack Sync] No live Slack Webhook URL configured. Simulating Slack push notification...');
      return NextResponse.json({
        success: true,
        isSimulated: true,
        message: `Slack notification simulated for "${title}". Configure webhook URL in Settings to send live messages.`,
      });
    }

    // Slack Block Kit payload
    const slackMessage = {
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: `✅ Action Item ${status}: ${title}`,
            emoji: true,
          },
        },
        {
          type: 'section',
          fields: [
            { type: 'mrkdwn', text: `*Assignee:* ${assigneeName || 'Unassigned'}` },
            { type: 'mrkdwn', text: `*Priority:* ${priority || 'MEDIUM'}` },
            { type: 'mrkdwn', text: `*Meeting:* ${meetingTitle || 'Sprint Sync'}` },
            { type: 'mrkdwn', text: `*Status:* ${status}` },
          ],
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: description ? `*Details:* ${description}` : '*Details:* Task completed from meeting transcript.',
          },
        },
        {
          type: 'context',
          elements: [
            { type: 'mrkdwn', text: '⚡ *Meetrix AI Meeting-to-Action Engine* • Real-time dispatch' },
          ],
        },
      ],
    };

    // Live HTTP call to Slack Webhook API
    const res = await fetch(finalWebhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(slackMessage),
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Slack API returned ${res.status}: ${errorText}`);
    }

    return NextResponse.json({
      success: true,
      isSimulated: false,
      message: `Action item "${title}" successfully pushed to Slack channel!`,
    });
  } catch (error: any) {
    console.error('[API POST /api/export/slack] Error:', error);
    return NextResponse.json({ error: 'Failed to push Slack message', message: error.message }, { status: 500 });
  }
}
