'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Play, Pause, Volume2, CheckCircle2, User, RefreshCw, Zap, Sparkles, Activity } from 'lucide-react';

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
    <div className="glass-card-elevated-frost rounded-3xl p-5 sm:p-7 border-white shadow-[0_40px_100px_rgba(79,70,229,0.15)] space-y-6">
      
      {/* Top Studio Control Header */}
      <div className="flex items-center justify-between border-b border-indigo-100 pb-4">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-11 h-11 rounded-2xl btn-indigo-glow flex items-center justify-center text-white transition transform active:scale-95 shadow-md"
          >
            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
          </button>
          <div>
            <div className="flex items-center space-x-2">
              <h4 className="text-sm font-sans font-bold text-[#1E1B4B]">
                Meetrix Diarization & Speech Studio
              </h4>
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 text-[10px] font-mono font-bold text-[#4338CA]">
                Live Stream
              </span>
            </div>
            <p className="text-xs text-[#475569] font-sans">
              Whisper v3 speech recognition with multi-speaker diarization and Zod decision extraction.
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-indigo-50 border border-indigo-100 text-xs font-mono font-bold text-[#4338CA]">
          <Activity className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
          <span>98.4% Diarization Accuracy</span>
        </div>
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Live Audio Diarization Waves */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-white border border-indigo-100 space-y-4 shadow-sm">
          
          {/* Speaker 1: Alex Rivera */}
          <div className={`p-4 rounded-xl border transition-all duration-300 ${
            activeSpeaker === 'speaker1'
              ? 'bg-indigo-50/70 border-indigo-300 shadow-md ring-2 ring-indigo-200'
              : 'bg-slate-50/50 border-slate-200'
          }`}>
            <div className="flex items-center justify-between text-xs font-mono mb-2">
              <div className="flex items-center space-x-2">
                <span className={`w-3 h-3 rounded-full ${activeSpeaker === 'speaker1' ? 'bg-[#4F46E5] animate-ping' : 'bg-indigo-300'}`} />
                <span className="font-bold text-[#1E1B4B]">Speaker 1: Alex Rivera (Product Lead)</span>
              </div>
              <span className="text-[#64748B]">00:14 - 03:45</span>
            </div>
            {/* Waveform visualizer */}
            <div className="flex items-center space-x-1 h-8 pt-1">
              {[45, 75, 35, 90, 100, 50, 80, 95, 65, 85, 55, 90, 80, 45, 65, 90, 75, 45, 85, 95, 65, 35, 75, 90, 55].map((h, i) => (
                <div
                  key={i}
                  className={`flex-1 rounded-full transition-all duration-300 ${
                    activeSpeaker === 'speaker1' && isPlaying
                      ? 'bg-gradient-to-t from-[#3730A3] to-[#6366F1] animate-pulse'
                      : 'bg-indigo-200'
                  }`}
                  style={{ height: `${h}%`, animationDelay: `${i * 70}ms` }}
                />
              ))}
            </div>
          </div>

          {/* Speaker 2: Sarah Chen */}
          <div className={`p-4 rounded-xl border transition-all duration-300 ${
            activeSpeaker === 'speaker2'
              ? 'bg-teal-50/70 border-teal-300 shadow-md ring-2 ring-teal-200'
              : 'bg-slate-50/50 border-slate-200'
          }`}>
            <div className="flex items-center justify-between text-xs font-mono mb-2">
              <div className="flex items-center space-x-2">
                <span className={`w-3 h-3 rounded-full ${activeSpeaker === 'speaker2' ? 'bg-[#0D9488] animate-ping' : 'bg-teal-300'}`} />
                <span className="font-bold text-[#1E1B4B]">Speaker 2: Sarah Chen (Lead Architect)</span>
              </div>
              <span className="text-[#64748B]">03:46 - 08:20</span>
            </div>
            {/* Waveform visualizer */}
            <div className="flex items-center space-x-1 h-8 pt-1">
              {[65, 45, 85, 95, 55, 75, 90, 65, 95, 45, 80, 95, 85, 55, 70, 95, 50, 75, 90, 65, 45, 85, 95, 55, 80].map((h, i) => (
                <div
                  key={i}
                  className={`flex-1 rounded-full transition-all duration-300 ${
                    activeSpeaker === 'speaker2' && isPlaying
                      ? 'bg-gradient-to-t from-[#0F766E] to-[#0D9488] animate-pulse'
                      : 'bg-teal-200'
                  }`}
                  style={{ height: `${h}%`, animationDelay: `${i * 80}ms` }}
                />
              ))}
            </div>
          </div>

          {/* Timeline playback bar */}
          <div className="pt-2">
            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-[#4F46E5] to-[#0D9488] h-full transition-all duration-200"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

        </div>

        {/* Right Column: Live Zod Extracted Decision Card */}
        <div className="p-5 rounded-2xl bg-white border border-indigo-100 space-y-4 flex flex-col justify-between shadow-sm">
          
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-xs font-mono font-bold text-emerald-700 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>DECISION #DEC-302</span>
              </span>
              <span className="text-[10px] font-mono text-[#64748B]">Parsed in 240ms</span>
            </div>

            <p className="text-xs text-[#1E1B4B] leading-relaxed font-sans font-medium pt-1">
              "Sarah Chen and Alex Rivera agreed to deploy the initial database migration to PostgreSQL and verify Slack webhooks by Friday EOD."
            </p>

            <div className="space-y-2 pt-1 text-xs font-mono">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-indigo-50/60 border border-indigo-100">
                <span className="text-[#64748B]">Designated Owner:</span>
                <span className="text-[#3730A3] font-bold">Alex Rivera</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-indigo-50/60 border border-indigo-100">
                <span className="text-[#64748B]">Priority & Status:</span>
                <span className="text-amber-700 font-bold">Active Track • High</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-indigo-50/60 border border-indigo-100">
                <span className="text-[#64748B]">Owner Reliability Index:</span>
                <span className="text-emerald-700 font-bold">92.4% Score</span>
              </div>
            </div>
          </div>

          <Link
            href="/meetings/upload"
            className="w-full py-3 rounded-xl btn-indigo-glow text-xs font-bold text-center block transition shadow-md"
          >
            Ingest Your Meeting Audio
          </Link>

        </div>

      </div>

    </div>
  );
}
