'use client';

import { AlertTriangle, ArrowRight, Clock } from 'lucide-react';
import Link from 'next/link';
import { DecisionDTO } from '@/types';

interface UnactedAlertBannerProps {
  unactedDecisions: DecisionDTO[];
}

export function UnactedAlertBanner({ unactedDecisions }: UnactedAlertBannerProps) {
  if (unactedDecisions.length === 0) return null;

  const topAlert = unactedDecisions[0];

  return (
    <div className="relative overflow-hidden rounded-3xl bg-rose-50 border border-rose-200 p-6 shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
        <div className="flex items-start space-x-3.5">
          <div className="w-10 h-10 rounded-2xl bg-rose-100 border border-rose-300 flex items-center justify-center shrink-0 mt-0.5 text-rose-700 shadow-sm">
            <AlertTriangle className="w-5 h-5" />
          </div>

          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider bg-rose-100 text-rose-800 uppercase border border-rose-300">
                UNACTED DECISION ALERT ({unactedDecisions.length})
              </span>
              <span className="text-xs text-[#64748B] font-mono flex items-center gap-1 font-bold">
                <Clock className="w-3 h-3 text-rose-700" /> No progress recorded across 2 meetings
              </span>
            </div>

            <h4 className="text-base font-sans font-bold text-[#1E1B4B]">
              "{topAlert.title}"
            </h4>
            <p className="text-xs text-[#475569] font-mono max-w-2xl leading-relaxed font-medium">
              "{topAlert.latestFollowThrough?.evidenceText || topAlert.context}"
            </p>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center space-x-3 shrink-0">
          <Link
            href="/decisions"
            className="flex items-center space-x-2 px-4 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition shadow-sm font-sans"
          >
            <span>Assign Owner & Follow Up</span>
            <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
          </Link>
        </div>
      </div>
    </div>
  );
}
