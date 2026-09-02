'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  Sparkles,
  Zap,
  Mic,
  ShieldCheck,
  Mail,
  Lock,
  User,
  CheckCircle2,
  GitCommit,
  Award,
  Database,
  Play,
  Check,
  Search,
  SlidersHorizontal,
  ChevronRight,
  MessageSquare,
  FileText,
  Layers,
  Cpu,
  Globe,
  Users,
  Radio,
  Star,
  Plus,
  Terminal,
  Activity,
  TrendingUp,
  AlertTriangle,
  BellRing,
} from 'lucide-react';
import { MeetrixLogo } from '@/components/brand/MeetrixLogo';
import { TranscriptTaskDemo } from '@/components/demo/TranscriptTaskDemo';
import { LiveAudioDiarizationStudio } from '@/components/demo/LiveAudioDiarizationStudio';
import { StitchThreadVisualizer } from '@/components/demo/StitchThreadVisualizer';
import { InteractiveRagQueryWidget } from '@/components/demo/InteractiveRagQueryWidget';

const WORKFLOW_FEATURES = [
  {
    icon: Mic,
    title: 'Diarized Speech Memory',
    desc: 'Whisper-stt speech recognition with precise multi-speaker diarization, sentiment tracking, and exact audio timestamps.',
    tag: 'Whisper v3',
  },
  {
    icon: Zap,
    title: 'Automatic Decision Extraction',
    desc: 'LLM Zod JSON extraction parsing explicit commitments, assigned task owners, and structural meeting context.',
    tag: 'Zod Parsed',
  },
  {
    icon: Award,
    title: 'Owner Reliability Index',
    desc: 'Automated follow-through calculation tracking completion ratios and decision velocity per team member.',
    tag: 'Live Scoring',
  },
  {
    icon: GitCommit,
    title: 'Cross-Meeting Stitch Threads',
    desc: 'Visual timeline stitching where a decision originated to how it was reviewed or closed in subsequent syncs.',
    tag: 'Audit Trail',
  },
  {
    icon: Database,
    title: 'RAG Vector Search',
    desc: 'Semantic search indexing past transcripts with exact meeting title, date, speaker, and timestamp citations.',
    tag: 'pgvector RAG',
  },
  {
    icon: ShieldCheck,
    title: 'Enterprise RBAC & Webhooks',
    desc: 'Slack, Jira, and Linear webhooks with encrypted credentials and granular role-based workspace access.',
    tag: 'SOC2 Ready',
  },
];

const BRAND_LOGOS = [
  { name: 'Linear', icon: '📐' },
  { name: 'Supabase', icon: '⚡' },
  { name: 'Notion', icon: '📑' },
  { name: 'Zoom', icon: '🎥' },
  { name: 'Slack', icon: '💬' },
  { name: 'PostgreSQL', icon: '🐘' },
  { name: 'Whisper AI', icon: '🎙️' },
  { name: 'Jira', icon: '📌' },
  { name: 'OpenAI', icon: '🧠' },
  { name: 'Next.js', icon: '▲' },
];

const TEAM_LEADERBOARD = [
  { name: 'Alex Rivera', role: 'Product Lead', score: '94.2%', closed: 18, pending: 1, avatar: 'AR', color: 'from-[#4F46E5] to-[#6366F1]' },
  { name: 'Sarah Chen', role: 'Lead Architect', score: '91.8%', closed: 14, pending: 2, avatar: 'SC', color: 'from-[#0D9488] to-[#2DD4BF]' },
  { name: 'David Kim', role: 'Backend Engineer', score: '88.5%', closed: 12, pending: 2, avatar: 'DK', color: 'from-[#7C3AED] to-[#A855F7]' },
];

