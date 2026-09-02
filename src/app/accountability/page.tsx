'use client';

import { useState, useEffect } from 'react';
import {
  Award,
  TrendingUp,
  TrendingDown,
  Minus,
  CheckCircle2,
  Clock,
  User,
  X,
  ChevronRight,
  ShieldCheck,
  Sparkles,
  BarChart3,
  Calendar,
} from 'lucide-react';
import { OwnerAccountabilityDTO } from '@/lib/accountabilityService';

export default function AccountabilityPage() {
  const [teamMembers, setTeamMembers] = useState<OwnerAccountabilityDTO[]>([]);
  const [selectedMember, setSelectedMember] = useState<OwnerAccountabilityDTO | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/accountability')
      .then((res) => res.json())
      .then((data) => {
        if (data.teamMembers) setTeamMembers(data.teamMembers);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-8 select-none font-sans pb-24">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-[#4338CA] text-xs font-mono font-bold uppercase tracking-wider">
            <Award className="w-3.5 h-3.5 text-emerald-600" />
            <span>TEAM EXECUTION INSIGHTS</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-sans font-extrabold text-[#1E1B4B] tracking-tight">
            Accountability & Reliability Scores
          </h1>
          <p className="text-xs text-[#475569] font-medium">
            Measures action item completion rates and follow-through trends over sequential meetings to support team throughput.
          </p>
        </div>
      </div>

      {/* Constructive Insight Banner */}
      <div className="glass-card-frost rounded-3xl p-5 border-white bg-indigo-50/60 flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-3.5">
          <div className="w-9 h-9 rounded-2xl bg-white border border-indigo-200 flex items-center justify-center text-[#4F46E5] shrink-0 shadow-sm">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-[#1E1B4B] font-mono">
              WORKFLOW & FOLLOW-THROUGH SUPPORT
            </h4>
            <p className="text-xs text-[#475569] leading-relaxed font-medium">
              Reliability metrics highlight task completion velocity across sprint meetings to help balance workloads and resolve blockers early.
            </p>
          </div>
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-mono font-bold text-[#1E1B4B] uppercase tracking-wider flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-[#4F46E5]" />
            Team Reliability Leaderboard
          </h3>
        </div>

        <div className="space-y-3">
          {teamMembers.map((member, idx) => (
            <div
              key={member.ownerId}
              onClick={() => setSelectedMember(member)}
              className="glass-card-frost rounded-3xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:border-indigo-200 transition group border-white shadow-sm hover:shadow-md"
            >
              <div className="flex items-center space-x-4">
                {/* Rank Badge */}
                <div className="w-7 h-7 rounded-xl bg-white border border-indigo-200 flex items-center justify-center text-[#3730A3] font-mono font-bold text-xs shrink-0 shadow-sm">
                  #{idx + 1}
                </div>

                {/* Avatar */}
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#3730A3] to-[#4F46E5] text-white font-extrabold text-sm flex items-center justify-center shrink-0 font-mono shadow-sm">
                  {member.name.charAt(0).toUpperCase()}
                </div>

                <div>
                  <h4 className="text-sm font-bold text-[#1E1B4B] group-hover:text-[#4F46E5] transition">
                    {member.name}
                  </h4>
                  <p className="text-xs text-[#64748B] font-mono">{member.email || 'Team Member'}</p>
                </div>
              </div>

              {/* Stats & Trend */}
              <div className="flex items-center space-x-6 sm:space-x-8">
                {/* Reliability Score */}
                <div className="text-right">
                  <span className="text-xs text-[#64748B] font-mono font-bold block text-right">Reliability</span>
                  <span
                    className={`text-lg font-extrabold font-mono ${
                      member.reliabilityPercentage >= 80
                        ? 'text-emerald-700'
                        : member.reliabilityPercentage >= 65
                        ? 'text-amber-700'
                        : 'text-[#1E1B4B]'
                    }`}
                  >
                    {member.reliabilityPercentage}%
                  </span>
                </div>

                {/* Completion Count */}
                <div className="text-right hidden sm:block">
                  <span className="text-xs text-[#64748B] font-mono font-bold block">On Time</span>
                  <span className="text-sm font-bold text-[#1E1B4B] font-mono">
                    {member.completedOnTime} / {member.totalAssigned}
                  </span>
                </div>

                {/* Trend Badge */}
                <div className="flex items-center space-x-1.5 shrink-0">
                  {member.trend === 'IMPROVING' ? (
                    <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-mono font-bold flex items-center gap-1">
                      <TrendingUp className="w-3.5 h-3.5 text-emerald-600" /> +{member.trendDelta}%
                    </span>
                  ) : member.trend === 'STABLE' ? (
                    <span className="px-2.5 py-1 rounded-full bg-indigo-50 text-[#3730A3] border border-indigo-200 text-xs font-mono font-bold flex items-center gap-1">
                      <Minus className="w-3.5 h-3.5 text-[#4F46E5]" /> Stable
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-xs font-mono font-bold flex items-center gap-1">
                      <TrendingDown className="w-3.5 h-3.5 text-amber-600" /> {member.trendDelta}%
                    </span>
                  )}
                  <ChevronRight className="w-4 h-4 text-[#64748B] group-hover:text-[#1E1B4B] transition" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Member Detail Drawer / Modal */}
      {selectedMember && (
        <div className="fixed inset-0 z-50 bg-[#1E1B4B]/30 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-card-elevated-frost w-full max-w-xl rounded-3xl p-6 space-y-6 border-white shadow-2xl relative">
            <button
              onClick={() => setSelectedMember(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-white text-[#64748B] hover:text-[#1E1B4B] shadow-sm transition"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Member Header */}
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#3730A3] to-[#4F46E5] text-white font-extrabold text-lg flex items-center justify-center shrink-0 font-mono shadow-md">
                {selectedMember.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-[#1E1B4B]">{selectedMember.name}</h3>
                <p className="text-xs text-[#64748B] font-mono">{selectedMember.email}</p>
              </div>
            </div>

            {/* Stats Summary Grid */}
            <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-white border border-indigo-100 text-center font-mono shadow-sm">
              <div>
                <span className="text-[10px] text-[#64748B] uppercase font-bold">Reliability Rate</span>
                <p className="text-xl font-extrabold text-[#4F46E5]">{selectedMember.reliabilityPercentage}%</p>
              </div>
              <div>
                <span className="text-[10px] text-[#64748B] uppercase font-bold">Total Assigned</span>
                <p className="text-xl font-extrabold text-[#1E1B4B]">{selectedMember.totalAssigned}</p>
              </div>
              <div>
                <span className="text-[10px] text-[#64748B] uppercase font-bold">Completed</span>
                <p className="text-xl font-extrabold text-emerald-700">{selectedMember.completedOnTime}</p>
              </div>
            </div>

            {/* Recent Decisions Strip */}
            <div className="space-y-2">
              <h4 className="text-xs font-mono font-bold text-[#1E1B4B] uppercase">Assigned Commitments</h4>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {(selectedMember as any).recentDecisions?.map((d: any) => (
                  <div key={d.id} className="p-3 rounded-xl bg-indigo-50/60 border border-indigo-100 text-xs flex items-center justify-between">
                    <span className="font-bold text-[#1E1B4B] truncate">{d.title}</span>
                    <span className="text-[10px] font-mono font-bold text-[#3730A3] bg-white px-2 py-0.5 rounded-full border border-indigo-200">{d.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
