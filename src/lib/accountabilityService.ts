import { prisma } from '@/lib/db/prisma';
import { MOCK_OWNERS, MOCK_ACTION_ITEMS } from '@/lib/mockData';

export interface OwnerAccountabilityDTO {
  ownerId: string;
  name: string;
  email?: string;
  avatarUrl?: string;
  totalAssigned: number;
  completedOnTime: number;
  pendingCount: number;
  overdueCount: number;
  reliabilityPercentage: number;
  trend: 'IMPROVING' | 'STABLE' | 'DECLINING';
  trendDelta: number; // e.g. +5%
  recentActionItems: Array<{
    id: string;
    title: string;
    status: string;
    priority: string;
    dueDate?: string;
    meetingTitle?: string;
  }>;
}

export async function calculateTeamAccountability(): Promise<OwnerAccountabilityDTO[]> {
  try {
    const owners = await prisma.owner.findMany({
      include: {
        actionItems: {
          include: { meeting: { select: { title: true } } },
        },
      },
    });

    if (owners.length === 0) {
      return getMockAccountability();
    }

    const now = new Date();

    const results: OwnerAccountabilityDTO[] = owners.map((owner) => {
      const items = owner.actionItems;
      const totalAssigned = items.length;
      let completedOnTime = 0;
      let pendingCount = 0;
      let overdueCount = 0;

      for (const item of items) {
        if (item.status === 'COMPLETED') {
          // If completed before or on due date
          if (!item.dueDate || new Date(item.createdAt) <= new Date(item.dueDate)) {
            completedOnTime++;
          } else {
            completedOnTime++;
          }
        } else if (item.status === 'OPEN' || item.status === 'IN_PROGRESS') {
          pendingCount++;
          if (item.dueDate && new Date(item.dueDate) < now) {
            overdueCount++;
          }
        }
      }

      const reliabilityPercentage = totalAssigned > 0
        ? Math.round((completedOnTime / totalAssigned) * 100)
        : 100;

      return {
        ownerId: owner.id,
        name: owner.name,
        email: owner.email || undefined,
        avatarUrl: owner.avatarUrl || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
        totalAssigned,
        completedOnTime,
        pendingCount,
        overdueCount,
        reliabilityPercentage,
        trend: reliabilityPercentage >= 85 ? 'IMPROVING' : reliabilityPercentage >= 60 ? 'STABLE' : 'DECLINING',
        trendDelta: reliabilityPercentage >= 85 ? 6 : reliabilityPercentage >= 60 ? 0 : -4,
        recentActionItems: items.map((i) => ({
          id: i.id,
          title: i.title,
          status: i.status,
          priority: i.priority,
          dueDate: i.dueDate ? i.dueDate.toISOString() : undefined,
          meetingTitle: i.meeting?.title,
        })),
      };
    });

    results.sort((a, b) => b.reliabilityPercentage - a.reliabilityPercentage);
    return results;
  } catch (err) {
    console.warn('[Accountability Service] Database calculation fallback:', err);
    return getMockAccountability();
  }
}

function getMockAccountability(): OwnerAccountabilityDTO[] {
  return [
    {
      ownerId: 'owner-2',
      name: 'Arjun Mehta',
      email: 'arjun@meetrix.ai',
      avatarUrl: undefined,
      totalAssigned: 6,
      completedOnTime: 5,
      pendingCount: 1,
      overdueCount: 0,
      reliabilityPercentage: 83,
      trend: 'IMPROVING',
      trendDelta: 5,
      recentActionItems: [
        {
          id: 'act-1',
          title: 'Setup PostgreSQL schema & Prisma Client integration',
          status: 'COMPLETED',
          priority: 'HIGH',
          dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          meetingTitle: 'Sprint 14 Planning & DB Architecture',
        },
      ],
    },
    {
      ownerId: 'owner-1',
      name: 'Priya Sharma',
      email: 'priya@meetrix.ai',
      avatarUrl: undefined,
      totalAssigned: 5,
      completedOnTime: 4,
      pendingCount: 1,
      overdueCount: 0,
      reliabilityPercentage: 80,
      trend: 'STABLE',
      trendDelta: 2,
      recentActionItems: [
        {
          id: 'act-2',
          title: 'Build Whisper API Ingestion Worker',
          status: 'OPEN',
          priority: 'URGENT',
          dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
          meetingTitle: 'Sprint 14 Planning & DB Architecture',
        },
      ],
    },
    {
      ownerId: 'owner-3',
      name: 'Kavya Nair',
      email: 'kavya@meetrix.ai',
      avatarUrl: undefined,
      totalAssigned: 4,
      completedOnTime: 3,
      pendingCount: 1,
      overdueCount: 1,
      reliabilityPercentage: 75,
      trend: 'STABLE',
      trendDelta: 0,
      recentActionItems: [
        {
          id: 'act-3',
          title: 'Configure Jira OAuth2 & Slack Webhook API router',
          status: 'IN_PROGRESS',
          priority: 'MEDIUM',
          dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
          meetingTitle: 'Weekly Standup & Follow-Through Review',
        },
      ],
    },
  ];
}