export default function HomePage() {
  const [authMode, setAuthMode] = useState<'signin' | 'signup' | 'forgot'>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Waitlist state
  const [waitlistEmail, setWaitlistEmail] = useState('');
  const [waitlistJoined, setWaitlistJoined] = useState(false);

  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMessage('');

    if (authMode === 'forgot') {
      setTimeout(() => {
        setLoading(false);
        setSuccessMessage(`Password reset link dispatched to ${email || 'your email'}! Check your inbox.`);
      }, 600);
      return;
    }

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Authentication failed');
      }

      window.location.href = data.redirectUrl || '/dashboard';
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
      setLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'guest@meetrix.ai', password: 'guest', name: 'Guest User' }),
      });
      const data = await res.json();
      window.location.href = data.redirectUrl || '/dashboard';
    } catch {
      window.location.href = '/dashboard';
    }
  };

  const handleWaitlistSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!waitlistEmail.trim()) return;
    setWaitlistJoined(true);
  };

  return (
    <div className="min-h-screen bg-[#EEF2FF] text-[#1E1B4B] flex flex-col justify-between selection:bg-[#4F46E5]/20 selection:text-[#3730A3] relative overflow-hidden">
      
      {/* ─────────────────────────────────────────────────────────────
          1. Ethereal Luminous Frost Background (Generated Art)
      ───────────────────────────────────────────────────────────── */}
      <div className="absolute top-0 left-0 right-0 h-[1050px] pointer-events-none z-0 overflow-hidden">
        {/* Frost Glass Hero Visual */}
        <div className="absolute inset-0 opacity-80">
          <img
            src="/images/frost-hero-bg.png"
            alt="Frosted Glass Cybernetic Background"
            className="w-full h-full object-cover object-center"
          />
        </div>

        {/* Soft Fade Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#EEF2FF]/40 via-[#EEF2FF]/80 to-[#EEF2FF]" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[950px] h-[550px] bg-gradient-to-r from-[#818CF8]/25 via-[#6366F1]/20 to-[#2DD4BF]/15 rounded-full blur-[150px] animate-pulse-glow" />
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. Top Glass Navigation Bar
      ───────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 glass-nav-frost transition-all duration-300">
        <nav className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="hover:opacity-90 transition">
            <MeetrixLogo size="md" />
          </Link>

          <div className="hidden lg:flex items-center space-x-9 text-xs font-sans font-semibold text-[#1E1B4B]">
            <a href="#capabilities" className="hover:text-[#4F46E5] transition duration-200">Capabilities</a>
            <a href="#demo" className="hover:text-[#4F46E5] transition duration-200">Interactive Demo</a>
            <a href="#accountability" className="hover:text-[#4F46E5] transition duration-200">Team Reliability</a>
            <a href="#auth-section" className="hover:text-[#4F46E5] transition duration-200">Sign In</a>
            <Link href="/dashboard" className="text-[#4F46E5] hover:text-[#3730A3] transition font-bold flex items-center gap-1">
              <span>Dashboard Demo</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="flex items-center space-x-3.5">
            <button
              onClick={handleGuestLogin}
              className="px-4 py-2 rounded-full bg-white/90 hover:bg-white text-[#3730A3] border border-indigo-200 hover:border-[#4F46E5] text-xs font-bold transition flex items-center space-x-1.5 shadow-sm"
            >
              <User className="w-3.5 h-3.5 text-[#4F46E5]" />
              <span>Enter as Guest</span>
            </button>
            <a
              href="#auth-section"
              className="hidden sm:inline-flex px-5 py-2.5 rounded-full btn-indigo-glow text-xs font-bold transition"
            >
              Start Free
            </a>
            <Link
              href="/meetings/upload"
              className="px-5 py-2.5 rounded-full btn-white-frost text-xs font-bold transition flex items-center space-x-2"
            >
              <Zap className="w-3.5 h-3.5 text-[#4F46E5]" />
              <span>Ingest Audio Sync</span>
            </Link>
          </div>
        </nav>
      </header>

      {/* ─────────────────────────────────────────────────────────────
          3. HERO SECTION (Executive Title + Stats + Interactive RAG Widget)
      ───────────────────────────────────────────────────────────── */}
      <section className="relative pt-16 lg:pt-24 pb-16 px-6 max-w-5xl mx-auto text-center space-y-9 z-20">
        
        {/* Tech Pill Badge */}
        <div className="inline-flex items-center space-x-2.5 px-4 py-1.5 rounded-full bg-white/90 backdrop-blur-xl border border-white text-xs font-mono font-bold text-[#3730A3] shadow-md animate-float-slow">
          <Sparkles className="w-3.5 h-3.5 text-[#4F46E5] animate-pulse" />
          <span>MEETRIX AI v2.4 • DIARIZED DECISION ENGINE</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-sans font-extrabold text-[#1E1B4B] tracking-tight leading-[1.12] max-w-4xl mx-auto drop-shadow-sm">
          AI Engine That Turns{' '}
          <span className="font-serif italic font-normal text-gradient-indigo block sm:inline">
            Spoken Meetings
          </span>{' '}
          Into Tracked Decisions & Action Items.
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-lg font-sans text-[#475569] max-w-2xl mx-auto leading-relaxed font-medium">
          Meetrix AI ingests spoken audio, diarizes speaker speech, extracts explicit commitments using structured Zod JSON schemas, and calculates owner reliability indexes.
        </p>

        {/* Floating Waitlist Glass Pill Bar */}
        <div className="pt-2 max-w-2xl mx-auto">
          {!waitlistJoined ? (
            <form 
              onSubmit={handleWaitlistSubmit}
              className="p-2 rounded-full glass-input-frost flex items-center justify-between border-white shadow-[0_20px_50px_rgba(79,70,229,0.15)] group hover:border-[#4F46E5]/40 transition duration-300"
            >
              <div className="flex-1 flex items-center pl-4 pr-2 space-x-3">
                <Mail className="w-4 h-4 text-[#4F46E5]" />
                <input
                  type="email"
                  required
                  placeholder="Enter your work email address"
                  value={waitlistEmail}
                  onChange={(e) => setWaitlistEmail(e.target.value)}
                  className="w-full bg-transparent text-sm text-[#1E1B4B] placeholder-[#64748B] focus:outline-none font-sans font-medium"
                />
              </div>
              <button
                type="submit"
                className="px-8 py-3.5 rounded-full btn-indigo-glow text-xs font-bold tracking-wide transition flex items-center space-x-2 shrink-0"
              >
                <span>Join Waitlist</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          ) : (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-mono font-bold flex items-center justify-center space-x-2 shadow-md animate-in fade-in zoom-in duration-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>You're on the priority waitlist! Check your inbox for early access.</span>
            </div>
          )}
        </div>

        {/* Dual Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <Link
            href="/meetings/upload"
            className="w-full sm:w-auto px-8 py-4 rounded-2xl btn-indigo-glow text-sm font-bold flex items-center justify-center space-x-2.5 transition"
          >
            <Mic className="w-4 h-4" />
            <span>Ingest Audio Sync</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            href="/dashboard"
            className="w-full sm:w-auto px-8 py-4 rounded-2xl btn-white-frost text-[#1E1B4B] font-bold text-sm transition flex items-center justify-center space-x-2"
          >
            <SlidersHorizontal className="w-4 h-4 text-[#4F46E5]" />
            <span>Explore Dashboard Demo</span>
          </Link>
        </div>

        {/* Hero Performance Stats Bar */}
        <div className="pt-8 max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 text-left">
          <div className="p-4 rounded-2xl bg-white/80 border border-white shadow-sm space-y-1 hover:shadow-md transition">
            <div className="text-2xl font-extrabold font-mono text-[#3730A3]">84.2%</div>
            <div className="text-[11px] font-sans font-semibold text-[#475569]">Follow-Through Rate</div>
          </div>
          <div className="p-4 rounded-2xl bg-white/80 border border-white shadow-sm space-y-1 hover:shadow-md transition">
            <div className="text-2xl font-extrabold font-mono text-emerald-700">240ms</div>
            <div className="text-[11px] font-sans font-semibold text-[#475569]">Decision Parse Latency</div>
          </div>
          <div className="p-4 rounded-2xl bg-white/80 border border-white shadow-sm space-y-1 hover:shadow-md transition">
            <div className="text-2xl font-extrabold font-mono text-[#3730A3]">100%</div>
            <div className="text-[11px] font-sans font-semibold text-[#475569]">Zod Schema Validated</div>
          </div>
          <div className="p-4 rounded-2xl bg-white/80 border border-white shadow-sm space-y-1 hover:shadow-md transition">
            <div className="text-2xl font-extrabold font-mono text-[#4F46E5]">18</div>
            <div className="text-[11px] font-sans font-semibold text-[#475569]">Active Tracked Owners</div>
          </div>
        </div>

        {/* Interactive RAG Semantic Search Query Studio */}
        <div className="pt-4">
          <InteractiveRagQueryWidget />
        </div>

      </section>

      {/* ─────────────────────────────────────────────────────────────
          4. LIVE AUDIO DIARIZATION STUDIO (Interactive Component A)
      ───────────────────────────────────────────────────────────── */}
      <section className="py-10 px-6 max-w-6xl mx-auto w-full z-20">
        <LiveAudioDiarizationStudio />
      </section>

      {/* ─────────────────────────────────────────────────────────────
          5. ENTERPRISE TECH MARQUEE
      ───────────────────────────────────────────────────────────── */}
      <section className="py-12 border-y border-indigo-100 bg-white/70 backdrop-blur-xl overflow-hidden z-20">
        <div className="max-w-7xl mx-auto px-6 text-center space-y-6">
          <p className="text-xs font-mono font-bold text-[#475569] uppercase tracking-widest">
            BUILT WITH ENTERPRISE & OPEN-SOURCE TECH STACK
          </p>

          <div className="relative w-full overflow-hidden">
            <div className="animate-marquee items-center justify-around space-x-12">
              {BRAND_LOGOS.concat(BRAND_LOGOS).map((logo, idx) => (
                <div 
                  key={idx}
                  className="flex items-center space-x-2 text-lg font-sans font-bold text-[#334155] hover:text-[#1E1B4B] transition duration-200 shrink-0 cursor-default"
                >
                  <span className="text-xl">{logo.icon}</span>
                  <span className="tracking-tight">{logo.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          6. CROSS-MEETING STITCH TIMELINE (Interactive Component B)
      ───────────────────────────────────────────────────────────── */}
      <section className="py-16 px-6 max-w-6xl mx-auto w-full z-20 space-y-8">
        <div className="text-center space-y-3">
          <span className="px-4 py-1 rounded-full bg-indigo-100 text-xs font-mono font-bold text-[#4338CA] uppercase tracking-wider border border-indigo-200">
            AUDIT TRAIL STITCHING
          </span>
          <h2 className="text-3xl sm:text-5xl font-sans font-extrabold text-[#1E1B4B]">
            Track Decisions Across Sequential Team Syncs
          </h2>
          <p className="text-sm font-sans text-[#475569] max-w-xl mx-auto font-medium">
            See how Meetrix AI stitches commitments from origin meeting to resolution.
          </p>
        </div>

        <StitchThreadVisualizer />
      </section>

      {/* ─────────────────────────────────────────────────────────────
          7. SIGNATURE INTERACTIVE DEMO SECTION
      ───────────────────────────────────────────────────────────── */}
      <section id="demo" className="py-16 px-6 max-w-6xl mx-auto w-full z-20 space-y-10">
        <div className="text-center space-y-3">
          <span className="px-4 py-1 rounded-full bg-indigo-100 text-xs font-mono font-bold text-[#4338CA] uppercase tracking-wider border border-indigo-200">
            LIVE EXTRACTION ENGINE PIPELINE
          </span>
          <h2 className="text-3xl sm:text-5xl font-sans font-extrabold text-[#1E1B4B]">
            Watch Spoken Words Turn into Owned Task Cards
          </h2>
          <p className="text-sm font-sans text-[#475569] max-w-xl mx-auto font-medium">
            Experience our instant speech-to-decision pipeline in action below.
          </p>
        </div>

        <TranscriptTaskDemo />
      </section>

      {/* ─────────────────────────────────────────────────────────────
          8. CAPABILITIES & FEATURES GRID
      ───────────────────────────────────────────────────────────── */}
      <section id="capabilities" className="py-20 px-6 max-w-6xl mx-auto w-full z-20 space-y-12">
        <div className="text-center space-y-3">
          <span className="px-4 py-1 rounded-full bg-indigo-100 text-xs font-mono font-bold text-[#4338CA] uppercase tracking-wider border border-indigo-200">
            CORE ENGINE ARCHITECTURE
          </span>
          <h2 className="text-3xl sm:text-5xl font-sans font-extrabold text-[#1E1B4B]">
            Built specifically for meeting memory & owner follow-through.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {WORKFLOW_FEATURES.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div
                key={idx}
                className="glass-card-frost rounded-3xl p-7 space-y-4 relative group overflow-hidden border-white"
              >
                {/* Icon Badge */}
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-[#4F46E5] flex items-center justify-center text-white group-hover:scale-110 transition duration-300 shadow-md">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-indigo-50 text-[10px] font-mono font-bold text-[#4338CA] border border-indigo-200">
                    {feat.tag}
                  </span>
                </div>

                <h3 className="text-lg font-sans font-bold text-[#1E1B4B] group-hover:text-[#4F46E5] transition">
                  {feat.title}
                </h3>
                <p className="text-xs font-sans text-[#475569] leading-relaxed font-medium">
                  {feat.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          9. TEAM RELIABILITY & DECISION AUDIT SHOWCASE
      ───────────────────────────────────────────────────────────── */}
      <section id="accountability" className="py-20 px-6 max-w-6xl mx-auto w-full z-20 space-y-12">
        <div className="text-center space-y-4">
          <span className="px-4 py-1 rounded-full bg-indigo-100 text-xs font-mono font-bold text-[#4338CA] uppercase tracking-wider border border-indigo-200">
            AUTONOMOUS OWNER ACCOUNTABILITY
          </span>
          <h2 className="text-3xl sm:text-5xl font-sans font-extrabold text-[#1E1B4B]">
            Real-Time Follow-Through Index & Decision Audit
          </h2>
          <p className="text-sm font-sans text-[#475569] max-w-xl mx-auto font-medium">
            Meetrix AI automatically scores team member completion ratios, tracks decision velocity, and flags stale unacted commitments.
          </p>
        </div>

        {/* Accountability Cards Showcase */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          
          {/* Owner Leaderboard Card */}
          <div className="glass-card-frost rounded-3xl p-7 space-y-5 border-white flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-indigo-100 pb-3">
                <span className="text-xs font-mono font-bold text-[#4338CA] uppercase">Team Leaderboard</span>
                <Award className="w-4 h-4 text-emerald-600" />
              </div>

              <div className="space-y-3">
                {TEAM_LEADERBOARD.map((member, idx) => (
                  <div key={idx} className="p-3 rounded-2xl bg-white border border-indigo-100 flex items-center justify-between shadow-sm">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-xl bg-gradient-to-tr ${member.color} text-white font-bold text-xs flex items-center justify-center font-mono shadow-sm`}>
                        {member.avatar}
                      </div>
                      <div>
                        <p className="text-xs font-sans font-bold text-[#1E1B4B]">{member.name}</p>
                        <p className="text-[10px] text-[#64748B] font-mono">{member.role}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-mono font-bold text-emerald-700">{member.score}</p>
                      <p className="text-[10px] text-[#64748B] font-mono">{member.closed} Closed</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Link
              href="/accountability"
              className="w-full py-3 rounded-xl btn-white-frost text-xs font-bold text-center block transition"
            >
              View Full Team Reliability Index
            </Link>
          </div>

          {/* Decision Velocity Card */}
          <div className="glass-card-elevated-frost rounded-3xl p-7 space-y-5 border-indigo-200 shadow-[0_20px_60px_rgba(79,70,229,0.15)] flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-indigo-100 pb-3">
                <span className="text-xs font-mono font-bold text-[#4338CA] uppercase">Decision Velocity</span>
                <TrendingUp className="w-4 h-4 text-[#4F46E5]" />
              </div>

              <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200 text-center space-y-1">
                <span className="text-4xl font-extrabold text-[#1E1B4B] font-mono">2.4 Days</span>
                <p className="text-xs font-sans text-[#4338CA] font-bold">Average Decision Resolution Time</p>
                <p className="text-[11px] text-emerald-700 font-mono pt-1">↑ 35% Faster than Benchmark</p>
              </div>

              <div className="space-y-2 text-xs font-sans text-[#475569]">
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-indigo-100">
                  <span>Cross-Meeting Stitch Threads:</span>
                  <span className="font-mono font-bold text-[#1E1B4B]">12 Connected</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-indigo-100">
                  <span>Auto-Escalated Stale Alerts:</span>
                  <span className="font-mono font-bold text-amber-700">2 Pending</span>
                </div>
              </div>
            </div>

            <Link
              href="/decisions"
              className="w-full py-3.5 rounded-xl btn-indigo-glow text-xs font-bold text-center block transition shadow-md"
            >
              Explore Decision Audit Trail
            </Link>
          </div>

          {/* Real-time Alerts & Slack Sync Card */}
          <div className="glass-card-frost rounded-3xl p-7 space-y-5 border-white flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-indigo-100 pb-3">
                <span className="text-xs font-mono font-bold text-[#4338CA] uppercase">Webhook Integration</span>
                <BellRing className="w-4 h-4 text-amber-600" />
              </div>

              <div className="space-y-3">
                <div className="p-3.5 rounded-2xl bg-white border border-indigo-100 space-y-1.5 shadow-sm">
                  <div className="flex items-center justify-between text-xs font-mono text-[#3730A3] font-bold">
                    <span>Slack Alert Dispatch</span>
                    <span className="text-[10px] text-emerald-600">Active</span>
                  </div>
                  <p className="text-xs text-[#475569] leading-relaxed">
                    "⚡ Decision #DEC-104 assigned to Alex Rivera is approaching 14-day SLA deadline. Auto-escalated to channel."
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-white border border-indigo-100 space-y-1.5 shadow-sm">
                  <div className="flex items-center justify-between text-xs font-mono text-[#3730A3] font-bold">
                    <span>Jira Issue Sync</span>
                    <span className="text-[10px] text-emerald-600">Active</span>
                  </div>
                  <p className="text-xs text-[#475569] leading-relaxed">
                    "📌 Decision #DEC-302 converted to Jira ticket PROJ-842 with designated assignee."
                  </p>
                </div>
              </div>
            </div>

            <Link
              href="/settings/integrations"
              className="w-full py-3 rounded-xl btn-white-frost text-xs font-bold text-center block transition"
            >
              Configure Integrations
            </Link>
          </div>

        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          10. EMBEDDED AUTH SECTION
      ───────────────────────────────────────────────────────────── */}
      <section id="auth-section" className="py-20 px-6 max-w-md mx-auto w-full z-20">
        <div className="glass-card-elevated-frost rounded-3xl p-8 shadow-2xl space-y-6 relative border-white">
          <div className="space-y-2 text-center">
            <span className="px-3 py-1 rounded-full bg-indigo-100 text-[10px] font-mono font-bold text-[#4338CA] uppercase">
              {authMode === 'forgot' ? 'PASSWORD RECOVERY' : authMode === 'signin' ? 'AUTHENTICATION' : 'REGISTRATION'}
            </span>
            <h2 className="text-2xl font-sans font-extrabold text-[#1E1B4B] pt-1">
              {authMode === 'forgot' ? 'Reset Password' : authMode === 'signin' ? 'Welcome Back' : 'Create Meetrix Account'}
            </h2>
            <p className="text-xs font-sans text-[#475569] font-medium">
              {authMode === 'forgot'
                ? 'Enter your registered work email to receive a password reset code.'
                : authMode === 'signin'
                ? 'Sign in to access your team decision audit trail and owner index.'
                : 'Get started with autonomous meeting decision tracking in seconds.'}
            </p>
          </div>

          {/* Mode Switcher Pill Bar */}
          {authMode !== 'forgot' && (
            <div className="grid grid-cols-2 gap-1 p-1 rounded-2xl bg-indigo-50 border border-indigo-100">
              <button
                onClick={() => setAuthMode('signin')}
                className={`py-2.5 rounded-xl text-xs font-sans font-bold transition ${
                  authMode === 'signin'
                    ? 'bg-white text-[#3730A3] shadow-sm'
                    : 'text-[#64748B] hover:text-[#1E1B4B]'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => setAuthMode('signup')}
                className={`py-2.5 rounded-xl text-xs font-sans font-bold transition ${
                  authMode === 'signup'
                    ? 'bg-white text-[#3730A3] shadow-sm'
                    : 'text-[#64748B] hover:text-[#1E1B4B]'
                }`}
              >
                Create Account
              </button>
            </div>
          )}

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-mono font-bold">
              {error}
            </div>
          )}

          {successMessage && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-mono font-bold">
              {successMessage}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4 font-sans text-xs">
            
            {/* FULL NAME FIELD */}
            {authMode === 'signup' && (
              <div className="space-y-1.5 animate-in fade-in duration-200">
                <label className="text-[#3730A3] font-semibold">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#4F46E5] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="Alex Rivera"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-white border border-indigo-200 rounded-xl pl-10 pr-4 py-3 text-xs text-[#1E1B4B] placeholder-[#94A3B8] focus:outline-none focus:border-[#4F46E5] focus:ring-2 focus:ring-[#4F46E5]/20 transition shadow-sm"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-[#3730A3] font-semibold">Work Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#4F46E5] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white border border-indigo-200 rounded-xl pl-10 pr-4 py-3 text-xs text-[#1E1B4B] placeholder-[#94A3B8] focus:outline-none focus:border-[#4F46E5] focus:ring-2 focus:ring-[#4F46E5]/20 transition shadow-sm"
                />
              </div>
            </div>

            {authMode !== 'forgot' && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[#3730A3] font-semibold">Password</label>
                  <button
                    type="button"
                    onClick={() => { setAuthMode('forgot'); setError(''); setSuccessMessage(''); }}
                    className="text-[11px] text-[#4F46E5] hover:underline font-semibold"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#4F46E5] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-white border border-indigo-200 rounded-xl pl-10 pr-4 py-3 text-xs text-[#1E1B4B] placeholder-[#94A3B8] focus:outline-none focus:border-[#4F46E5] focus:ring-2 focus:ring-[#4F46E5]/20 transition shadow-sm"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl btn-indigo-glow font-bold text-xs transition flex items-center justify-center space-x-2"
            >
              <span>
                {loading
                  ? 'Processing...'
                  : authMode === 'forgot'
                  ? 'Send Reset Link'
                  : authMode === 'signin'
                  ? 'Sign In to Dashboard'
                  : 'Create Free Account'}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {authMode === 'forgot' ? (
              <button
                type="button"
                onClick={() => setAuthMode('signin')}
                className="w-full text-center text-xs text-[#64748B] hover:text-[#1E1B4B] font-medium pt-2 transition"
              >
                Back to Sign In
              </button>
            ) : (
              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={handleGuestLogin}
                  className="w-full py-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-xs font-bold text-[#3730A3] transition flex items-center justify-center gap-1.5"
                >
                  <User className="w-3.5 h-3.5 text-[#4F46E5]" />
                  <span>Continue as Guest Demo</span>
                </button>
              </div>
            )}
          </form>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          11. FOOTER
      ───────────────────────────────────────────────────────────── */}
      <footer className="border-t border-indigo-100 py-10 px-6 text-center text-xs font-sans text-[#475569] z-20 bg-white/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <MeetrixLogo size="sm" />
          <div className="flex items-center space-x-6 text-xs text-[#3730A3] font-semibold">
            <a href="#capabilities" className="hover:text-[#4F46E5] transition">Capabilities</a>
            <a href="#demo" className="hover:text-[#4F46E5] transition">Demo</a>
            <a href="#accountability" className="hover:text-[#4F46E5] transition">Team Reliability</a>
            <Link href="/dashboard" className="hover:text-[#4F46E5] transition">Dashboard</Link>
          </div>
          <p>© 2026 Meetrix AI Inc. Authoritative Decision & Owner Accountability Engine.</p>
        </div>
      </footer>

    </div>
  );
}
