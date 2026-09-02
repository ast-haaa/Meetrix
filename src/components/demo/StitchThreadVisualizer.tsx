'use client';

import { useState } from 'react';
import { GitCommit, ArrowRight, CheckCircle2, Clock, Award, ShieldCheck, FileText } from 'lucide-react';

const STITCH_STEPS = [
  {
    id: 1,
    meeting: 'Q3 Architecture Planning Sync',
    date: 'Oct 12, 2026',
    speaker: 'Alex Rivera',
    action: 'Decision Origin: Created #DEC-104 for PostgreSQL Database Migration.',
    status: 'DECISION ORIGINATED',
    color: 'indigo',
    score: 'Pending Audit',
  },
  {
    id: 2,
    meeting: 'Sprint Retrospective & Mid-Check',
    date: 'Oct 19, 2026',
    speaker: 'Sarah Chen',
    action: 'Progress Verified: Migration scripts tested on staging. 80% tasks closed.',
    status: 'IN PROGRESS',
    color: 'amber',
    score: '80% Progress',
  },
  {
    id: 3,
    meeting: 'Executive Governance & Review',
    date: 'Oct 26, 2026',
    speaker: 'Admin User',
    action: 'Decision Closed: Fully verified in production. Reliability Score Updated.',
    status: '100% VERIFIED CLOSED',
    color: 'emerald',
    score: '+98% Reliability',
  },
];

export function StitchThreadVisualizer() {
  const [activeStep, setActiveStep] = useState<number>(0);
  const current = STITCH_STEPS[activeStep];

  return (
    <div className="glass-card-frost rounded-3xl p-6 md:p-8 space-y-6 border-white shadow-xl">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-indigo-100 pb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-100 border border-indigo-200 flex items-center justify-center text-[#4F46E5] shadow-sm">
            <GitCommit className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-sans font-bold text-[#1E1B4B]">
              Cross-Meeting Decision Stitch Timeline
            </h3>
            <p className="text-xs text-[#475569]">
              Stitches where a commitment originated to how it was reviewed or closed across subsequent team meetings.
            </p>
          </div>
        </div>

        {/* Step counter */}
        <div className="flex items-center space-x-2">
          {STITCH_STEPS.map((s, idx) => (
            <button
              key={s.id}
              onClick={() => setActiveStep(idx)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition ${
                activeStep === idx
                  ? 'btn-indigo-glow text-white shadow-md'
                  : 'bg-white border border-indigo-100 text-[#475569] hover:text-[#1E1B4B]'
              }`}
            >
              Meeting {idx + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Step Sequence Indicator Bar */}
      <div className="grid grid-cols-3 gap-3">
        {STITCH_STEPS.map((s, idx) => (
          <div
            key={s.id}
            onClick={() => setActiveStep(idx)}
            className={`p-3 rounded-2xl border cursor-pointer transition-all duration-300 ${
              activeStep === idx
                ? 'bg-indigo-50/80 border-indigo-300 ring-2 ring-indigo-200 shadow-md'
                : 'bg-white/60 border-slate-200 opacity-70 hover:opacity-100'
            }`}
          >
            <div className="flex items-center justify-between text-[11px] font-mono mb-1">
              <span className="font-bold text-[#1E1B4B]">Step 0{idx + 1}</span>
              <span className="text-[#64748B]">{s.date}</span>
            </div>
            <p className="text-xs font-sans font-bold text-[#1E1B4B] truncate">{s.meeting}</p>
          </div>
        ))}
      </div>

      {/* Detail Showcase Container */}
      <div className="p-5 rounded-2xl bg-white border border-indigo-100 space-y-4 shadow-sm animate-in fade-in duration-300">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-[#4F46E5]" />
            <span className="text-xs font-mono font-bold text-[#1E1B4B]">{current.meeting}</span>
          </div>
          <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-mono font-bold border border-emerald-200">
            {current.status}
          </span>
        </div>

        <p className="text-xs sm:text-sm text-[#1E1B4B] font-medium leading-relaxed">
          {current.action}
        </p>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs font-mono text-[#475569]">
          <div className="flex items-center space-x-2">
            <span className="text-[#64748B]">Assigned Owner:</span>
            <span className="font-bold text-[#3730A3]">{current.speaker}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Award className="w-4 h-4 text-emerald-600" />
            <span className="font-bold text-emerald-700">{current.score}</span>
          </div>
        </div>
      </div>

    </div>
  );
}
