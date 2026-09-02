import Link from 'next/link';
import { Mic, Upload, Play, Clock, Users, ArrowUpRight, Search, Sparkles, Radio } from 'lucide-react';
import { MOCK_MEETINGS } from '@/lib/mockData';

export default function MeetingsPage() {
  return (
    <div className="space-y-8 pb-24">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1E1B4B] tracking-tight flex items-center gap-2.5">
            <Mic className="w-6 h-6 text-[#4F46E5]" />
            <span>Ingested Meetings & Diarized Transcripts</span>
          </h1>
          <p className="text-xs text-[#475569] mt-1 font-medium">
            Browse ingested audio syncs, transcript speaker utterances, and extracted decision items.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            href="/meetings/live"
            className="flex items-center space-x-2 px-4 py-2.5 rounded-2xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-800 font-bold text-xs shadow-sm transition"
          >
            <Radio className="w-4 h-4 text-rose-600 animate-pulse" />
            <span>Start Live Meeting</span>
          </Link>

          <Link
            href="/meetings/upload"
            className="flex items-center space-x-2 px-5 py-2.5 rounded-2xl btn-indigo-glow text-white font-bold text-xs shadow-md transition"
          >
            <Upload className="w-4 h-4" />
            <span>Upload Audio File</span>
          </Link>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-3xl bg-white border border-indigo-100 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[#4F46E5] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search meetings by keyword, title or speaker..."
            className="w-full bg-indigo-50/50 border border-indigo-100 rounded-2xl pl-10 pr-4 py-2 text-xs text-[#1E1B4B] placeholder-[#64748B] focus:outline-none focus:border-[#4F46E5] focus:ring-2 focus:ring-[#4F46E5]/20 font-medium"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <button className="px-3.5 py-1.5 rounded-xl bg-[#4F46E5] text-white text-xs font-bold shadow-sm">
            All Statuses
          </button>
          <button className="px-3.5 py-1.5 rounded-xl bg-indigo-50 text-[#3730A3] border border-indigo-200 text-xs font-bold hover:bg-indigo-100 transition">
            Analyzed
          </button>
          <button className="px-3.5 py-1.5 rounded-xl bg-indigo-50 text-[#3730A3] border border-indigo-200 text-xs font-bold hover:bg-indigo-100 transition">
            Processing
          </button>
        </div>
      </div>

      {/* Meetings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {MOCK_MEETINGS.map((meeting) => (
          <div
            key={meeting.id}
            className="glass-card-frost rounded-3xl p-6 space-y-4 border-white shadow-md hover:border-indigo-200 transition group flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-mono font-bold">
                  {meeting.status}
                </span>
                <span className="text-[11px] font-mono text-[#64748B]" suppressHydrationWarning>
                  {(meeting as any).createdAt ? new Date((meeting as any).createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : (meeting as any).date || 'Jan 8, 2026'}
                </span>
              </div>

              <h2 className="text-lg font-bold text-[#1E1B4B] group-hover:text-[#4F46E5] transition leading-snug">
                {meeting.title}
              </h2>

              <p className="text-xs text-[#475569] line-clamp-2 leading-relaxed font-medium">
                {(meeting as any).summary}
              </p>
            </div>

            <div className="pt-4 border-t border-indigo-100 flex items-center justify-between text-xs font-mono">
              <div className="flex items-center space-x-3 text-[#64748B]">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-[#4F46E5]" />
                  <span>{(meeting as any).duration ? `${(meeting as any).duration}s` : '25 mins'}</span>
                </span>
                <span className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-[#4F46E5]" />
                  <span>{(meeting as any).speakers?.length || 2} speakers</span>
                </span>
              </div>

              <Link
                href={`/meetings/${meeting.id}`}
                className="flex items-center space-x-1 font-bold text-[#4F46E5] hover:text-[#3730A3] transition"
              >
                <span>View Transcript</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
