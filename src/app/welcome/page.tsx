'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles, Zap, ShieldCheck, BookOpen, MessageSquare, Mic, CheckCircle2 } from 'lucide-react';
import { MeetrixLogo } from '@/components/brand/MeetrixLogo';
import { TranscriptTaskDemo } from '@/components/demo/TranscriptTaskDemo';

const WORKFLOW_MODES = [
  {
    id: 'decisions',
    label: 'Decision Radar',
    icon: Zap,
    desc: 'Extract authoritative commitments from spoken audio and track progress across meetings.',
  },
  {
    id: 'diarization',
    label: 'Speaker Diarization',
    icon: Mic,
    desc: 'Whisper-stt AI chunking and multi-speaker identification with microsecond timestamps.',
  },
  {
    id: 'accountability',
    label: 'Accountability Ledger',
    icon: BookOpen,
    desc: 'Calculates reliability % trajectory and unacted decision alerts for every team owner.',
  },
  {
    id: 'rag',
    label: 'RAG Knowledge Base',
    icon: ShieldCheck,
    desc: 'Instant semantic vector search across all past meeting transcripts with exact citations.',
  },
];

export default function WelcomePage() {
  const [activeWorkflow, setActiveWorkflow] = useState('decisions');

  const currentWorkflowObj = WORKFLOW_MODES.find((w) => w.id === activeWorkflow) || WORKFLOW_MODES[0];

  return (
    <div className="min-h-screen bg-[#080A11] text-[#F8FAFC] flex flex-col justify-between selection:bg-[#00F2FE]/20 selection:text-[#00F2FE] relative overflow-hidden">
      {/* Background Ambient Radial Glowing Orbs */}
      <div className="absolute top-[-10%] left-[50%] -translate-x-[50%] w-[800px] h-[500px] bg-gradient-to-b from-[#00F2FE]/20 via-[#4FACFE]/10 to-transparent rounded-full blur-[120px] pointer-events-none animate-pulse-neon" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[600px] h-[400px] bg-[#00F2FE]/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Top Minimal Navigation Bar */}
      <nav className="max-w-7xl w-full mx-auto px-6 py-6 flex items-center justify-between z-30">
        <MeetrixLogo size="lg" />

        <div className="hidden md:flex items-center space-x-6 text-xs font-sans text-[#94A3B8]">
          <Link href="#workflows" className="hover:text-[#F8FAFC] transition">Workflows</Link>
          <Link href="#demo" className="hover:text-[#F8FAFC] transition">Live Demo</Link>
          <Link href="/accountability" className="hover:text-[#F8FAFC] transition">Reliability Index</Link>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            href="/login"
            className="px-4 py-2 rounded-full glass-container text-[#F8FAFC] hover:text-[#00F2FE] font-semibold text-xs transition border border-[#1E263D] flex items-center gap-1.5"
          >
            <span>Sign in</span>
          </Link>
          <Link
            href="/meetings/upload"
            className="px-4 py-2 rounded-full btn-neon-glow font-bold text-xs transition flex items-center gap-1.5"
          >
            <Zap className="w-3.5 h-3.5 fill-[#050B14]" />
            <span>Ingest Audio Sync</span>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-10 pb-16 px-6 max-w-5xl mx-auto text-center space-y-8 z-20">
        {/* Hero Title */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-serif font-extrabold text-[#F8FAFC] tracking-tight leading-[1.1] max-w-4xl mx-auto">
          A <span className="text-neon-glow relative inline-block">Decisive</span> Meeting AI
        </h1>

        {/* Experience Selector Pill Bar (Mirrors Reference Style) */}
        <div className="space-y-3 pt-2">
          <div className="text-[11px] font-mono font-bold text-[#94A3B8] uppercase tracking-widest">
            CHOOSE YOUR WORKFLOW
          </div>

          <div className="inline-flex flex-wrap items-center justify-center p-1.5 rounded-full glass-container border border-[#1E263D] gap-1 max-w-3xl mx-auto shadow-2xl">
            {WORKFLOW_MODES.map((mode) => {
              const Icon = mode.icon;
              const isActive = activeWorkflow === mode.id;

              return (
                <button
                  key={mode.id}
                  onClick={() => setActiveWorkflow(mode.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-full text-xs font-sans transition-all duration-300 ${
                    isActive
                      ? 'pill-neon-active'
                      : 'text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#161C2E]'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#050B14]' : 'text-[#00F2FE]'}`} />
                  <span>{mode.label}</span>
                </button>
              );
            })}
          </div>

          {/* Dynamic Workflow Description */}
          <p className="text-xs font-sans text-[#94A3B8] max-w-lg mx-auto min-h-[20px] transition-all">
            {currentWorkflowObj.desc}
          </p>
        </div>

        {/* Hero Main Copy */}
        <p className="text-base sm:text-lg font-sans text-[#94A3B8] max-w-2xl mx-auto leading-relaxed pt-2">
          Meetrix is a futuristic, decision-conscious meeting engine. Diarized speech ingestion, authoritative owner accountability, and zero unacted decisions.
        </p>

        {/* Dual Luminous CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            href="/meetings/upload"
            className="w-full sm:w-auto px-8 py-4 rounded-full btn-neon-glow font-bold text-sm flex items-center justify-center space-x-2.5 transition group"
          >
            <Zap className="w-4 h-4 fill-[#050B14]" />
            <span>Try Meetrix for Free</span>
          </Link>

          <Link
            href="/login"
            className="w-full sm:w-auto px-8 py-4 rounded-full glass-container hover:border-[#00F2FE]/40 text-[#F8FAFC] hover:text-[#00F2FE] font-semibold text-sm transition flex items-center justify-center space-x-2 border border-[#1E263D]"
          >
            <ArrowRight className="w-4 h-4 text-[#00F2FE]" />
            <span>Sign in / Sign up</span>
          </Link>
        </div>

        {/* Hero Stat Row at Bottom (Matching Reference Structure) */}
        <div className="pt-12 max-w-3xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-8 border-t border-[#1E263D]/60">
          <div className="space-y-1">
            <div className="text-4xl font-extrabold font-mono text-[#00F2FE] drop-shadow-[0_0_15px_rgba(0,242,254,0.6)]">
              84.2%
            </div>
            <div className="text-xs font-sans text-[#94A3B8]">Decision follow-through</div>
          </div>

          <div className="space-y-1">
            <div className="text-4xl font-extrabold font-mono text-[#F8FAFC]">
              10x
            </div>
            <div className="text-xs font-sans text-[#94A3B8]">Faster owner execution</div>
          </div>

          <div className="space-y-1">
            <div className="text-4xl font-extrabold font-mono text-[#00F2FE] drop-shadow-[0_0_15px_rgba(0,242,254,0.6)]">
              100%
            </div>
            <div className="text-xs font-sans text-[#94A3B8]">Diarized speaker memory</div>
          </div>
        </div>
      </section>

      {/* Signature Interactive Demo Moment */}
      <section id="demo" className="py-16 px-6 max-w-6xl mx-auto w-full z-20">
        <div className="text-center space-y-2 mb-10">
          <span className="text-xs font-mono font-bold text-[#00F2FE] uppercase tracking-widest block">
            LIVE TRANSCRIPTION ENGINE
          </span>
          <h2 className="text-3xl font-serif font-extrabold text-[#F8FAFC]">
            Watch Spoken Words Turn into Owned Task Cards
          </h2>
        </div>

        <TranscriptTaskDemo />
      </section>

      {/* Footer */}
      <footer className="border-t border-[#1E263D] py-8 px-6 text-center text-xs font-mono text-[#94A3B8] z-20 bg-[#080A11]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <MeetrixLogo size="sm" />
          <p>© 2026 Meetrix AI Inc. Authoritative Decision & Owner Accountability Engine.</p>
        </div>
      </footer>
    </div>
  );
}
