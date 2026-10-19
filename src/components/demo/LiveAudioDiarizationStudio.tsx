'use client';

import { useState, useEffect } from 'react';
import { Play, Pause, Volume2, CheckCircle2, User, Calendar, Activity } from 'lucide-react';

export function LiveAudioDiarizationStudio() {
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [activeSpeaker, setActiveSpeaker] = useState<'speaker1' | 'speaker2'>('speaker1');
  const [progress, setProgress] = useState<number>(45);

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = (prev + 1) % 100;
        if (next > 50) {
          setActiveSpeaker('speaker2');
        } else {
          setActiveSpeaker('speaker1');
        }
        return next;
      });
    }, 200);
    return () => clearInterval(interval);
  }, [isPlaying]);

  return (
    <div className="w-full glass-card-elevated-frost rounded-3xl p-5 sm:p-7 md:p-8 border-white shadow-[0_40px_100px_rgba(79,70,229,0.15)] relative overflow-hidden text-left">
      {/* Top Traffic Lights Header Bar */}
      <div className="flex items-center justify-between pb-4 border-b border-indigo-100 mb-6">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-rose-400" />
          <div className="w-3 h-3 rounded-full bg-amber-400" />
          <div className="w-3 h-3 rounded-full bg-emerald-400" />
          <span className="text-xs font-mono font-bold text-[#4338CA] ml-2">
            Meetrix Diarization & Speech Studio
          </span>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="px-2.5 py-1 rounded-xl btn-indigo-glow text-white text-xs font-mono font-bold flex items-center space-x-1.5 transition active:scale-95 shadow-sm"
          >
            {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
            <span>{isPlaying ? 'Pause Stream' : 'Resume Stream'}</span>
          </button>

          <span className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1 rounded-xl bg-indigo-50 border border-indigo-100 text-[10px] font-mono font-bold text-[#4338CA]">
            <Activity className="w-3 h-3 text-emerald-600 animate-pulse" />
            <span>98.4% Diarization Accuracy</span>
          </span>
        </div>
      </div>

      {/* Step Sequence Indicator */}
      <div className="grid grid-cols-3 gap-2 mb-6">
        <div
          className={`h-1.5 rounded-full transition-all duration-500 ${
            progress < 50 ? 'bg-[#4F46E5]' : 'bg-indigo-200'
          }`}
        />
        <div
          className={`h-1.5 rounded-full transition-all duration-500 ${
            progress >= 50 ? 'bg-[#0D9488]' : 'bg-indigo-100'
          }`}
        />
        <div
          className={`h-1.5 rounded-full transition-all duration-500 ${
            progress > 30 ? 'bg-[#4F46E5]' : 'bg-indigo-100'
          }`}
        />
      </div>

      {/* Main 50/50 Symmetrical Two-Stage Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
        {/* Left Stage: Multi-Speaker Diarized Audio Stream */}
        <div className="space-y-3 flex flex-col justify-between h-full">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold text-[#4338CA] uppercase tracking-wider flex items-center gap-1">
              <Volume2 className="w-3.5 h-3.5 text-[#4F46E5] animate-pulse" />
              1. MULTI-SPEAKER AUDIO STREAM
            </span>
            <div className="flex items-center space-x-1.5 text-xs text-emerald-700 font-mono font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              <span>0:14s LIVE STREAM</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-indigo-100 shadow-sm flex-1 flex flex-col justify-between space-y-4 min-h-[240px]">
            <div className="space-y-3">
              {/* Speaker Header with Tab Switcher */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-mono font-bold ${
                      activeSpeaker === 'speaker1'
                        ? 'bg-gradient-to-tr from-[#4F46E5] to-[#6366F1]'
                        : 'bg-gradient-to-tr from-[#0D9488] to-[#2DD4BF]'
                    }`}
                  >
                    {activeSpeaker === 'speaker1' ? 'AR' : 'SC'}
                  </div>
                  <div>
                    <span className="text-xs font-sans font-bold text-[#1E1B4B] block leading-tight">
                      {activeSpeaker === 'speaker1' ? 'Alex Rivera' : 'Sarah Chen'}
                    </span>
                    <span className="text-[10px] font-mono text-[#64748B]">
                      {activeSpeaker === 'speaker1' ? 'Product Lead • Speaker 0' : 'Lead Architect • Speaker 1'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => setActiveSpeaker('speaker1')}
                    className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase transition ${
                      activeSpeaker === 'speaker1'
                        ? 'bg-indigo-100 text-[#3730A3] border border-indigo-300'
                        : 'bg-slate-100 text-[#64748B]'
                    }`}
                  >
                    Speaker 0
                  </button>
                  <button
                    onClick={() => setActiveSpeaker('speaker2')}
                    className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase transition ${
                      activeSpeaker === 'speaker2'
                        ? 'bg-teal-100 text-teal-800 border border-teal-300'
                        : 'bg-slate-100 text-[#64748B]'
                    }`}
                  >
                    Speaker 1
                  </button>
                </div>
              </div>

              {/* Dynamic Waveform Visualizer */}
              <div className="bg-slate-50/70 p-3 rounded-xl border border-slate-100 space-y-2">
                <div className="flex items-center space-x-1 h-9">
                  {(activeSpeaker === 'speaker1'
                    ? [40, 75, 30, 85, 95, 50, 80, 100, 65, 85, 55, 90, 75, 45, 65, 90, 70, 45, 85, 95, 60, 35, 75, 90, 50]
                    : [60, 45, 80, 95, 55, 70, 90, 65, 100, 45, 80, 90, 85, 55, 70, 95, 50, 75, 90, 65, 45, 85, 95, 55, 75]
                  ).map((h, i) => (
                    <div
                      key={i}
                      className={`flex-1 rounded-full transition-all duration-300 ${
                        isPlaying
                          ? activeSpeaker === 'speaker1'
                            ? 'bg-gradient-to-t from-[#3730A3] to-[#6366F1] animate-pulse'
                            : 'bg-gradient-to-t from-[#0F766E] to-[#0D9488] animate-pulse'
                          : 'bg-indigo-200'
                      }`}
                      style={{ height: `${h}%`, animationDelay: `${i * 60}ms` }}
                    />
                  ))}
                </div>

                {/* Scrubber Progress Bar */}
                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-[#4F46E5] to-[#0D9488] h-full transition-all duration-200"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-indigo-100 text-xs font-sans text-[#64748B]">
              <span className="text-[10px] font-mono font-semibold text-[#475569]">Diarization: Whisper v3</span>
              <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                Confidence 98.4%
              </span>
            </div>
          </div>
        </div>

        {/* Right Stage: Extracted Decision & Owned Task */}
        <div className="space-y-3 flex flex-col justify-between h-full">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              2. EXTRACTED DECISION COMMITMENT
            </span>
            <span className="text-[10px] font-mono text-[#64748B] font-bold">Auto-Assigned</span>
          </div>

          <div className="rounded-2xl p-5 border border-[#4F46E5] bg-white shadow-lg flex-1 flex flex-col justify-between space-y-4 min-h-[240px]">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase bg-indigo-50 text-[#3730A3] border border-indigo-200">
                  DECISION #DEC-302
                </span>
                <span className="text-xs font-mono font-bold text-emerald-700 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-emerald-600" /> Due Friday EOD
                </span>
              </div>

              <div className="space-y-1">
                <h4 className="text-sm font-sans font-bold text-[#1E1B4B]">
                  PostgreSQL Migration & Webhook Dispatch
                </h4>
                <p className="text-xs font-sans text-[#475569] font-medium leading-relaxed bg-slate-50/70 p-2.5 rounded-xl border border-slate-100">
                  "Sarah Chen and Alex Rivera agreed to deploy the initial database migration to PostgreSQL and verify Slack webhooks by Friday EOD."
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-indigo-100 text-xs font-sans text-[#64748B]">
              <div className="flex items-center space-x-2">
                <User className="w-3.5 h-3.5 text-[#4F46E5]" />
                <span className="font-bold text-[#1E1B4B]">Owner: Alex Rivera</span>
              </div>
              <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                Zod Verified • 92.4% Score
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
