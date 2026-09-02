'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Video,
  Calendar as CalendarIcon,
  Briefcase,
  CheckCircle2,
  Clock,
  Sparkles,
  Mic,
  SlidersHorizontal,
  Maximize2,
  MoreVertical,
  ChevronRight,
  Plus,
  Send,
  AlertTriangle,
  TrendingUp,
  Award,
  Users,
  LayoutGrid,
  Loader2,
  Check,
  X,
  Filter,
} from 'lucide-react';

export default function DashboardPage() {
  const [activeTimeView, setActiveTimeView] = useState<'day' | 'week' | 'month'>('week');
  const [selectedTeamFilter, setSelectedTeamFilter] = useState<string>('All Teams');
  const [showFilterDrawer, setShowFilterDrawer] = useState<boolean>(false);

  const [aiPrompt, setAiPrompt] = useState('');
  const [promptSubmitted, setPromptSubmitted] = useState<string | null>(null);

  const [stats, setStats] = useState<any>(null);
  const [staleDecisions, setStaleDecisions] = useState<any[]>([]);

  // Calendar live sync state
  const [isCalendarSyncing, setIsCalendarSyncing] = useState(false);
  const [calendarSynced, setCalendarSynced] = useState(true);

  // Dynamic live current date
  const currentDateFormatted = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  // Calculate current week dates dynamically
  const getCurrentWeekDates = () => {
    const today = new Date();
    const currentDayOfWeek = today.getDay();
    const distanceToMonday = currentDayOfWeek === 0 ? -6 : 1 - currentDayOfWeek;
    const monday = new Date(today);
    monday.setDate(today.getDate() + distanceToMonday);

    const week = [];
    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    for (let i = 0; i < 7; i++) {
      const dayDate = new Date(monday);
      dayDate.setDate(monday.getDate() + i);
      week.push({
        dayName: dayNames[i],
        dateNum: dayDate.getDate(),
        isToday: dayDate.toDateString() === today.toDateString(),
      });
    }
    return week;
  };

  const handleSyncCalendarClick = async () => {
    setIsCalendarSyncing(true);
    await new Promise((res) => setTimeout(res, 800));
    setIsCalendarSyncing(false);
    setCalendarSynced(true);
  };

  useEffect(() => {
    async function loadData() {
      try {
        const [statsRes, decisionsRes] = await Promise.all([
          fetch('/api/accountability'),
          fetch('/api/decisions?status=STALE'),
        ]);

        const statsData = await statsRes.json();
        const decisionsData = await decisionsRes.json();

        setStats(statsData);
        setStaleDecisions(decisionsData.decisions || []);
      } catch (err) {
        console.error(err);
      }
    }
    loadData();
  }, []);

  // Dynamic metrics computed per activeTimeView (Day vs Week vs Month)
  const currentViewData = {
    day: {
      followThrough: '94%',
      followChange: '↑ 4% vs yesterday',
      velocity: '1.2d',
      velocityLabel: 'Same-day resolution SLA',
      activeDecisions: stats?.metrics?.totalDecisions ? Math.min(stats.metrics.totalDecisions, 4) : 4,
      tasksToday: '3',
      tasksDetails: '2 action items completed • 1 pending review',
      updatedText: 'Updated just now • Live Day Stream',
    },
    week: {
      followThrough: stats?.metrics?.followThroughRate ? `${Math.round(stats.metrics.followThroughRate)}%` : '88%',
      followChange: '↑ 12% vs last week',
      velocity: stats?.metrics?.avgDaysToResolve ? `${stats.metrics.avgDaysToResolve}d` : '2.4d',
      velocityLabel: 'Average resolution SLA',
      activeDecisions: stats?.metrics?.totalDecisions || 14,
      tasksToday: '8',
      tasksDetails: '4 action items completed • 4 pending review',
      updatedText: 'Updated 5m ago • Meetrix AI v2.4 Engine',
    },
    month: {
      followThrough: '95%',
      followChange: '↑ 18% vs last month',
      velocity: '3.1d',
      velocityLabel: 'Monthly average resolution SLA',
      activeDecisions: 42,
      tasksToday: '28',
      tasksDetails: '20 action items completed • 8 pending review',
      updatedText: 'Updated 10m ago • Monthly Aggregate Stream',
    },
  }[activeTimeView];

  return (
    <div className="space-y-8 select-none font-sans pb-32 max-w-7xl mx-auto">
      {/* ── Top Header Title & Time Filter Bar ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-sans font-extrabold text-[#1E1B4B] tracking-tight">
            Workspace Overview
          </h1>
          <p className="text-xs font-mono font-bold text-[#4338CA] mt-1" suppressHydrationWarning>
            {currentViewData.updatedText} {selectedTeamFilter !== 'All Teams' ? `• Filtered by ${selectedTeamFilter}` : ''}
          </p>
        </div>

        {/* Time View Filter Pills & Slider Drawer */}
        <div className="flex items-center space-x-2">
          <div className="flex items-center p-1 rounded-full bg-white/90 border border-indigo-200 shadow-sm">
            {(['day', 'week', 'month'] as const).map((view) => (
              <button
                key={view}
                onClick={() => setActiveTimeView(view)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition capitalize ${
                  activeTimeView === view
                    ? 'bg-[#4F46E5] text-white shadow-sm'
                    : 'text-[#64748B] hover:text-[#1E1B4B]'
                }`}
              >
                {view}
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowFilterDrawer(!showFilterDrawer)}
            className={`p-2.5 rounded-full border transition shadow-sm ${
              showFilterDrawer || selectedTeamFilter !== 'All Teams'
                ? 'bg-indigo-50 border-[#4F46E5] text-[#3730A3]'
                : 'bg-white border-indigo-200 text-[#4F46E5] hover:border-[#4F46E5]'
            }`}
            title="Toggle Team Filters"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Quick Team Filter Bar (Toggled by Sliders Icon) */}
      {showFilterDrawer && (
        <div className="p-4 rounded-2xl bg-white border border-indigo-200 space-y-2 shadow-sm animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-[#3730A3] uppercase tracking-wider flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-[#4F46E5]" /> Filter Analytics by Team:
            </span>
            <button
              onClick={() => setShowFilterDrawer(false)}
              className="text-[#64748B] hover:text-[#1E1B4B] p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex flex-wrap gap-2 pt-1">
            {['All Teams', 'Engineering', 'Product & Design', 'Sales & Growth', 'DevOps & Cloud'].map((team) => (
              <button
                key={team}
                onClick={() => setSelectedTeamFilter(team)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold transition border ${
                  selectedTeamFilter === team
                    ? 'bg-indigo-50 border-[#4F46E5] text-[#3730A3] shadow-2xs'
                    : 'bg-slate-50 border-slate-200 text-[#64748B] hover:text-[#1E1B4B]'
                }`}
              >
                {team}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Stale Decision Warning Alert Banner (If Any) ── */}
      {staleDecisions.length > 0 && (
        <div className="p-4 rounded-3xl bg-rose-50 border border-rose-200 flex items-center justify-between gap-3 text-rose-800 shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-2xl bg-rose-100 flex items-center justify-center shrink-0 text-rose-700 border border-rose-300">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-xs text-rose-900">
                {staleDecisions.length} Stale Decision{staleDecisions.length > 1 ? 's' : ''} Require Attention
              </h3>
              <p className="text-[11px] text-rose-700">
                Unacted commitments from past meetings awaiting follow-through verification.
              </p>
            </div>
          </div>

          <Link
            href="/decisions?status=STALE"
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shrink-0 transition shadow-sm"
          >
            Review Stale Ledger
          </Link>
        </div>
      )}

      {/* ── Top Hero Grid: Next Meeting & Mini Calendar / Tasks Today ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Top Left Widget: Next Meeting Card */}
        <div className="lg:col-span-5 glass-card-frost rounded-3xl p-6 relative overflow-hidden flex flex-col justify-between space-y-6 border-white shadow-md">
          <div className="flex items-center space-x-2 text-xs font-mono text-[#4338CA] font-bold">
            <div className="w-7 h-7 rounded-xl bg-indigo-100 flex items-center justify-center text-[#4F46E5]">
              <Video className="w-3.5 h-3.5" />
            </div>
            <span>Next Scheduled Meeting</span>
          </div>

          <div>
            <div className="flex items-baseline space-x-3">
              <h2 className="text-4xl font-extrabold text-[#1E1B4B] tracking-tight">
                2:30 PM
              </h2>
              <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-mono font-bold">
                in 45 minutes
              </span>
            </div>
            <p className="text-sm font-semibold text-[#475569] mt-1">
              Team Standup & Architecture Release Sync
            </p>
          </div>

          {/* Action Pills */}
          <div className="flex items-center space-x-2 pt-2">
            <Link
              href="/meetings/live"
              className="px-5 py-2.5 rounded-full btn-indigo-glow font-bold text-xs shadow-md transition"
            >
              Join Now
            </Link>
            <button className="px-4 py-2.5 rounded-full bg-white border border-indigo-200 text-xs font-bold text-[#1E1B4B] hover:bg-indigo-50 transition">
              Edit
            </button>
            <button className="px-4 py-2.5 rounded-full bg-white border border-rose-200 text-xs font-bold text-rose-700 hover:bg-rose-50 transition">
              Cancel
            </button>
          </div>
        </div>

        {/* Top Right Widget: Mini Calendar & Tasks Today Card */}
        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Mini Calendar Card */}
          <div className="glass-card-frost rounded-3xl p-5 space-y-4 border-white shadow-md">
            <div className="flex items-center justify-between text-xs font-bold text-[#1E1B4B]">
              <span suppressHydrationWarning>{currentDateFormatted}</span>
              <button
                onClick={handleSyncCalendarClick}
                disabled={isCalendarSyncing}
                className={`px-3 py-1 rounded-full text-[10px] font-mono font-bold transition flex items-center gap-1.5 ${
                  isCalendarSyncing
                    ? 'bg-indigo-100 text-[#4338CA] cursor-wait'
                    : calendarSynced
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 shadow-2xs'
                    : 'bg-indigo-50 text-[#4338CA] hover:bg-indigo-100'
                }`}
              >
                {isCalendarSyncing ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin text-[#4F46E5]" />
                    <span>Syncing...</span>
                  </>
                ) : calendarSynced ? (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Synced Live 🟢</span>
                  </>
                ) : (
                  <span>Sync Calendar</span>
                )}
              </button>
            </div>

            {/* Calendar Days & Dates (Dynamic Current Week) */}
            <div className="grid grid-cols-7 gap-1 text-center font-mono text-[10px]">
              {getCurrentWeekDates().map((d) => (
                <span key={d.dayName} className="text-[#64748B] font-bold py-1">
                  {d.dayName}
                </span>
              ))}
              {getCurrentWeekDates().map((d) => (
                <div key={d.dayName + d.dateNum} className="py-1 flex items-center justify-center">
                  <span
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition ${
                      d.isToday
                        ? 'bg-[#4F46E5] text-white shadow-sm ring-2 ring-[#4F46E5]/30 font-extrabold'
                        : 'text-[#475569] hover:text-[#1E1B4B] hover:bg-indigo-50/50'
                    }`}
                  >
                    {d.dateNum}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Tasks Today Summary Card (Dynamic based on Day / Week / Month) */}
          <div className="glass-card-frost rounded-3xl p-6 flex flex-col justify-between space-y-4 border-white shadow-md">
            <div className="flex items-center space-x-2 text-xs font-mono text-[#4338CA] font-bold">
              <div className="w-7 h-7 rounded-xl bg-indigo-100 flex items-center justify-center text-[#4F46E5]">
                <Briefcase className="w-3.5 h-3.5" />
              </div>
              <span className="capitalize">Tasks ({activeTimeView})</span>
            </div>

            <div>
              <div className="text-3xl font-extrabold text-[#1E1B4B]">
                {currentViewData.tasksToday} <span className="text-xs font-mono font-normal text-[#64748B]">items</span>
              </div>
              <p className="text-xs text-[#475569] mt-1 font-medium">
                {currentViewData.tasksDetails}
              </p>
            </div>

            <Link
              href="/action-items"
              className="w-full py-2.5 rounded-2xl btn-white-frost text-xs font-bold text-center block transition"
            >
              Manage Action Items
            </Link>
          </div>
        </div>
      </div>

      {/* ── Key Metrics Showcase Cards Grid (Dynamic per Day / Week / Month) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="glass-card-frost rounded-3xl p-6 space-y-2 border-white shadow-md">
          <div className="flex items-center justify-between text-xs font-mono text-[#4338CA] font-bold">
            <span>TEAM FOLLOW-THROUGH</span>
            <Award className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-3xl font-extrabold text-[#1E1B4B] font-mono">
            {currentViewData.followThrough}
          </p>
          <p className="text-xs text-emerald-700 font-bold font-mono">{currentViewData.followChange}</p>
        </div>

        <div className="glass-card-frost rounded-3xl p-6 space-y-2 border-white shadow-md">
          <div className="flex items-center justify-between text-xs font-mono text-[#4338CA] font-bold">
            <span>DECISION VELOCITY</span>
            <TrendingUp className="w-4 h-4 text-[#4F46E5]" />
          </div>
          <p className="text-3xl font-extrabold text-[#1E1B4B] font-mono">
            {currentViewData.velocity}
          </p>
          <p className="text-xs text-[#4338CA] font-bold font-mono">{currentViewData.velocityLabel}</p>
        </div>

        <div className="glass-card-frost rounded-3xl p-6 space-y-2 border-white shadow-md">
          <div className="flex items-center justify-between text-xs font-mono text-[#4338CA] font-bold">
            <span>ACTIVE DECISIONS</span>
            <CheckCircle2 className="w-4 h-4 text-[#4F46E5]" />
          </div>
          <p className="text-3xl font-extrabold text-[#1E1B4B] font-mono">
            {currentViewData.activeDecisions}
          </p>
          <p className="text-xs text-[#64748B] font-medium">Zod parsed & owner assigned</p>
        </div>
      </div>
    </div>
  );
}
