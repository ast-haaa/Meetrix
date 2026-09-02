'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Mic,
  Square,
  Radio,
  Clock,
  Zap,
  Sparkles,
  Loader2,
  CheckCircle2,
  AlertCircle,
  FileAudio,
  ArrowLeft,
  Volume2,
} from 'lucide-react';
import { PreMeetingBriefingCard } from '@/components/meetings/PreMeetingBriefingCard';

export default function LiveMeetingPage() {
  const router = useRouter();

  // Setup state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [chunkDuration, setChunkDuration] = useState<number>(12);

  // Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [meetingId, setMeetingId] = useState<string | null>(null);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [chunkCount, setChunkCount] = useState(0);
  const [pendingUploads, setPendingUploads] = useState(0);
  const [liveUtterances, setLiveUtterances] = useState<any[]>([]);
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [micPermissionError, setMicPermissionError] = useState<string | null>(null);

  // Refs for recording & audio streams
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const allChunksRef = useRef<Blob[]>([]);
  const chunkIndexRef = useRef<number>(0);
  const meetingIdRef = useRef<string | null>(null);

  // Clean up recording stream on unmount
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  // Format seconds to 00:00:00
  const formatTime = (totalSecs: number) => {
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Start Live Meeting Session
  const handleStartRecording = async () => {
    setMicPermissionError(null);
    try {
      // 1. Initialize DB meeting session record
      const startRes = await fetch('/api/meetings/live/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title || `Live Meeting Session (${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})`,
          description: description || 'Live meeting recording session.',
        }),
      });

      const startData = await startRes.json();
      if (!startData.success || !startData.meeting) {
        throw new Error(startData.error || 'Failed to start meeting session');
      }

      const activeId = startData.meeting.id;
      setMeetingId(activeId);
      meetingIdRef.current = activeId;
      allChunksRef.current = [];
      chunkIndexRef.current = 0;
      setLiveUtterances([]);

      // 2. Request user microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // 3. Setup MediaRecorder with best browser audio MIME type
      let mimeType = 'audio/webm';
      if (!MediaRecorder.isTypeSupported('audio/webm')) {
        if (MediaRecorder.isTypeSupported('audio/mp4')) mimeType = 'audio/mp4';
        else if (MediaRecorder.isTypeSupported('audio/ogg')) mimeType = 'audio/ogg';
      }

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;

      // 4. Handle incoming chunk data
      mediaRecorder.ondataavailable = async (e: BlobEvent) => {
        if (e.data && e.data.size > 0) {
          allChunksRef.current.push(e.data);
          const currentChunkIdx = chunkIndexRef.current++;

          setChunkCount((prev) => prev + 1);
          setPendingUploads((prev) => prev + 1);

          try {
            const formData = new FormData();
            formData.append('meetingId', activeId);
            formData.append('chunkIndex', currentChunkIdx.toString());
            formData.append('audioChunk', e.data, `chunk-${currentChunkIdx}.webm`);

            const chunkRes = await fetch('/api/meetings/live/chunk', {
              method: 'POST',
              body: formData,
            });

            const chunkResult = await chunkRes.json();
            if (chunkResult.success && chunkResult.utterance) {
              setLiveUtterances((prev) => [...prev, chunkResult.utterance]);
            }
          } catch (err) {
            console.error('Chunk upload warning:', err);
          } finally {
            setPendingUploads((prev) => Math.max(0, prev - 1));
          }
        }
      };

      // Start recording with interval slices
      mediaRecorder.start(chunkDuration * 1000);
      setIsRecording(true);

      // Start timer interval
      setTimerSeconds(0);
      timerIntervalRef.current = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);

    } catch (err: any) {
      console.error('Failed to start recording:', err);
      setMicPermissionError(err.message || 'Microphone access denied. Please allow microphone permissions.');
      setIsRecording(false);
    }
  };

  // Stop Recording & Finalize Meeting
  const handleStopRecording = async () => {
    if (!mediaRecorderRef.current || !meetingIdRef.current) return;

    setIsFinalizing(true);

    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    if ((window as any).__streamTimer) clearInterval((window as any).__streamTimer);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
    }

    if (mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }

    await new Promise((res) => setTimeout(res, 800));

    try {
      const activeMeetingId = meetingIdRef.current;

      const mimeType = mediaRecorderRef.current?.mimeType || 'audio/webm';
      const fullLengthAudioBlob = new Blob(allChunksRef.current, { type: mimeType });

      const formData = new FormData();
      formData.append('meetingId', activeMeetingId);
      formData.append(
        'fullAudioFile',
        fullLengthAudioBlob,
        `live-meeting-${activeMeetingId}.${mimeType.includes('mp4') ? 'mp4' : 'webm'}`
      );

      const res = await fetch('/api/meetings/live/finalize', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        router.push(`/meetings/${activeMeetingId}`);
      } else {
        throw new Error(data.error || 'Finalization failed');
      }
    } catch (err: any) {
      console.error('Finalize error:', err);
      setIsFinalizing(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-10 select-none font-sans pb-24">
      {/* Top Header Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-indigo-100">
        <div>
          <Link
            href="/meetings"
            className="inline-flex items-center space-x-1.5 text-xs text-[#4F46E5] hover:text-[#3730A3] transition font-mono mb-2 font-bold"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Meetings</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-sans font-extrabold text-[#1E1B4B] tracking-tight flex items-center gap-2.5">
            <Radio className="w-6 h-6 text-rose-600 animate-pulse" />
            <span>Start Live Meeting Session</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#475569] mt-1 font-medium max-w-3xl">
            Capture live microphone audio in real-time. Audio is automatically split into background chunks and concatenated into one raw full-length recording.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center bg-white border border-indigo-200 rounded-2xl p-1 text-xs font-bold shrink-0 shadow-sm self-start sm:self-auto">
          <Link
            href="/meetings/upload"
            className="px-4 py-2 rounded-xl text-[#64748B] hover:text-[#1E1B4B] transition flex items-center gap-1.5"
          >
            <FileAudio className="w-4 h-4" />
            <span>Upload File</span>
          </Link>
          <span className="px-4 py-2 rounded-xl bg-[#4F46E5] text-white shadow-sm flex items-center gap-1.5">
            <Radio className="w-4 h-4" />
            <span>Live Recording</span>
          </span>
        </div>
      </div>

      {/* Mic Permission Error Alert */}
      {micPermissionError && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-mono font-bold flex items-center gap-3 shadow-sm">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{micPermissionError}</span>
        </div>
      )}

      {/* SECTION 1: Spacious Live Recorder Studio */}
      <div className="w-full">
        {!isRecording ? (
          <div className="glass-card-elevated-frost rounded-3xl p-6 sm:p-10 border-white shadow-lg space-y-6">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="block text-xs font-mono font-bold text-[#1E1B4B]">
                    Meeting Title
                  </label>
                  <input
                    type="text"
                    placeholder={`e.g., Live Architecture Review (${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})`}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-white border border-indigo-200 rounded-2xl px-4 py-3.5 text-xs sm:text-sm text-[#1E1B4B] placeholder-[#64748B] focus:outline-none focus:border-[#4F46E5] font-medium shadow-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-mono font-bold text-[#1E1B4B]">
                    Session Description / Objective
                  </label>
                  <input
                    type="text"
                    placeholder="Optional meeting agenda, notes, or target discussion outcomes..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-white border border-indigo-200 rounded-2xl px-4 py-3.5 text-xs sm:text-sm text-[#1E1B4B] placeholder-[#64748B] focus:outline-none focus:border-[#4F46E5] font-medium shadow-sm"
                  />
                </div>
              </div>

              {/* Chunk Interval Selector */}
              <div className="pt-4 border-t border-indigo-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-mono font-bold text-[#1E1B4B]">Background Chunking Interval</span>
                  <p className="text-xs text-[#64748B] font-medium">Interval for real-time speech slice processing</p>
                </div>
                <div className="flex items-center gap-2">
                  {[10, 12, 15].map((sec) => (
                    <button
                      key={sec}
                      type="button"
                      onClick={() => setChunkDuration(sec)}
                      className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition border ${
                        chunkDuration === sec
                          ? 'bg-indigo-50 border-[#4F46E5] text-[#3730A3] shadow-sm'
                          : 'bg-white border-indigo-200 text-[#64748B] hover:text-[#1E1B4B]'
                      }`}
                    >
                      {sec}s slices
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={handleStartRecording}
              className="w-full py-4 rounded-2xl btn-indigo-glow font-bold text-sm transition flex items-center justify-center space-x-2.5 shadow-lg cursor-pointer"
            >
              <Mic className="w-5 h-5" />
              <span>Start Live Microphone Session</span>
            </button>
          </div>
        ) : (
          /* Active Recording Interface */
          <div className="glass-card-elevated-frost rounded-3xl p-6 sm:p-10 border-rose-200 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-indigo-100">
              <div className="flex items-center space-x-3">
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-rose-50 border border-rose-200 text-rose-800 text-xs font-mono font-bold">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-ping shrink-0" />
                  <span>LIVE RECORDING ACTIVE</span>
                </div>
                <h3 className="text-base font-sans font-bold text-[#1E1B4B] truncate">
                  {title || 'Live Meeting Session'}
                </h3>
              </div>

              {/* Timer Counter */}
              <div className="flex items-center space-x-2 font-mono font-extrabold text-2xl text-[#1E1B4B] bg-white px-5 py-2.5 rounded-2xl border border-indigo-100 shadow-sm">
                <Clock className="w-5 h-5 text-rose-600" />
                <span>{formatTime(timerSeconds)}</span>
              </div>
            </div>

            {/* Glowing Waveform Visualizer */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-5 rounded-2xl bg-white border border-indigo-100 flex items-center justify-between gap-3 shadow-sm">
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#3730A3]">
                  <Volume2 className="w-5 h-5 text-[#4F46E5]" />
                  <span>Mic Spectrum</span>
                </div>
                <div className="flex items-center gap-1.5 h-10 flex-1 justify-center px-4">
                  {[40, 75, 30, 90, 60, 100, 45, 80, 35, 95, 65, 85, 50, 70, 40].map((h, i) => (
                    <span
                      key={i}
                      className="w-2 bg-gradient-to-t from-[#4F46E5] to-rose-500 rounded-full animate-pulse"
                      style={{
                        height: `${Math.max(20, (h * (timerSeconds % 4 + 1)) % 100)}%`,
                        animationDuration: `${0.4 + (i % 5) * 0.2}s`,
                      }}
                    />
                  ))}
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-indigo-100 space-y-2 text-xs font-mono shadow-sm">
                <div className="flex justify-between text-[#64748B]">
                  <span>Processed Chunks:</span>
                  <span className="text-[#1E1B4B] font-bold">{chunkCount} ({chunkDuration}s each)</span>
                </div>
                <div className="flex justify-between text-[#64748B]">
                  <span>Background Stream:</span>
                  <span className="text-emerald-700 font-bold flex items-center gap-1">
                    {pendingUploads > 0 ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-[#4F46E5]" />
                        Uploading Audio Slices
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Active Connection
                      </>
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* Stop & Finalize Button */}
            <button
              onClick={handleStopRecording}
              disabled={isFinalizing}
              className="w-full py-4 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm transition flex items-center justify-center space-x-2.5 shadow-lg cursor-pointer"
            >
              {isFinalizing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Concatenating Audio & Finalizing Decisions...</span>
                </>
              ) : (
                <>
                  <Square className="w-5 h-5 fill-current" />
                  <span>Stop Recording & Finalize Meeting</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* SECTION 2: Full-Width Executive Briefing Card Section */}
      <div className="w-full">
        <PreMeetingBriefingCard />
      </div>
    </div>
  );
}
