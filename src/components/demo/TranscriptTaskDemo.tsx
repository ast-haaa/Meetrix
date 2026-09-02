'use client';

import { useState, useEffect } from 'react';
import { Play, CheckCircle2, User, Calendar, ArrowRight, RefreshCw, Volume2 } from 'lucide-react';

export function TranscriptTaskDemo() {
  const [step, setStep] = useState<number>(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setStep((prev) => (prev + 1) % 3);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto glass-card-frost rounded-3xl p-6 md:p-8 border-white shadow-xl relative overflow-hidden">
      {/* Header bar */}
      <div className="flex items-center justify-between pb-4 border-b border-indigo-100 mb-6">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-rose-400" />
          <div className="w-3 h-3 rounded-full bg-amber-400" />
          <div className="w-3 h-3 rounded-full bg-emerald-400" />
          <span className="text-xs font-mono font-bold text-[#4338CA] ml-2">Meetrix Decision Extraction Pipeline v2.4</span>
        </div>

        <button
          onClick={() => setStep((prev) => (prev + 1) % 3)}
          className="text-xs font-mono font-bold text-[#4F46E5] hover:text-[#3730A3] flex items-center gap-1.5 transition"
        >
          <RefreshCw className="w-3 h-3" />
          <span>Step {step + 1} of 3</span>
        </button>
      </div>

      {/* Step Sequence Indicator */}
      <div className="grid grid-cols-3 gap-2 mb-6">
        <div
          className={`h-1.5 rounded-full transition-all duration-500 ${
            step >= 0 ? 'bg-[#4F46E5]' : 'bg-indigo-100'
          }`}
        />
        <div
          className={`h-1.5 rounded-full transition-all duration-500 ${
            step >= 1 ? 'bg-[#4F46E5]' : 'bg-indigo-100'
          }`}
        />
        <div
          className={`h-1.5 rounded-full transition-all duration-500 ${
            step >= 2 ? 'bg-[#4F46E5]' : 'bg-indigo-100'
          }`}
        />
      </div>

      {/* Demo Main Stage */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        {/* Left Stage: Diarized Audio Transcript */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold text-[#4338CA] uppercase tracking-wider">
              1. SPOKEN AUDIO TRANSCRIPT
            </span>
            <div className="flex items-center space-x-1.5 text-xs text-emerald-700 font-mono font-bold">
              <Volume2 className="w-3.5 h-3.5 animate-pulse text-emerald-600" />
              <span>0:14s DIARIZED</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-indigo-100 space-y-3 shadow-sm">
            <div className="flex items-center space-x-2">
              <img
                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100"
                alt="Priya Sharma"
                className="w-6 h-6 rounded-full object-cover border border-[#4F46E5]"
              />
              <span className="text-xs font-sans font-bold text-[#1E1B4B]">Priya Sharma</span>
              <span className="text-[10px] font-mono text-[#64748B]">Lead Architect</span>
            </div>

            <p className="text-xs font-sans text-[#1E1B4B] leading-relaxed pl-4 border-l-2 border-[#4F46E5] font-medium">
              "I'll take accountability for the <span className="bg-indigo-50 text-[#3730A3] px-1.5 py-0.5 rounded font-bold">PostgreSQL schema migration</span> and verify zero downtime by Friday."
            </p>
          </div>
        </div>

        {/* Right Stage: AI Extraction -> Structured Owned Task Card */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              2. EXTRACTED DECISION & OWNED TASK
            </span>
            <span className="text-[10px] font-mono text-[#64748B] font-bold">Auto-Assigned</span>
          </div>

          <div
            className={`rounded-2xl p-5 border transition-all duration-700 space-y-3 shadow-md ${
              step >= 1
                ? 'bg-white border-[#4F46E5] shadow-lg opacity-100 scale-100'
                : 'bg-white/60 border-indigo-100 opacity-50 scale-95'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase bg-indigo-50 text-[#3730A3] border border-indigo-200">
                DECISION #DEC-104
              </span>
              <span className="text-xs font-mono font-bold text-emerald-700 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-emerald-600" /> Due Friday
              </span>
            </div>

            <h4 className="text-sm font-sans font-bold text-[#1E1B4B]">
              Execute PostgreSQL Database Schema Migration
            </h4>

            <div className="flex items-center justify-between pt-2 border-t border-indigo-100 text-xs font-sans text-[#64748B]">
              <div className="flex items-center space-x-2">
                <User className="w-3.5 h-3.5 text-[#4F46E5]" />
                <span className="font-bold text-[#1E1B4B]">Owner: Priya Sharma</span>
              </div>
              <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Zod Verified
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
