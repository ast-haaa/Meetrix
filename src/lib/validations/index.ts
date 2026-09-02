import { z } from 'zod';

export const CreateMeetingSchema = z.object({
  title: z.string().min(1, 'Meeting title is required').max(200),
  description: z.string().optional(),
  organizationId: z.string().optional(),
  projectId: z.string().optional(),
  scheduledAt: z.string().datetime().optional(),
  durationSeconds: z.number().int().nonnegative().optional(),
  audioUrl: z.string().url().optional(),
});

export const StoreTranscriptSchema = z.object({
  utterances: z.array(
    z.object({
      speakerLabel: z.string().min(1, 'Speaker label required'),
      speakerName: z.string().optional(),
      startTime: z.number().nonnegative(),
      endTime: z.number().nonnegative(),
      text: z.string().min(1, 'Utterance text cannot be empty'),
      sequence: z.number().int().nonnegative().optional(),
    })
  ).min(1, 'At least one utterance is required'),
});

export const CreateDecisionSchema = z.object({
  originMeetingId: z.string().min(1, 'Origin meeting ID is required'),
  projectId: z.string().optional(),
  title: z.string().min(1, 'Decision title is required').max(300),
  context: z.string().min(1, 'Decision context is required'),
  rationale: z.string().optional(),
  status: z.enum(['PROPOSED', 'ACTIVE', 'IN_PROGRESS', 'FULFILLED', 'SUPERSEDED', 'UNACTED_ALERT', 'ABANDONED']).default('ACTIVE'),
  impactScore: z.number().int().min(1).max(5).default(3),
});

export const UpdateDecisionSchema = z.object({
  title: z.string().min(1).max(300).optional(),
  context: z.string().min(1).optional(),
  rationale: z.string().optional(),
  status: z.enum(['PROPOSED', 'ACTIVE', 'IN_PROGRESS', 'FULFILLED', 'SUPERSEDED', 'UNACTED_ALERT', 'ABANDONED']).optional(),
  impactScore: z.number().int().min(1).max(5).optional(),
});

export const CreateActionItemSchema = z.object({
  meetingId: z.string().min(1, 'Meeting ID is required'),
  decisionId: z.string().optional(),
  assigneeId: z.string().optional(),
  ownerId: z.string().optional(),
  title: z.string().min(1, 'Action item title is required').max(300),
  description: z.string().optional(),
  status: z.enum(['OPEN', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'BLOCKED']).default('OPEN'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
  dueDate: z.string().datetime().optional(),
});

export const UpdateActionItemSchema = z.object({
  title: z.string().min(1).max(300).optional(),
  description: z.string().optional(),
  status: z.enum(['OPEN', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'BLOCKED']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  assigneeId: z.string().optional(),
  ownerId: z.string().optional(),
  dueDate: z.string().datetime().optional(),
});

export const CheckFollowThroughSchema = z.object({
  reviewMeetingId: z.string().min(1, 'Review meeting ID is required'),
});
