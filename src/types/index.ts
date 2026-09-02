export type MeetingStatus = 'UPLOADING' | 'PROCESSING' | 'TRANSCRIBED' | 'ANALYZED' | 'FAILED';

export type DecisionStatus = 
  | 'PROPOSED' 
  | 'ACTIVE' 
  | 'IN_PROGRESS' 
  | 'FULFILLED' 
  | 'SUPERSEDED' 
  | 'UNACTED_ALERT' 
  | 'ABANDONED';

export type ActionItemStatus = 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'BLOCKED';

export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface OwnerDTO {
  id: string;
  name: string;
  email?: string;
  avatarUrl?: string;
  userId?: string;
}

export interface MeetingSpeakerDTO {
  id: string;
  speakerLabel: string;
  ownerId?: string;
  owner?: OwnerDTO;
}

export interface TranscriptUtteranceDTO {
  id: string;
  speakerLabel?: string;
  speakerName?: string;
  startTime: number;
  endTime: number;
  text: string;
  sequence: number;
}

export interface DecisionDTO {
  id: string;
  originMeetingId: string;
  originMeetingTitle?: string;
  projectId?: string;
  title: string;
  context: string;
  rationale?: string;
  status: DecisionStatus;
  impactScore: number;
  createdAt: string;
  updatedAt: string;
  actionItemsCount?: number;
  followThroughCount?: number;
  latestFollowThrough?: FollowThroughDTO;
}

export interface ActionItemDTO {
  id: string;
  meetingId: string;
  meetingTitle?: string;
  decisionId?: string;
  decisionTitle?: string;
  assigneeName?: string;
  assigneeAvatar?: string;
  ownerId?: string;
  title: string;
  description?: string;
  status: ActionItemStatus;
  priority: Priority;
  dueDate?: string;
  createdAt: string;
}

export interface FollowThroughDTO {
  id: string;
  decisionId: string;
  decisionTitle?: string;
  reviewMeetingId: string;
  reviewMeetingTitle?: string;
  statusAtReview: DecisionStatus;
  evidenceText?: string;
  confidenceScore: number;
  flaggedUnacted: boolean;
  createdAt: string;
}

export interface MeetingDTO {
  id: string;
  title: string;
  description?: string;
  status: MeetingStatus;
  scheduledAt: string;
  durationSeconds: number;
  audioUrl?: string;
  speakers: MeetingSpeakerDTO[];
  transcriptUtterances: TranscriptUtteranceDTO[];
  decisions: DecisionDTO[];
  actionItems: ActionItemDTO[];
}
