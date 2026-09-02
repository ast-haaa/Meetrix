'use client';

import { DecisionDTO } from '@/types';
import { ArrowDown } from 'lucide-react';

interface ConnectedThreadTrailProps {
  decisions: DecisionDTO[];
}

export function ConnectedThreadTrail({ decisions }: ConnectedThreadTrailProps) {
  return (
    <div className="glass-card-frost rounded-3xl p-6 space-y-6 border-white shadow-md">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-indigo-100">
        <div className="space-y-0.5">
          <span className="text-[10px] font-mono font-bold text-[#4338CA] uppercase tracking-wider block">
            CROSS-MEETING TIMELINE
          </span>
          <h3 className="text-base font-sans font-extrabold text-[#1E1B4B]">
            Decision History Across Meetings
          </h3>
          <p className="text-xs font-sans text-[#475569] font-medium">
            Visible stitch lines connecting where a decision was originally made to how it was evaluated in later meetings.
          </p>
        </div>
        <span className="px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-[11px] font-mono font-bold text-[#3730A3]">
          2 Linked Decisions
        </span>
      </div>

      {/* Thread Trails */}
      <div className="space-y-6">
        {decisions.map((decision) => {
          const isStale = decision.status === 'UNACTED_ALERT';
          const isFulfilled = decision.status === 'FULFILLED';

          return (
            <div key={decision.id} className="relative pl-6 space-y-4">
              {/* Vertical Thread Line Stitch */}
              <div
                className={`absolute left-2.5 top-3 bottom-3 w-0.5 border-l-2 border-dashed ${
                  isStale ? 'border-rose-500' : isFulfilled ? 'border-emerald-500' : 'border-[#4F46E5]'
                }`}
              />

              {/* Origin Card */}
              <div className="bg-white rounded-2xl p-4 space-y-2 relative border border-indigo-100 shadow-sm">
                <div className="absolute -left-[23px] top-4 w-3 h-3 rounded-full bg-white border-2 border-[#4F46E5]" />
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-[#4338CA] font-bold uppercase tracking-wider text-[10px]">
                    ORIGIN MEETING • {decision.originMeetingTitle}
                  </span>
                  <span className="text-[#64748B]" suppressHydrationWarning>
                    {new Date(decision.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
                <h4 className="text-sm font-sans font-bold text-[#1E1B4B]">"{decision.title}"</h4>
                <p className="text-xs font-sans text-[#475569] leading-relaxed font-medium">{decision.context}</p>
              </div>

              {/* Thread Connector Arrow Indicator */}
              <div className="flex items-center space-x-2 pl-2 text-xs font-mono text-[#64748B]">
                <ArrowDown className="w-3.5 h-3.5 text-[#4F46E5]" />
                <span className="text-[10px] uppercase font-bold tracking-wider">
                  Cross-Meeting Thread ({isStale ? 'STALE ALERT IN CRIMSON' : 'FULFILLED'})
                </span>
              </div>

              {/* Current Status Card */}
              {decision.latestFollowThrough ? (
                <div
                  className={`rounded-2xl p-4 space-y-2 border relative shadow-sm ${
                    isStale
                      ? 'bg-rose-50 border-rose-200 text-rose-900'
                      : 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  }`}
                >
                  <div
                    className={`absolute -left-[23px] top-4 w-3 h-3 rounded-full bg-white border-2 ${
                      isStale ? 'border-rose-600' : 'border-emerald-600'
                    }`}
                  />
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="font-bold uppercase tracking-wider text-[10px]">
                      REVIEW MEETING • {decision.latestFollowThrough.reviewMeetingTitle}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                        isStale
                          ? 'bg-rose-100 text-rose-800 border border-rose-300'
                          : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      }`}
                    >
                      {decision.latestFollowThrough.statusAtReview.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-xs font-sans text-[#1E1B4B] leading-relaxed bg-white p-3 rounded-xl border border-indigo-100 font-medium">
                    "{decision.latestFollowThrough.evidenceText}"
                  </p>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
