import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding SQLite database with sample meeting and decision data...');

  // Clear previous sample data to support idempotent re-seeding
  await prisma.followThroughTracking.deleteMany();
  await prisma.actionItem.deleteMany();
  await prisma.decision.deleteMany();
  await prisma.transcriptUtterance.deleteMany();
  await prisma.meetingSpeaker.deleteMany();
  await prisma.meeting.deleteMany();
  await prisma.owner.deleteMany();
  await prisma.project.deleteMany();

  // 1. Create Organization
  const org = await prisma.organization.upsert({
    where: { slug: 'acme-corp' },
    update: {},
    create: {
      name: 'Acme AI Engineering',
      slug: 'acme-corp',
    },
  });

  // 2. Create Users
  const user1 = await prisma.user.upsert({
    where: { email: 'sarah@acme.ai' },
    update: {},
    create: {
      email: 'sarah@acme.ai',
      name: 'Sarah Connor',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    },
  });

  const user2 = await prisma.user.upsert({
    where: { email: 'alex@acme.ai' },
    update: {},
    create: {
      email: 'alex@acme.ai',
      name: 'Alex Rivera',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    },
  });

  // 3. UserOrganization
  await prisma.userOrganization.upsert({
    where: { userId_organizationId: { userId: user1.id, organizationId: org.id } },
    update: {},
    create: { userId: user1.id, organizationId: org.id, role: 'ADMIN' },
  });

  await prisma.userOrganization.upsert({
    where: { userId_organizationId: { userId: user2.id, organizationId: org.id } },
    update: {},
    create: { userId: user2.id, organizationId: org.id, role: 'MEMBER' },
  });

  // 4. Project
  const project = await prisma.project.create({
    data: {
      name: 'Q3 Product Architecture & Launch',
      description: 'Cross-functional engineering and product strategy syncs',
      organizationId: org.id,
    },
  });

  // 5. Owners / Speakers
  const owner1 = await prisma.owner.create({
    data: {
      organizationId: org.id,
      userId: user1.id,
      name: 'Sarah Connor',
      email: 'sarah@acme.ai',
    },
  });

  const owner2 = await prisma.owner.create({
    data: {
      organizationId: org.id,
      userId: user2.id,
      name: 'Alex Rivera',
      email: 'alex@acme.ai',
    },
  });

  // 6. Meeting 1: Planning
  const meeting1 = await prisma.meeting.create({
    data: {
      organizationId: org.id,
      projectId: project.id,
      title: 'Sprint 14 Planning & DB Architecture',
      description: 'Discussing database migration, API specs, and deployment timelines.',
      durationSeconds: 1800,
      status: 'ANALYZED',
      scheduledAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    },
  });

  const m1Speaker1 = await prisma.meetingSpeaker.create({
    data: { meetingId: meeting1.id, speakerLabel: 'Speaker 0 (Sarah)', ownerId: owner1.id },
  });
  const m1Speaker2 = await prisma.meetingSpeaker.create({
    data: { meetingId: meeting1.id, speakerLabel: 'Speaker 1 (Alex)', ownerId: owner2.id },
  });

  await prisma.transcriptUtterance.createMany({
    data: [
      {
        meetingId: meeting1.id,
        speakerId: m1Speaker1.id,
        startTime: 0.0,
        endTime: 12.5,
        sequence: 1,
        text: "Let's align on our storage strategy. We agreed last week to move from MongoDB to PostgreSQL using Prisma ORM for type safety.",
      },
      {
        meetingId: meeting1.id,
        speakerId: m1Speaker2.id,
        startTime: 13.0,
        endTime: 25.4,
        sequence: 2,
        text: "Agreed. I will set up the PostgreSQL schema and configure multi-tenant workspace isolation by Friday.",
      },
      {
        meetingId: meeting1.id,
        speakerId: m1Speaker1.id,
        startTime: 26.0,
        endTime: 40.0,
        sequence: 3,
        text: "Also, we decided to integrate Whisper API with speaker diarization so we can automatically identify who agreed to what action item.",
      },
    ],
  });

  const decision1 = await prisma.decision.create({
    data: {
      originMeetingId: meeting1.id,
      projectId: project.id,
      title: 'Migrate core database to PostgreSQL + Prisma ORM',
      context: 'Team evaluated MongoDB vs PostgreSQL and selected Postgres for ACID compliance and Prisma type-safety.',
      rationale: 'Prevents data drift across multi-tenant workspaces.',
      status: 'FULFILLED',
      impactScore: 5,
    },
  });

  const decision2 = await prisma.decision.create({
    data: {
      originMeetingId: meeting1.id,
      projectId: project.id,
      title: 'Implement Whisper API + Speaker Diarization for ingestion',
      context: 'Automate transcript ingestion with speaker attribution to assign action items accurately.',
      rationale: 'Saves 4+ hours per week of manual transcript editing.',
      status: 'UNACTED_ALERT',
      impactScore: 4,
    },
  });

  await prisma.actionItem.create({
    data: {
      meetingId: meeting1.id,
      decisionId: decision1.id,
      assigneeId: user2.id,
      ownerId: owner2.id,
      creatorId: user1.id,
      title: 'Setup PostgreSQL schema & multi-tenant isolation',
      description: 'Configure Prisma models for Org, User, Meeting, and TranscriptUtterance.',
      status: 'COMPLETED',
      priority: 'HIGH',
      dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.actionItem.create({
    data: {
      meetingId: meeting1.id,
      decisionId: decision2.id,
      assigneeId: user1.id,
      ownerId: owner1.id,
      creatorId: user2.id,
      title: 'Build Whisper API Ingestion Worker',
      description: 'Integrate audio upload endpoint and async transcription pipeline.',
      status: 'OPEN',
      priority: 'URGENT',
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    },
  });

  // 7. Meeting 2: Review Sync
  const meeting2 = await prisma.meeting.create({
    data: {
      organizationId: org.id,
      projectId: project.id,
      title: 'Weekly Standup & Follow-Through Review',
      description: 'Reviewing progress on DB migration and AI pipeline.',
      durationSeconds: 1200,
      status: 'ANALYZED',
      scheduledAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.followThroughTracking.create({
    data: {
      decisionId: decision2.id,
      reviewMeetingId: meeting2.id,
      statusAtReview: 'UNACTED_ALERT',
      evidenceText: 'Transcript analysis indicates no mention of Whisper API integration work or pull requests submitted in Meeting 2.',
      confidenceScore: 0.92,
      flaggedUnacted: true,
    },
  });

  console.log('Database pushed & seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
