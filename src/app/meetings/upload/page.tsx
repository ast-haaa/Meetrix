'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, FileAudio, Sparkles, CheckCircle2, Loader2, ArrowRight, GitCommit, CheckSquare, Radio } from 'lucide-react';
import Link from 'next/link';
import { MeetingDTO } from '@/types';
import { PreMeetingBriefingCard } from '@/components/meetings/PreMeetingBriefingCard';

export default function AudioUploadPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState<number>(0);
  const [resultMeeting, setResultMeeting] = useState<MeetingDTO | null>(null);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setIsProcessing(true);
    setStep(1);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title || file.name.replace(/\.[^/.]+$/, ''));
    formData.append('description', description || 'Audio recording ingested into AI engine.');

    try {
      setTimeout(() => setStep(2), 1200);
      setTimeout(() => setStep(3), 2200);

      const res = await fetch('/api/meetings/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (data.success && data.meeting) {
        setResultMeeting(data.meeting);
        setStep(4);
      }
    } catch (err) {
      console.error('Upload failed:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 select-none font-sans pb-24">
      {/* Header & Mode Switcher */}
      <div className="pt-2 border-b border-indigo-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-[#4338CA] text-xs font-mono font-bold uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5 text-[#4F46E5]" />
            <span>INGESTION & SPEECH-TO-TEXT PIPELINE</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-sans font-extrabold text-[#1E1B4B] tracking-tight">
            Ingest New Meeting Audio
          </h1>
          <p className="text-xs text-[#475569] mt-1 font-medium">
            Upload an audio or video recording file (.mp3, .wav, .m4a). The AI engine transcribes with speaker diarization and decision extraction.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center bg-white border border-indigo-200 rounded-2xl p-1 text-xs font-bold shrink-0 shadow-sm">
          <span className="px-3.5 py-1.5 rounded-xl bg-[#4F46E5] text-white shadow-sm flex items-center gap-1.5">
            <FileAudio className="w-3.5 h-3.5" />
            <span>Upload File</span>
          </span>
          <Link
            href="/meetings/live"
            className="px-3.5 py-1.5 rounded-xl text-[#64748B] hover:text-[#1E1B4B] transition flex items-center gap-1.5"
          >
            <Radio className="w-3.5 h-3.5 text-rose-600 animate-pulse" />
            <span>Live Recording</span>
          </Link>
        </div>
      </div>

      {!resultMeeting ? (
        <form onSubmit={handleUpload} className="space-y-6">
          {/* File Dropzone */}
          <div className="p-8 rounded-3xl border-2 border-dashed border-indigo-200 hover:border-[#4F46E5] bg-white transition text-center flex flex-col items-center justify-center space-y-3 cursor-pointer shadow-sm">
            <input
              type="file"
              accept="audio/*,video/*"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="hidden"
              id="audio-file-input"
            />
            <label htmlFor="audio-file-input" className="cursor-pointer flex flex-col items-center space-y-3 w-full">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-[#4F46E5] shadow-sm">
                <FileAudio className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-[#1E1B4B]">
                  {file ? file.name : 'Click to select audio recording file or drag & drop'}
                </p>
                <p className="text-[10px] text-[#64748B] font-mono mt-1">Supports MP3, WAV, M4A, WebM (Max 500MB)</p>
              </div>
            </label>
          </div>

          {/* Form Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono font-bold text-[#1E1B4B] mb-1.5">Meeting Title</label>
              <input
                type="text"
                placeholder="e.g., Sprint 15 Architecture & Release Sync"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-white border border-indigo-200 rounded-2xl px-4 py-2.5 text-xs text-[#1E1B4B] font-medium focus:outline-none focus:border-[#4F46E5] shadow-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-bold text-[#1E1B4B] mb-1.5">Description (Optional)</label>
              <input
                type="text"
                placeholder="Context or participant list"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-white border border-indigo-200 rounded-2xl px-4 py-2.5 text-xs text-[#1E1B4B] font-medium focus:outline-none focus:border-[#4F46E5] shadow-sm"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!file || isProcessing}
            className="w-full py-4 rounded-2xl btn-indigo-glow disabled:opacity-50 font-bold text-xs transition shadow-md flex items-center justify-center space-x-2"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processing Pipeline Step {step}/3...</span>
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                <span>Start AI Ingestion & Analysis</span>
              </>
            )}
          </button>
        </form>
      ) : (
        /* Complete View */
        <div className="glass-card-frost rounded-3xl p-6 space-y-6 border-white shadow-md">
          <div className="flex items-center space-x-3 text-emerald-700">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <h3 className="text-base font-bold text-[#1E1B4B]">Analysis & Diarization Complete!</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-indigo-100">
            <div className="space-y-2">
              <h4 className="text-xs font-mono font-bold text-[#3730A3] uppercase tracking-wider flex items-center gap-1.5">
                <GitCommit className="w-3.5 h-3.5 text-[#4F46E5]" /> Extracted Decisions ({resultMeeting.decisions.length})
              </h4>
              {resultMeeting.decisions.map((dec) => (
                <div key={dec.id} className="p-3 rounded-2xl bg-white border border-indigo-100 space-y-1 shadow-sm">
                  <p className="text-xs font-bold text-[#1E1B4B]">{dec.title}</p>
                  <p className="text-[11px] text-[#475569] font-medium">{dec.context}</p>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-mono font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1.5">
                <CheckSquare className="w-3.5 h-3.5 text-emerald-600" /> Action Items ({resultMeeting.actionItems.length})
              </h4>
              {resultMeeting.actionItems.map((act) => (
                <div key={act.id} className="p-3 rounded-2xl bg-white border border-indigo-100 space-y-1 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#1E1B4B]">{act.title}</span>
                    <span className="text-[10px] font-mono text-emerald-700 font-bold">{act.assigneeName}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
