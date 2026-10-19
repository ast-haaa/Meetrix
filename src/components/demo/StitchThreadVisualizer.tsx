'use client';

import { useState } from 'react';
import { GitCommit, CheckCircle2, Clock, Award, ShieldCheck, RefreshCw, Calendar, User } from 'lucide-react';

const STITCH_STEPS = [
  {
    id: 1,
    meeting: 'Q3 Architecture Planning Sync',
    date: 'Oct 12, 2026',
    speaker: 'Alex Rivera',
    role: 'Product Lead • Speaker 0',
    quote: "Alex Rivera created #DEC-104: 'I will take ownership of the PostgreSQL database schema migration with zero downtime by Friday.'",
    action: 'Decision Origin: Created #DEC-104 for PostgreSQL Database Migration to decouple schemas.',
    status: 'DECISION ORIGINATED',
    score: 'Pending Audit',
    velocity: 'Day 0 of SLA',
  },
  {
    id: 2,
    meeting: 'Sprint Retrospective & Mid-Check',
    date: 'Oct 19, 2026',
    speaker: 'Sarah Chen',
    role: 'Lead Architect • Speaker 1',
    quote: "Sarah Chen confirmed: 'Database migration scripts tested on staging cluster with 100% pass rate. 80% tasks closed.'",
    action: 'Progress Verified: Migration scripts tested on staging with zero data loss. 80% tasks closed.',
    status: 'IN PROGRESS • 80%',
    score: '80% Progress',
    velocity: 'Day 7 of SLA',
  },
  {
    id: 3,
    meeting: 'Executive Governance & Review',
    date: 'Oct 26, 2026',
    speaker: 'Admin User',
    role: 'Executive Chair • Speaker 2',
    quote: "Admin User signed off: 'PostgreSQL migration verified live in production. Zero incident alerts reported.'",
    action: 'Decision Closed: Fully verified in production. Owner Reliability Score updated to +98%.',
    status: '100% VERIFIED CLOSED',
    score: '+98% Reliability',
    velocity: '2.4 Days Resolution',
  },
];

export function StitchThreadVisualizer() {
  const [activeStep, setActiveStep] = useState<number>(0);
  const current = STITCH_STEPS[activeStep];

  return (
    <div className="w-full glass-card-elevated-frost rounded-3xl p-5 sm:p-7 md:p-8 border-white shadow-[0_40px_100px_rgba(79,70,229,0.15)] relative overflow-hidden text-left">
      {/* Top Traffic Lights Header Bar */}
      <div className="flex items-center justify-between pb-4 border-b border-indigo-100 mb-6">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-rose-400" />
          <div className="w-3 h-3 rounded-full bg-amber-400" />
          <div className="w-3 h-3 rounded-full bg-emerald-400" />
          <span className="text-xs font-mono font-bold text-[#4338CA] ml-2">
            Meetrix Cross-Meeting Stitch Engine
          </span>
        </div>

        <div className="flex items-center space-x-2">
          {STITCH_STEPS.map((s, idx) => (
            <button
              key={s.id}
              onClick={() => setActiveStep(idx)}
              className={`px-2.5 py-1 rounded-xl text-[11px] font-mono font-bold transition ${
                activeStep === idx
                  ? 'btn-indigo-glow text-white shadow-sm'
                  : 'bg-white/80 border border-indigo-100 text-[#475569] hover:text-[#1E1B4B]'
              }`}
            >
              Meeting {idx + 1}
            </button>
          ))}
          <button
            onClick={() => setActiveStep((prev) => (prev + 1) % 3)}
            className="text-xs font-mono font-bold text-[#4F46E5] hover:text-[#3730A3] flex items-center gap-1 transition ml-1"
          >
            <RefreshCw className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Step Sequence Indicator */}
      <div className="grid grid-cols-3 gap-2 mb-6">
        <div
          className={`h-1.5 rounded-full transition-all duration-500 ${
            activeStep >= 0 ? 'bg-[#4F46E5]' : 'bg-indigo-100'
          }`}
        />
        <div
          className={`h-1.5 rounded-full transition-all duration-500 ${
            activeStep >= 1 ? 'bg-[#4F46E5]' : 'bg-indigo-100'
          }`}
        />
        <div
          className={`h-1.5 rounded-full transition-all duration-500 ${
            activeStep >= 2 ? 'bg-[#4F46E5]' : 'bg-indigo-100'
          }`}
        />
      </div>

      {/* Main 50/50 Symmetrical Two-Stage Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
        {/* Left Stage: Sequential Meeting Audio Context */}
        <div className="space-y-3 flex flex-col justify-between h-full">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold text-[#4338CA] uppercase tracking-wider flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-[#4F46E5]" />
              1. SEQUENTIAL MEETING AUDIO CONTEXT
            </span>
            <div className="flex items-center space-x-1.5 text-xs text-emerald-700 font-mono font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              <span>{current.date}</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-indigo-100 shadow-sm flex-1 flex flex-col justify-between space-y-4 min-h-[240px]">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-7 h-7 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-[#4F46E5]">
                    <GitCommit className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-xs font-sans font-bold text-[#1E1B4B] block leading-tight">
                      {current.meeting}
                    </span>
                    <span className="text-[10px] font-mono text-[#64748B]">
                      {current.role}
                    </span>
                  </div>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase bg-indigo-50 text-[#3730A3] border border-indigo-200">
                  Step 0{activeStep + 1}
                </span>
              </div>

              <p className="text-xs font-sans text-[#1E1B4B] leading-relaxed pl-3.5 border-l-2 border-[#4F46E5] font-medium bg-slate-50/70 p-2.5 rounded-r-xl">
                {current.quote}
              </p>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-indigo-100 text-xs font-sans text-[#64748B]">
              <span className="text-[10px] font-mono font-semibold text-[#475569]">
                Speaker: {current.speaker}
              </span>
              <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                Audit Trail Logged
              </span>
            </div>
          </div>
        </div>

        {/* Right Stage: Cross-Meeting Decision Audit Stitch */}
        <div className="space-y-3 flex flex-col justify-between h-full">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              2. CROSS-MEETING AUDIT STITCH
            </span>
            <span className="text-[10px] font-mono text-[#64748B] font-bold">
              {current.velocity}
            </span>
          </div>

          <div className="rounded-2xl p-5 border border-[#4F46E5] bg-white shadow-lg flex-1 flex flex-col justify-between space-y-4 min-h-[240px]">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase bg-indigo-50 text-[#3730A3] border border-indigo-200">
                  THREAD #STITCH-104
                </span>
                <span className="text-xs font-mono font-bold text-emerald-700 flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-emerald-600" /> {current.score}
                </span>
              </div>

              <div className="space-y-1">
                <h4 className="text-sm font-sans font-bold text-[#1E1B4B]">
                  Decision Lifecycle Resolution
                </h4>
                <p className="text-xs font-sans text-[#475569] font-medium leading-relaxed bg-slate-50/70 p-2.5 rounded-xl border border-slate-100">
                  {current.action}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-indigo-100 text-xs font-sans text-[#64748B]">
              <div className="flex items-center space-x-2">
                <User className="w-3.5 h-3.5 text-[#4F46E5]" />
                <span className="font-bold text-[#1E1B4B]">Owner: Alex Rivera</span>
              </div>
              <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                {current.status}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
