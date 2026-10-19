'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  X,
  Calendar,
  Clock,
  Users,
  CheckCircle2,
  Plus,
  Trash2,
  Video,
  AlertTriangle,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { triggerGuestFreeze } from '@/components/guest/GuestModeBanner';

export interface TaskAllotment {
  id: string;
  title: string;
  ownerName: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  dueDate: string;
  notes: string;
  syncSlack: boolean;
  syncJira: boolean;
}

const TEAM_MEMBERS = [
  { name: 'Alex Rivera', role: 'Product Lead', avatar: 'AR', color: 'from-[#4F46E5] to-[#6366F1]' },
  { name: 'Sarah Chen', role: 'Lead Architect', avatar: 'SC', color: 'from-[#0D9488] to-[#2DD4BF]' },
  { name: 'David Kim', role: 'Backend Engineer', avatar: 'DK', color: 'from-[#7C3AED] to-[#A855F7]' },
  { name: 'Priya Sharma', role: 'Infrastructure Lead', avatar: 'PS', color: 'from-[#D97706] to-[#F59E0B]' },
  { name: 'Arjun Mehta', role: 'Full Stack', avatar: 'AM', color: 'from-[#2563EB] to-[#38BDF8]' },
];

const SUGGESTIONS = [
  'Weekly Team Sync',
  'Product Roadmap Review',
  'Architecture & DB Planning',
  'Sprint QA Hand-off',
];

