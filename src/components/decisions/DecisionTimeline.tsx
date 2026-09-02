'use client';

import { DecisionDTO, FollowThroughDTO } from '@/types';
import { GitCommit, Calendar, AlertTriangle, CheckCircle2, ArrowRight, ShieldAlert, Clock } from 'lucide-react';

interface DecisionTimelineProps {
  decision: DecisionDTO;
}

export function DecisionTimeline({ decision }: DecisionTimelineProps) {
  const isStale = decision.status === 'UNACTED_ALERT';

  return (
    <div className="glass-card-frost rounded-3xl p-6 space-y-6 border-white shadow-md select-none font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-indigo-100">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span
              className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider font-mono border ${
                isStale
                  ? 'bg-rose-50 text-rose-800 border-rose-200'
                  : decision.status === 'FULFILLED'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-amber-50 text-amber-800 border-amber-200'
              }`}
            >
              {decision.status.replace('_', ' ')}
            </span>
            <span className="text-xs text-[#64748B] font-mono font-bold">
              Decision ID: #{decision.id.substring(0, 8)}
            </span>
          </div>

          <h3 className="text-lg font-extrabold text-[#1E1B4B]">{decision.title}</h3>
          <p className="text-xs text-[#475569] max-w-2xl font-medium">{decision.context}</p>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <span className="text-xs font-bold text-[#64748B] font-mono">Impact Score:</span>
          <span className="px-3 py-1 rounded-full bg-indigo-50 text-[#3730A3] border border-indigo-200 font-mono font-bold text-xs">
            {decision.impactScore}/5
          </span>
        </div>
      </div>

      {/* Sequential Timeline Nodes */}
      <div className="relative pl-6 space-y-8 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-indigo-200">
        {/* Node 1: Origin Meeting */}
        <div className="relative group">
          <div className="absolute -left-6 top-1.5 w-3.5 h-3.5 rounded-full bg-white border-2 border-[#4F46E5] ring-4 ring-indigo-50" />

          <div className="space-y-1.5">
            <div className="flex items-center space-x-2 text-xs">
              <span className="font-bold text-[#4338CA] font-mono uppercase tracking-wider text-[11px]">
                ORIGIN MEETING
              </span>
              <span className="text-[#64748B]">•</span>
              <span className="text-[#64748B] font-mono font-bold" suppressHydrationWarning>
                {new Date(decision.createdAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
            </div>

            <h4 className="text-sm font-bold text-[#1E1B4B]">{decision.originMeetingTitle}</h4>
            <p className="text-xs text-[#475569] font-medium">
              Decision established during transcript discussion: "{decision.rationale || decision.context}"
            </p>
          </div>
        </div>

        {/* Node 2: Follow-Through Review (Stale / Flagged Alert) */}
        {decision.latestFollowThrough ? (
          <div className="relative group">
            <div
              className={`absolute -left-6 top-1.5 w-3.5 h-3.5 rounded-full bg-white border-2 ring-4 ${
                decision.latestFollowThrough.flaggedUnacted
                  ? 'border-rose-600 ring-rose-100 animate-pulse'
                  : 'border-emerald-600 ring-emerald-100'
              }`}
            />

            <div className="p-4 rounded-2xl bg-white border border-indigo-100 space-y-2 shadow-sm">
              <div className="flex items-center justify-between text-xs">
                <span
                  className={`font-bold font-mono uppercase tracking-wider text-[11px] flex items-center gap-1.5 ${
                    decision.latestFollowThrough.flaggedUnacted ? 'text-rose-700' : 'text-emerald-700'
                  }`}
                >
                  {decision.latestFollowThrough.flaggedUnacted ? (
                    <>
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-600" /> STALE / UNACTED ALERT
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> FOLLOW-THROUGH VERIFIED
                    </>
                  )}
                </span>
                <span className="text-[#64748B] font-mono font-bold">
                  AI Confidence: {Math.round(decision.latestFollowThrough.confidenceScore * 100)}%
                </span>
              </div>

              <h4 className="text-sm font-bold text-[#1E1B4B]">
                Reviewed in: {decision.latestFollowThrough.reviewMeetingTitle}
              </h4>
              <p className="text-xs text-[#1E1B4B] font-mono leading-relaxed bg-indigo-50/50 p-3 rounded-xl border border-indigo-100 font-medium">
                "{decision.latestFollowThrough.evidenceText}"
              </p>
            </div>
          </div>
        ) : (
          <div className="relative group">
            <div className="absolute -left-6 top-1.5 w-3.5 h-3.5 rounded-full bg-white border-2 border-indigo-300 ring-4 ring-indigo-50" />
            <div className="text-xs text-[#64748B] font-mono font-bold">
              Pending review in upcoming meeting...
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
