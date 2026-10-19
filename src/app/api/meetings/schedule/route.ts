import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { MOCK_MEETINGS, MOCK_ACTION_ITEMS, MOCK_DECISIONS, MOCK_OWNERS } from '@/lib/mockData';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      title,
      description,
      team = 'Engineering',
      scheduledAt,
      durationMinutes = 45,
      locationOrLink = 'Meetrix Live Room',
      tasks = [],
    } = body;

    if (!title || !title.trim()) {
      return NextResponse.json({ error: 'Meeting title is required' }, { status: 400 });
    }

    // Check if guest user
    const sessionCookie = req.cookies.get('session_user');
    if (sessionCookie) {
      try {
        const user = JSON.parse(decodeURIComponent(sessionCookie.value));
        if (user.role === 'guest' || user.email?.includes('guest')) {
          return NextResponse.json(
            { error: 'Guest mode is view-only. Please log in to create meetings and allot work to team members.' },
            { status: 403 }
          );
        }
      } catch {}
    }

    const meetingDate = scheduledAt ? new Date(scheduledAt) : new Date(Date.now() + 2 * 60 * 60 * 1000);
    const meetingId = `mtg-${Date.now()}`;

    // 1. Try writing to Prisma SQLite database if available
    let createdMeeting: any = null;
    let targetOrgId: string | undefined;

    try {
      const defaultOrg = await prisma.organization.findFirst();
      if (defaultOrg) {
        targetOrgId = defaultOrg.id;
      } else {
        const newOrg = await prisma.organization.create({
          data: {
            name: 'Meetrix Workspace',
            slug: `workspace-${Date.now()}`,
          },
        });
        targetOrgId = newOrg.id;
      }

      createdMeeting = await prisma.meeting.create({
        data: {
          id: meetingId,
          title: title.trim(),
          description: description?.trim() || `${team} sync with ${tasks.length} explicit work allotments.`,
          scheduledAt: meetingDate,
          durationSeconds: Number(durationMinutes) * 60,
          organizationId: targetOrgId!,
          status: 'SCHEDULED',
        },
      });

      // Process work allotments / tasks
      for (let i = 0; i < tasks.length; i++) {
        const task = tasks[i];
        if (!task.title?.trim()) continue;

        const ownerName = task.ownerName?.trim() || 'Alex Rivera';
        
        // Find or create Owner
        let owner = await prisma.owner.findFirst({
          where: { organizationId: targetOrgId, name: ownerName },
        });

        if (!owner) {
          owner = await prisma.owner.create({
            data: {
              organizationId: targetOrgId!,
              name: ownerName,
              email: task.ownerEmail || `${ownerName.toLowerCase().replace(/\s+/g, '.')}@meetrix.ai`,
            },
          });
        }

        // Create Decision
        const decision = await prisma.decision.create({
          data: {
            originMeetingId: meetingId,
            title: `Work Allotment: ${task.title.trim()}`,
            context: `Assigned to ${ownerName} during "${title.trim()}". ${task.notes || ''}`.trim(),
            status: 'ACTIVE',
            impactScore: task.priority === 'URGENT' ? 5 : task.priority === 'HIGH' ? 4 : 3,
          },
        });

        // Create ActionItem
        const dueDateParsed = task.dueDate ? new Date(task.dueDate) : new Date(Date.now() + 4 * 24 * 60 * 60 * 1000);
        await prisma.actionItem.create({
          data: {
            meetingId,
            decisionId: decision.id,
            ownerId: owner.id,
            title: task.title.trim(),
            description: task.notes || `Owner: ${ownerName} • Priority: ${task.priority || 'MEDIUM'}`,
            status: 'OPEN',
            priority: task.priority || 'MEDIUM',
            dueDate: dueDateParsed,
          },
        });
      }
    } catch (dbErr: any) {
      console.warn('[API POST /api/meetings/schedule] Prisma write error, fallback to mock store:', dbErr.message);
    }

    // 2. Also update in-memory mock data so the app displays it immediately everywhere
    const newMockMeeting: any = {
      id: meetingId,
      title: title.trim(),
      description: description?.trim() || `${team} sync with ${tasks.length} work allotments.`,
      status: 'SCHEDULED',
      scheduledAt: meetingDate.toISOString(),
      durationSeconds: Number(durationMinutes) * 60,
      speakers: tasks.map((t: any, idx: number) => ({
        id: `spk-${meetingId}-${idx}`,
        speakerLabel: `Owner (${t.ownerName || 'Team'})`,
        ownerId: `owner-${t.ownerName || '1'}`,
        owner: { id: `owner-${t.ownerName}`, name: t.ownerName || 'Alex Rivera' },
      })),
      transcriptUtterances: [
        {
          id: `utt-${meetingId}-1`,
          speakerLabel: 'Meeting Lead',
          speakerName: 'Organizer',
          startTime: 0,
          endTime: 10,
          sequence: 1,
          text: `Welcome team. Today we are kicking off ${title} and assigning work allotments.`,
        },
      ],
      decisions: [],
      actionItems: [],
    };

    MOCK_MEETINGS.unshift(newMockMeeting);

    // Add mock action items
    tasks.forEach((t: any, idx: number) => {
      if (!t.title?.trim()) return;
      const ownerName = t.ownerName?.trim() || 'Alex Rivera';
      const actionId = `act-${meetingId}-${idx}`;
      const decisionId = `dec-${meetingId}-${idx}`;

      MOCK_DECISIONS.unshift({
        id: decisionId,
        originMeetingId: meetingId,
        originMeetingTitle: title.trim(),
        title: `Work Allotment: ${t.title.trim()}`,
        context: `Assigned to ${ownerName} during "${title.trim()}".`,
        rationale: 'Direct team commitment agreed during meeting scheduling.',
        status: 'ACTIVE',
        impactScore: t.priority === 'URGENT' ? 5 : t.priority === 'HIGH' ? 4 : 3,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        actionItemsCount: 1,
        followThroughCount: 0,
      });

      MOCK_ACTION_ITEMS.unshift({
        id: actionId,
        meetingId,
        meetingTitle: title.trim(),
        decisionId,
        decisionTitle: `Work Allotment: ${t.title.trim()}`,
        title: t.title.trim(),
        description: t.notes || `Assigned to ${ownerName} • Synced to ${team}`,
        status: 'OPEN',
        priority: t.priority || 'MEDIUM',
        assigneeName: ownerName,
        ownerId: `owner-${ownerName}`,
        dueDate: t.dueDate ? new Date(t.dueDate).toISOString() : new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date().toISOString(),
      });
    });

    return NextResponse.json(
      {
        success: true,
        meetingId,
        meeting: createdMeeting || newMockMeeting,
        tasksCreated: tasks.length,
        message: `Meeting "${title}" scheduled and ${tasks.length} task allotments assigned successfully.`,
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error('[API POST /api/meetings/schedule] Fatal error:', err);
    return NextResponse.json({ error: 'Failed to schedule meeting', details: err.message }, { status: 500 });
  }
}