export function ScheduleMeetingModal({
  isOpen,
  onClose,
  onSuccess,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (meeting: any) => void;
}) {
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [team, setTeam] = useState('Engineering');
  const [date, setDate] = useState(() => {
    const d = new Date();
    d.setMinutes(d.getMinutes() + 60);
    return d.toISOString().slice(0, 10);
  });
  const [time, setTime] = useState('14:30');
  const [durationMinutes, setDurationMinutes] = useState(45);
  const [locationOrLink, setLocationOrLink] = useState('Meetrix Live Room');

  const [tasks, setTasks] = useState<TaskAllotment[]>([
    {
      id: 'task-1',
      title: 'Review database migration scripts and test on staging',
      ownerName: 'Alex Rivera',
      priority: 'HIGH',
      dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      notes: '',
      syncSlack: true,
      syncJira: true,
    },
    {
      id: 'task-2',
      title: 'Verify Slack alerts and send summary report',
      ownerName: 'Sarah Chen',
      priority: 'MEDIUM',
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      notes: '',
      syncSlack: true,
      syncJira: false,
    },
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleAddTask = () => {
    const nextMember = TEAM_MEMBERS[tasks.length % TEAM_MEMBERS.length];
    const newTask: TaskAllotment = {
      id: `task-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title: '',
      ownerName: nextMember.name,
      priority: 'MEDIUM',
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      notes: '',
      syncSlack: true,
      syncJira: false,
    };
    setTasks([...tasks, newTask]);
  };

  const handleRemoveTask = (id: string) => {
    if (tasks.length <= 1) return;
    setTasks(tasks.filter((t) => t.id !== id));
  };

  const handleTaskChange = (id: string, field: keyof TaskAllotment, value: any) => {
    setTasks(tasks.map((t) => (t.id === id ? { ...t, [field]: value } : t)));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!title.trim()) {
      setError('Please enter a meeting title.');
      return;
    }

    const validTasks = tasks.filter((t) => t.title.trim().length > 0);
    if (validTasks.length === 0) {
      setError('Please add at least one task for the team.');
      return;
    }

    // Check if Guest user
    let isGuest = false;
    try {
      const cookies = document.cookie.split(';');
      for (const c of cookies) {
        const [k, v] = c.trim().split('=');
        if (k === 'session_user') {
          const parsed = JSON.parse(decodeURIComponent(v));
          if (parsed.role === 'guest' || parsed.email?.includes('guest')) {
            isGuest = true;
            break;
          }
        }
      }
    } catch {}

    if (isGuest) {
      triggerGuestFreeze('Scheduling meetings and assigning tasks to team members');
      return;
    }

    setIsSubmitting(true);

    try {
      const scheduledDateTime = new Date(`${date}T${time}:00`).toISOString();

      const res = await fetch('/api/meetings/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          team,
          scheduledAt: scheduledDateTime,
          durationMinutes,
          locationOrLink,
          tasks: validTasks,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        if (res.status === 403) {
          triggerGuestFreeze('Scheduling meetings and assigning tasks to team members');
          setIsSubmitting(false);
          return;
        }
        throw new Error(data.error || 'Failed to schedule meeting');
      }

      setSuccessMsg(`Meeting scheduled with ${validTasks.length} tasks!`);
      if (onSuccess) {
        onSuccess(data.meeting);
      }

      setTimeout(() => {
        setIsSubmitting(false);
        onClose();
        router.refresh();
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'Something went wrong.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#1E1B4B]/40 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl glass-card-elevated-frost bg-white/98 rounded-3xl border border-white shadow-[0_40px_100px_rgba(79,70,229,0.22)] overflow-hidden flex flex-col max-h-[92vh] text-left">
        
        {/* ── Top Bar ── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-indigo-100/90 bg-gradient-to-r from-indigo-50/60 via-white to-purple-50/60 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-2xl bg-[#4F46E5] text-white flex items-center justify-center shadow-sm">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-sans font-bold text-[#1E1B4B]">
                  Schedule Meeting & Assign Tasks
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-[#4338CA] text-[10px] font-mono font-bold">
                  {tasks.filter((t) => t.title.trim()).length} Tasks Allotted
                </span>
              </div>
              <p className="text-xs text-[#64748B]">
                Set the meeting time and assign clear tasks to team members.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-100 text-[#64748B] hover:text-[#1E1B4B] transition"
            title="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ── Scrollable Two-Column Body ── */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 flex-1 space-y-5">
          {error && (
            <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold flex items-center space-x-2 animate-in zoom-in-95">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Symmetrical Two-Column Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* ── Left Column (5 cols): Meeting Details ── */}
            <div className="lg:col-span-5 space-y-4 bg-slate-50/60 p-5 rounded-2xl border border-indigo-100">
              <div className="flex items-center justify-between pb-2 border-b border-indigo-100/70">
                <span className="text-xs font-mono font-bold text-[#4338CA] uppercase tracking-wider flex items-center gap-1.5">
                  <Video className="w-3.5 h-3.5 text-[#4F46E5]" />
                  1. Meeting Details
                </span>
                <span className="text-[10px] text-[#64748B] font-mono">Setup</span>
              </div>

              {/* Title & Quick Suggestions */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#1E1B4B]">Meeting Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Weekly Team Sync"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-white border border-indigo-200 rounded-xl px-3.5 py-2.5 text-xs text-[#1E1B4B] placeholder-[#94A3B8] focus:outline-none focus:border-[#4F46E5] font-medium shadow-2xs"
                />

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {SUGGESTIONS.map((s, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setTitle(s)}
                      className="px-2 py-0.5 rounded-lg bg-white hover:bg-indigo-50 border border-indigo-200 text-[10px] font-sans text-[#3730A3] transition"
                    >
                      + {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Date & Time Row */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#1E1B4B]">Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-white border border-indigo-200 rounded-xl px-3 py-2 text-xs text-[#1E1B4B] focus:outline-none focus:border-[#4F46E5]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#1E1B4B]">Time</label>
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full bg-white border border-indigo-200 rounded-xl px-3 py-2 text-xs text-[#1E1B4B] focus:outline-none focus:border-[#4F46E5]"
                  />
                </div>
              </div>

              {/* Duration & Team Row */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#1E1B4B]">Duration</label>
                  <select
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Number(e.target.value))}
                    className="w-full bg-white border border-indigo-200 rounded-xl px-3 py-2 text-xs text-[#1E1B4B] focus:outline-none focus:border-[#4F46E5]"
                  >
                    <option value={15}>15 mins</option>
                    <option value={30}>30 mins</option>
                    <option value={45}>45 mins</option>
                    <option value={60}>60 mins</option>
                    <option value={90}>90 mins</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#1E1B4B]">Team</label>
                  <select
                    value={team}
                    onChange={(e) => setTeam(e.target.value)}
                    className="w-full bg-white border border-indigo-200 rounded-xl px-3 py-2 text-xs text-[#1E1B4B] focus:outline-none focus:border-[#4F46E5]"
                  >
                    <option value="Engineering">Engineering</option>
                    <option value="Product & Design">Product & Design</option>
                    <option value="DevOps & Cloud">DevOps & Cloud</option>
                    <option value="Sales & Growth">Sales & Growth</option>
                  </select>
                </div>
              </div>

              {/* Location / Meeting Room */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#1E1B4B]">Location or Link</label>
                <input
                  type="text"
                  placeholder="e.g. Meetrix Live Room, Google Meet"
                  value={locationOrLink}
                  onChange={(e) => setLocationOrLink(e.target.value)}
                  className="w-full bg-white border border-indigo-200 rounded-xl px-3 py-2 text-xs text-[#1E1B4B] focus:outline-none focus:border-[#4F46E5]"
                />
              </div>

              {/* Meeting Notes */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#1E1B4B]">Notes (Optional)</label>
                <textarea
                  rows={2}
                  placeholder="Short summary of agenda..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-white border border-indigo-200 rounded-xl px-3 py-2 text-xs text-[#1E1B4B] placeholder-[#94A3B8] focus:outline-none focus:border-[#4F46E5] resize-none"
                />
              </div>
            </div>

            {/* ── Right Column (7 cols): Team Work Allotment ── */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-indigo-100">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-mono font-bold text-[#4338CA] uppercase tracking-wider flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-[#4F46E5]" />
                    2. Assign Tasks to Team
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-[10px] font-mono font-bold text-[#3730A3] border border-indigo-200">
                    {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleAddTask}
                  className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-xs font-bold text-[#3730A3] transition flex items-center space-x-1 shadow-2xs hover:scale-[1.02]"
                >
                  <Plus className="w-3.5 h-3.5 text-[#4F46E5]" />
                  <span>Add Task</span>
                </button>
              </div>

              {/* Tasks List */}
              <div className="space-y-3">
                {tasks.map((task, idx) => (
                  <div
                    key={task.id}
                    className="p-4 rounded-2xl bg-white border border-indigo-200/90 shadow-sm space-y-3 transition hover:border-[#4F46E5]/40"
                  >
                    {/* Task Header: Badge + Delete */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="w-6 h-6 rounded-full bg-[#4F46E5] text-white text-[10px] font-mono font-bold flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <span className="text-xs font-bold text-[#1E1B4B]">
                          Task #{idx + 1}
                        </span>
                      </div>

                      {tasks.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveTask(task.id)}
                          className="p-1 rounded-lg hover:bg-rose-50 text-rose-500 transition"
                          title="Remove task"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {/* Task Title */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-[#334155]">
                        What needs to be done? *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Test staging deployment and verify login"
                        value={task.title}
                        onChange={(e) => handleTaskChange(task.id, 'title', e.target.value)}
                        className="w-full bg-slate-50/60 border border-indigo-200 rounded-xl px-3 py-2 text-xs text-[#1E1B4B] placeholder-[#94A3B8] focus:outline-none focus:border-[#4F46E5] font-medium"
                      />
                    </div>

                    {/* Three-Column Row: Owner | Priority | Deadline */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-[#334155]">Assigned To</label>
                        <select
                          value={task.ownerName}
                          onChange={(e) => handleTaskChange(task.id, 'ownerName', e.target.value)}
                          className="w-full bg-slate-50/60 border border-indigo-200 rounded-xl px-2.5 py-1.5 text-xs text-[#1E1B4B] focus:outline-none focus:border-[#4F46E5] font-medium"
                        >
                          {TEAM_MEMBERS.map((m) => (
                            <option key={m.name} value={m.name}>
                              {m.name} ({m.role.split(' ')[0]})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-[#334155]">Priority</label>
                        <select
                          value={task.priority}
                          onChange={(e) => handleTaskChange(task.id, 'priority', e.target.value)}
                          className="w-full bg-slate-50/60 border border-indigo-200 rounded-xl px-2.5 py-1.5 text-xs text-[#1E1B4B] focus:outline-none focus:border-[#4F46E5] font-medium"
                        >
                          <option value="LOW">Low</option>
                          <option value="MEDIUM">Medium</option>
                          <option value="HIGH">High</option>
                          <option value="URGENT">Urgent</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-[#334155]">Due Date</label>
                        <input
                          type="date"
                          value={task.dueDate}
                          onChange={(e) => handleTaskChange(task.id, 'dueDate', e.target.value)}
                          className="w-full bg-slate-50/60 border border-indigo-200 rounded-xl px-2.5 py-1.5 text-xs text-[#1E1B4B] focus:outline-none focus:border-[#4F46E5]"
                        />
                      </div>
                    </div>

                    {/* Sync Checkboxes */}
                    <div className="flex items-center space-x-4 pt-1 text-[11px] text-[#475569]">
                      <label className="flex items-center space-x-1.5 cursor-pointer font-medium">
                        <input
                          type="checkbox"
                          checked={task.syncSlack}
                          onChange={(e) => handleTaskChange(task.id, 'syncSlack', e.target.checked)}
                          className="rounded border-indigo-300 text-[#4F46E5] focus:ring-[#4F46E5]"
                        />
                        <span>⚡ Send Slack notification</span>
                      </label>

                      <label className="flex items-center space-x-1.5 cursor-pointer font-medium">
                        <input
                          type="checkbox"
                          checked={task.syncJira}
                          onChange={(e) => handleTaskChange(task.id, 'syncJira', e.target.checked)}
                          className="rounded border-indigo-300 text-[#4F46E5] focus:ring-[#4F46E5]"
                        />
                        <span>📌 Create Jira task</span>
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </form>

        {/* ── Fixed Bottom Footer ── */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-indigo-100 bg-white shrink-0">
          <div className="text-xs font-mono text-[#64748B] hidden sm:flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Ready to allot {tasks.filter((t) => t.title.trim()).length} team tasks</span>
          </div>

          <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-white border border-indigo-200 text-xs font-bold text-[#1E1B4B] hover:bg-slate-50 transition"
            >
              Cancel
            </button>

            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl btn-indigo-glow text-white text-xs font-bold transition flex items-center space-x-2 shadow-md hover:scale-[1.02]"
            >
              {isSubmitting ? (
                <span>Saving...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Save Meeting & Tasks</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
