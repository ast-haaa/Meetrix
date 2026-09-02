'use client';

import { useState } from 'react';
import {
  Sparkles,
  GitCommit,
  CheckSquare,
  Search,
  Loader2,
  Bookmark,
  User,
  Star,
} from 'lucide-react';
import { DecisionDTO, ActionItemDTO } from '@/types';

const PRESET_TOPIC_TAGS = [
  'Database Migration',
  'Whisper Integration',
  'Pricing Strategy',
  'Slack & Jira Sync',
];

export function PreMeetingBriefingCard() {
  const [selectedTopic, setSelectedTopic] = useState('Database Migration');
  const [customTopic, setCustomTopic] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [briefingData, setBriefingData] = useState<{
    standingSummary: string;
    pastDecisions: DecisionDTO[];
    pendingActionItems: ActionItemDTO[];
  } | null>({
    standingSummary:
      'The team previously decided to migrate the core database from MongoDB to PostgreSQL using Prisma ORM for relational type safety and multi-tenant schema isolation. Setup of the PostgreSQL schema was completed by Arjun Mehta, but cross-meeting decision tracking workers remain in progress.',
    pastDecisions: [
      {
        id: 'dec-1',
        originMeetingId: 'mtg-101',
        originMeetingTitle: 'Sprint 14 Planning & DB Architecture',
        title: 'Migrate core database to PostgreSQL + Prisma ORM',
        context: 'Evaluated MongoDB vs PostgreSQL for structural type safety and multi-tenant schema isolation.',
        status: 'FULFILLED',
        impactScore: 5,
        createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'dec-2',
        originMeetingId: 'mtg-101',
        originMeetingTitle: 'Sprint 14 Planning & DB Architecture',
        title: 'Implement Whisper API + Speaker Diarization Ingestion Pipeline',
        context: 'Automate speech-to-text transcript processing with automatic speaker attribution to eliminate manual meeting notes.',
        status: 'UNACTED_ALERT',
        impactScore: 4,
        createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'dec-3',
        originMeetingId: 'mtg-101',
        originMeetingTitle: 'Sprint 14 Planning & DB Architecture',
        title: 'Integrate Slack & Jira Webhooks for Ticket Auto-Dispatch',
        context: 'Automatically dispatch extracted action items directly to team Jira backlogs and send Slack notifications.',
        status: 'ACTIVE',
        impactScore: 3,
        createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ],
    pendingActionItems: [
      {
        id: 'act-2',
        meetingId: 'mtg-101',
        meetingTitle: 'Sprint 14 Planning & DB Architecture',
        title: 'Build Whisper API Ingestion Worker',
        description: 'Integrate audio upload endpoint and async transcription pipeline.',
        status: 'OPEN',
        priority: 'URGENT',
        assigneeName: 'Priya Sharma',
        assigneeAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'act-3',
        meetingId: 'mtg-101',
        meetingTitle: 'Sprint 14 Planning & DB Architecture',
        title: 'Configure Jira OAuth2 & Slack Webhook API router',
        description: 'Build backend API routes in /src/app/api/export/jira for payload transformation.',
        status: 'OPEN',
        priority: 'MEDIUM',
        assigneeName: 'Kavya Nair',
        assigneeAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ],
  });

  const fetchBriefing = async (topicToFetch: string) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/meetings/briefing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: topicToFetch }),
      });

      const data = await res.json();
      if (data.success) {
        setBriefingData({
          standingSummary: data.standingSummary,
          pastDecisions: data.pastDecisions || [],
          pendingActionItems: data.pendingActionItems || [],
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectTag = (tag: string) => {
    setSelectedTopic(tag);
    setCustomTopic('');
    fetchBriefing(tag);
  };

  const handleCustomSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTopic.trim()) return;
    setSelectedTopic(customTopic);
    fetchBriefing(customTopic);
  };

  return (
    <div className="glass-card-elevated-frost rounded-3xl p-6 sm:p-8 space-y-7 select-none border-white shadow-md">
      {/* Clean Executive Header */}
      <div className="space-y-4 pb-6 border-b border-indigo-100">
        <div className="flex items-center space-x-2 text-[#4338CA] text-xs font-mono font-bold uppercase tracking-wider">
          <Sparkles className="w-4 h-4 text-[#4F46E5]" />
          <span>PRE-MEETING EXECUTIVE BRIEFING</span>
        </div>
        
        <div>
          <h2 className="text-xl sm:text-2xl font-sans font-extrabold text-[#1E1B4B]">
            Topic Briefing Card
          </h2>
          <p className="text-xs sm:text-sm text-[#475569] font-medium leading-relaxed mt-1 max-w-3xl">
            Generate an instant context card before your next meeting with past decisions, pending actions, and current status.
          </p>
        </div>

        {/* Topic Selector Chips */}
        <div className="pt-2 flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-mono text-[#64748B] font-bold uppercase tracking-wider mr-1">
            Topics:
          </span>
          {PRESET_TOPIC_TAGS.map((tag) => (
            <button
              key={tag}
              onClick={() => handleSelectTag(tag)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold transition ${
                selectedTopic === tag
                  ? 'btn-indigo-glow text-white shadow-sm'
                  : 'bg-white border border-indigo-200 text-[#475569] hover:text-[#1E1B4B] hover:bg-indigo-50/50'
              }`}
            >
              #{tag}
            </button>
          ))}
        </div>
      </div>

      {/* Custom Topic Search */}
      <form onSubmit={handleCustomSearch} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Type custom topic or tag (e.g. 'Authentication', 'S3 Presigned URLs')..."
            value={customTopic}
            onChange={(e) => setCustomTopic(e.target.value)}
            className="w-full bg-white border border-indigo-200 rounded-2xl pl-10 pr-4 py-3 text-xs text-[#1E1B4B] placeholder-[#64748B] focus:outline-none focus:border-[#4F46E5] font-sans font-medium shadow-sm"
          />
        </div>
        <button
          type="submit"
          disabled={!customTopic.trim() || isLoading}
          className="px-6 py-3 rounded-2xl btn-indigo-glow disabled:opacity-50 text-white text-xs font-sans font-bold transition shrink-0 shadow-sm"
        >
          Generate Briefing
        </button>
      </form>

      {/* Briefing Output Body */}
      {isLoading ? (
        <div className="py-12 flex items-center justify-center space-x-2 text-xs text-[#4338CA] font-mono font-bold">
          <Loader2 className="w-5 h-5 animate-spin text-[#4F46E5]" />
          <span>Retrieving semantic vector embeddings & generating briefing...</span>
        </div>
      ) : briefingData ? (
        <div className="space-y-7 pt-1">
          {/* Standing Summary Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-50/80 via-white to-indigo-50/30 border border-indigo-100 border-l-4 border-l-[#4F46E5] space-y-2.5 shadow-sm">
            <div className="flex items-center justify-between text-xs font-mono font-bold text-[#4338CA] uppercase tracking-wider">
              <span className="flex items-center gap-2">
                <Bookmark className="w-4 h-4 text-[#4F46E5]" />
                <span>HERE'S WHERE THINGS STAND</span>
              </span>
              <span className="text-[#3730A3] text-[11px] font-mono font-bold bg-white px-3 py-1 rounded-lg border border-indigo-200 shadow-2xs">
                TOPIC: #{selectedTopic.toUpperCase()}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#1E1B4B] leading-relaxed font-sans font-medium">
              {briefingData.standingSummary}
            </p>
          </div>

          {/* Past Decisions & Pending Actions Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-7 items-start">
            {/* Past Decisions Column */}
            <div className="space-y-3.5">
              <div className="flex items-center justify-between border-b border-indigo-100 pb-2">
                <h4 className="text-xs font-mono font-bold text-[#3730A3] uppercase tracking-wider flex items-center gap-1.5">
                  <GitCommit className="w-4 h-4 text-[#4F46E5]" /> Past Decisions ({briefingData.pastDecisions.length})
                </h4>
              </div>

              {briefingData.pastDecisions.length === 0 ? (
                <p className="text-xs text-[#64748B] font-mono italic p-4 bg-white rounded-2xl border border-indigo-100">
                  No past decisions recorded for this topic.
                </p>
              ) : (
                briefingData.pastDecisions.map((dec) => (
                  <div
                    key={dec.id}
                    className="p-5 rounded-2xl bg-white border border-indigo-100 space-y-2.5 shadow-sm hover:border-indigo-300 hover:shadow-md transition duration-200"
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase border ${
                          dec.status === 'FULFILLED'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : dec.status === 'UNACTED_ALERT'
                            ? 'bg-rose-50 text-rose-800 border-rose-200'
                            : 'bg-amber-50 text-amber-800 border-amber-200'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            dec.status === 'FULFILLED'
                              ? 'bg-emerald-500'
                              : dec.status === 'UNACTED_ALERT'
                              ? 'bg-rose-500'
                              : 'bg-amber-500'
                          }`}
                        />
                        {dec.status}
                      </span>
                      <span className="text-[11px] text-[#64748B] font-mono font-bold flex items-center gap-1">
                        <Star className="w-3 h-3 text-amber-500 fill-amber-400" />
                        Impact: {dec.impactScore}/5
                      </span>
                    </div>
                    <h5 className="text-xs sm:text-sm font-bold text-[#1E1B4B] leading-snug">{dec.title}</h5>
                    <p className="text-xs text-[#475569] leading-relaxed font-normal">{dec.context}</p>
                  </div>
                ))
              )}
            </div>

            {/* Pending Action Items Column */}
            <div className="space-y-3.5">
              <div className="flex items-center justify-between border-b border-indigo-100 pb-2">
                <h4 className="text-xs font-mono font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckSquare className="w-4 h-4 text-emerald-600" /> Pending Action Items ({briefingData.pendingActionItems.length})
                </h4>
              </div>

              {briefingData.pendingActionItems.length === 0 ? (
                <p className="text-xs text-[#64748B] font-mono italic p-4 bg-white rounded-2xl border border-indigo-100">
                  No pending action items for this topic.
                </p>
              ) : (
                briefingData.pendingActionItems.map((act) => (
                  <div
                    key={act.id}
                    className="p-5 rounded-2xl bg-white border border-indigo-100 space-y-2.5 shadow-sm hover:border-emerald-300 hover:shadow-md transition duration-200"
                  >
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase bg-amber-50 text-amber-800 border border-amber-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                        {act.priority}
                      </span>
                      <span className="text-[11px] text-[#64748B] font-mono font-bold flex items-center gap-1">
                        <User className="w-3 h-3 text-[#4F46E5]" />
                        {act.assigneeName}
                      </span>
                    </div>
                    <h5 className="text-xs sm:text-sm font-bold text-[#1E1B4B] leading-snug">{act.title}</h5>
                    <p className="text-xs text-[#475569] leading-relaxed font-normal">{act.description}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
