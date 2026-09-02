'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import {
  Mic,
  Play,
  Pause,
  Clock,
  UserCheck,
  GitCommit,
  CheckSquare,
  Sparkles,
  Search,
  ExternalLink,
  Tag,
} from 'lucide-react';
import { MOCK_MEETINGS } from '@/lib/mockData';

export default function MeetingDetailPage() {
  const params = useParams();
  const meetingId = params?.meetingId as string;

  const meeting = MOCK_MEETINGS.find((m) => m.id === meetingId) || MOCK_MEETINGS[0];

  const [isPlaying, setIsPlaying] = useState(false);
  const [activeUtteranceId, setActiveUtteranceId] = useState<string | null>(
    meeting.transcriptUtterances[0]?.id || null
  );
  const [activeTab, setActiveTab] = useState<'transcript' | 'decisions' | 'action-items'>('transcript');
  const [speakerMapping, setSpeakerMapping] = useState<{ [label: string]: string }>({
    'Speaker 0 (Priya)': 'Priya Sharma',
    'Speaker 1 (Arjun)': 'Arjun Mehta',
  });

  return (
    <div className="space-y-8 select-none font-sans pb-24">
      {/* Meeting Header Banner */}
      <div className="glass-card-frost rounded-3xl p-6 border-white space-y-4 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase bg-emerald-50 text-emerald-800 border border-emerald-200">
                {meeting.status}
              </span>
              <span className="text-xs text-[#64748B] font-mono font-bold flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-[#4F46E5]" />
                {Math.round(meeting.durationSeconds / 60)} minutes
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1E1B4B]">{meeting.title}</h1>
            <p className="text-xs text-[#475569] max-w-3xl font-medium">{meeting.description}</p>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="flex items-center space-x-2 px-5 py-2.5 rounded-2xl btn-indigo-glow text-white font-bold text-xs shadow-md transition"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
              <span>{isPlaying ? 'Pause Audio' : 'Play Synced Recording'}</span>
            </button>
          </div>
        </div>

        {/* Diarized Speakers Mapper Bar */}
        <div className="pt-4 border-t border-indigo-100 flex items-center space-x-4 overflow-x-auto">
          <span className="text-xs font-mono font-bold text-[#64748B] uppercase whitespace-nowrap">Diarized Owners:</span>
          {meeting.speakers.map((spk) => (
            <div
              key={spk.id}
              className="px-3.5 py-1.5 rounded-2xl bg-white border border-indigo-100 flex items-center space-x-2 shrink-0 text-xs text-[#1E1B4B] shadow-sm"
            >
              <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-[#3730A3] to-[#4F46E5] text-white text-[9px] font-bold flex items-center justify-center shrink-0 font-mono">
                {(spk.owner?.name || spk.speakerLabel).charAt(0).toUpperCase()}
              </div>
              <span className="font-bold text-[#1E1B4B]">{spk.speakerLabel}</span>
              <span className="text-[#64748B]">→</span>
              <span className="text-[#4F46E5] font-bold">{spk.owner?.name || 'Unassigned'}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center space-x-2 border-b border-indigo-100 pb-3">
        <button
          onClick={() => setActiveTab('transcript')}
          className={`px-4 py-2 rounded-2xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'transcript'
              ? 'bg-[#4F46E5] text-white shadow-sm'
              : 'text-[#64748B] hover:text-[#1E1B4B] hover:bg-white'
          }`}
        >
          <Mic className="w-4 h-4" /> Diarized Transcript ({meeting.transcriptUtterances.length})
        </button>

        <button
          onClick={() => setActiveTab('decisions')}
          className={`px-4 py-2 rounded-2xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'decisions'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'text-[#64748B] hover:text-[#1E1B4B] hover:bg-white'
          }`}
        >
          <GitCommit className="w-4 h-4" /> Extracted Decisions
        </button>

        <button
          onClick={() => setActiveTab('action-items')}
          className={`px-4 py-2 rounded-2xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'action-items'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-[#64748B] hover:text-[#1E1B4B] hover:bg-white'
          }`}
        >
          <CheckSquare className="w-4 h-4" /> Action Items
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'transcript' && (
        <div className="space-y-3">
          {meeting.transcriptUtterances.map((utt) => {
            const isActive = activeUtteranceId === utt.id;

            return (
              <div
                key={utt.id}
                onClick={() => setActiveUtteranceId(utt.id)}
                className={`p-4 rounded-3xl border transition cursor-pointer shadow-sm ${
                  isActive
                    ? 'bg-white border-[#4F46E5] ring-2 ring-[#4F46E5]/20'
                    : 'bg-white/80 border-indigo-100 hover:border-indigo-200'
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-1.5 font-mono">
                  <span className="font-bold text-[#4F46E5]">{utt.speakerName || utt.speakerLabel}</span>
                  <span className="text-[#64748B]">
                    {utt.startTime}s - {utt.endTime}s
                  </span>
                </div>
                <p className="text-sm font-sans text-[#1E1B4B] leading-relaxed font-medium">"{utt.text}"</p>
              </div>
            );
          })}
        </div>
      )}

      {activeTab === 'decisions' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-5 rounded-3xl bg-white border border-indigo-100 space-y-2 shadow-sm">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-emerald-50 text-emerald-800 border border-emerald-200">
              FULFILLED
            </span>
            <h4 className="text-base font-sans font-bold text-[#1E1B4B]">
              Migrate core database to PostgreSQL + Prisma ORM
            </h4>
            <p className="text-xs text-[#475569] font-medium">
              Evaluated MongoDB vs PostgreSQL for structural type safety and multi-tenant schema isolation.
            </p>
          </div>

          <div className="p-5 rounded-3xl bg-rose-50 border border-rose-200 space-y-2 shadow-sm">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-rose-100 text-rose-800 border border-rose-300">
              UNACTED ALERT
            </span>
            <h4 className="text-base font-sans font-bold text-[#1E1B4B]">
              Implement Whisper API + Speaker Diarization Ingestion Pipeline
            </h4>
            <p className="text-xs text-rose-800 font-medium">
              Automate speech-to-text transcript processing with automatic speaker attribution.
            </p>
          </div>
        </div>
      )}

      {activeTab === 'action-items' && (
        <div className="space-y-3">
          <div className="p-4 rounded-3xl bg-white border border-indigo-100 flex items-center justify-between shadow-sm">
            <div>
              <h4 className="text-sm font-bold text-[#1E1B4B]">Configure Slack incoming webhooks</h4>
              <p className="text-xs text-[#64748B]">Assigned to Alex Rivera • Due Friday</p>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 font-mono text-[10px] font-bold">
              OPEN
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
