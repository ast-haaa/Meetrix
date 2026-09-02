'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck,
  Users,
  Mic,
  GitMerge,
  Send,
  History,
  Search,
  ArrowUpDown,
  CheckCircle2,
  RefreshCw,
  LogOut,
  Terminal,
  Activity,
  Cpu,
  Database,
  Trash2,
  Zap,
  Info,
  Sliders,
} from 'lucide-react';

interface AuditLog {
  id: string;
  adminName: string;
  action: string;
  targetResource: string;
  details: string;
  createdAt: string;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'overview' | 'meetings' | 'users' | 'operations'>('overview');
  const [users, setUsers] = useState<any[]>([]);
  const [meetings, setMeetings] = useState<any[]>([]);
  const [health, setHealth] = useState<any>(null);
  const [usage, setUsage] = useState<any>(null);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter States
  const [userRoleFilter, setUserRoleFilter] = useState<'ALL' | 'ADMIN' | 'MEMBER'>('ALL');
  const [userSearch, setUserSearch] = useState('');
  const [meetingSearch, setMeetingSearch] = useState('');
  const [meetingStatusFilter, setMeetingStatusFilter] = useState<string>('ALL');
  const [sortField, setSortField] = useState<'title' | 'createdAt' | 'status'>('createdAt');
  const [sortAsc, setSortAsc] = useState(false);

  // Action Loading States
  const [retriggeringId, setRetriggeringId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [revokingProvider, setRevokingProvider] = useState<string | null>(null);
  const [merging, setMerging] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Integrations State
  const [integrations, setIntegrations] = useState([
    { provider: 'SLACK', name: 'Slack Webhook Dispatcher', enabled: true, status: 'CONNECTED' },
    { provider: 'JIRA', name: 'Jira Software API', enabled: true, status: 'CONNECTED' },
  ]);

  // Decision Merge State
  const [decisions, setDecisions] = useState([
    { id: 'dec-1', title: 'Migrate core database to PostgreSQL + Prisma ORM', status: 'ACTIVE' },
    { id: 'dec-2', title: 'Adopt PostgreSQL for structural type safety', status: 'DUPLICATE' },
  ]);
  const [primaryId, setPrimaryId] = useState('dec-1');
  const [secondaryId, setSecondaryId] = useState('dec-2');

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [statsRes, logsRes] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch('/api/admin/logs'),
      ]);

      const statsData = await statsRes.json();
      const logsData = await logsRes.json();

      if (statsData.success) {
        setUsers(statsData.users || []);
        setMeetings(statsData.meetings || []);
        setHealth(statsData.systemHealth || null);
        setUsage(statsData.usageStats || null);
      }

      if (logsData.success) {
        setLogs(logsData.logs || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/';
  };

  // Filtered & Sorted Meetings
  const filteredMeetings = useMemo(() => {
    return meetings
      .filter((m) => {
        const matchesSearch = m.title.toLowerCase().includes(meetingSearch.toLowerCase());
        const matchesStatus = meetingStatusFilter === 'ALL' || m.status === meetingStatusFilter;
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        let valA = a[sortField];
        let valB = b[sortField];
        if (sortField === 'createdAt') {
          valA = new Date(valA).getTime();
          valB = new Date(valB).getTime();
        }
        if (valA < valB) return sortAsc ? -1 : 1;
        if (valA > valB) return sortAsc ? 1 : -1;
        return 0;
      });
  }, [meetings, meetingSearch, meetingStatusFilter, sortField, sortAsc]);

  // Filtered Users
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesSearch =
        u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
        u.email.toLowerCase().includes(userSearch.toLowerCase());
      const matchesRole = userRoleFilter === 'ALL' || u.role === userRoleFilter;
      return matchesSearch && matchesRole;
    });
  }, [users, userSearch, userRoleFilter]);

  const handleRetrigger = async (meetingId: string, title: string) => {
    setRetriggeringId(meetingId);
    try {
      const res = await fetch('/api/admin/retrigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ meetingId }),
      });

      const data = await res.json();
      if (data.success) {
        setNotification(`Re-triggered pipeline for "${title}". Status updated to ANALYZED.`);
        fetchAdminData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setRetriggeringId(null);
      setTimeout(() => setNotification(null), 4000);
    }
  };

  const handleDeleteMeeting = async (id: string, title: string) => {
    if (!confirm(`Permanently delete meeting "${title}" from SQLite database? Cascades decisions and action items.`)) return;

    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/meetings/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setNotification(`Deleted meeting "${title}" from DB.`);
        setMeetings((prev) => prev.filter((m) => m.id !== id));
        fetchAdminData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingId(null);
      setTimeout(() => setNotification(null), 4000);
    }
  };

  const handleMergeDecisions = async () => {
    if (primaryId === secondaryId) {
      alert('Primary and secondary decisions must be different.');
      return;
    }

    setMerging(true);
    try {
      const res = await fetch('/api/admin/decisions/merge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ primaryDecisionId: primaryId, secondaryDecisionId: secondaryId }),
      });

      const data = await res.json();
      if (data.success) {
        setNotification(data.message);
        setDecisions((prev) => prev.filter((d) => d.id !== secondaryId));
        fetchAdminData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setMerging(false);
      setTimeout(() => setNotification(null), 4000);
    }
  };

  const handleRevokeIntegration = async (provider: 'SLACK' | 'JIRA') => {
    if (!confirm(`Revoke credentials for ${provider}?`)) return;

    setRevokingProvider(provider);
    try {
      const res = await fetch('/api/admin/integrations/revoke', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider }),
      });

      const data = await res.json();
      if (data.success) {
        setNotification(data.message);
        setIntegrations((prev) =>
          prev.map((i) => (i.provider === provider ? { ...i, enabled: false, status: 'REVOKED' } : i))
        );
        fetchAdminData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setRevokingProvider(null);
      setTimeout(() => setNotification(null), 4000);
    }
  };

  return (
    <div className="space-y-6 select-none text-xs font-sans pb-12">
      {/* Control Room Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-indigo-100">
        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-[#4338CA] text-[10px] font-mono font-bold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-[#4F46E5]" />
            <span>ADMIN CONTROL ROOM • WORKSPACE GOVERNANCE</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-sans font-extrabold text-[#1E1B4B] tracking-tight">
            System Operations & Organization Console
          </h1>
        </div>

        <div className="flex items-center space-x-2 shrink-0 font-mono text-xs">
          <button
            onClick={fetchAdminData}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-2xl bg-white border border-indigo-200 hover:border-[#4F46E5] text-[#1E1B4B] font-bold transition shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#4F46E5] ${loading ? 'animate-spin' : ''}`} />
            <span>Sync Database</span>
          </button>

          <button
            onClick={handleLogout}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition shadow-md"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Log Out</span>
          </button>
        </div>
      </div>

      {notification && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-800 font-mono text-xs flex items-center space-x-2 shadow-sm animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{notification}</span>
        </div>
      )}

      {/* CLEAR TABBED NAVIGATION BAR */}
      <div className="flex items-center space-x-2 border-b border-indigo-100 pb-2 overflow-x-auto">
        {[
          { id: 'overview', label: 'System Overview & Metrics', icon: Activity },
          { id: 'meetings', label: `Meetings Pipeline (${meetings.length})`, icon: Mic },
          { id: 'users', label: `Team Members (${users.length})`, icon: Users },
          { id: 'operations', label: 'Operations & Audit Logs', icon: History },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-2xl font-sans text-xs font-bold transition shrink-0 ${
                isActive
                  ? 'bg-white text-[#3730A3] border border-indigo-200 shadow-sm'
                  : 'text-[#475569] hover:text-[#1E1B4B] hover:bg-white/60'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#4F46E5]' : 'text-[#64748B]'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: SYSTEM OVERVIEW & METRICS */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 flex items-center space-x-3 text-[#475569]">
            <Info className="w-4 h-4 text-[#4F46E5] shrink-0" />
            <p className="text-xs font-medium">
              System performance metrics monitoring audio speech ingestion, LLM decision extraction tokens, and active database resource allocation.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
            <div className="glass-card-frost rounded-2xl p-5 border-white space-y-1">
              <span className="text-xs text-[#64748B] font-bold uppercase block">Processed Audio</span>
              <p className="text-3xl font-extrabold text-[#1E1B4B]">{usage?.totalAudioMinutes || 142} mins</p>
              <p className="text-[10px] text-[#64748B]">Whisper STT chunked</p>
            </div>

            <div className="glass-card-frost rounded-2xl p-5 border-white space-y-1">
              <span className="text-xs text-[#64748B] font-bold uppercase block">Decisions Tracked</span>
              <p className="text-3xl font-extrabold text-[#4F46E5]">{usage?.totalDecisionsTracked || 28}</p>
              <p className="text-[10px] text-[#64748B]">Zod JSON validated</p>
            </div>

            <div className="glass-card-frost rounded-2xl p-5 border-white space-y-1">
              <span className="text-xs text-[#64748B] font-bold uppercase block">Est. LLM Tokens</span>
              <p className="text-3xl font-extrabold text-[#1E1B4B]">{(usage?.estimatedTokens || 184200).toLocaleString()}</p>
              <p className="text-[10px] text-[#64748B]">Prompt + completion</p>
            </div>

            <div className="glass-card-elevated-frost rounded-2xl p-5 border-indigo-200 space-y-1 shadow-md">
              <span className="text-xs text-[#3730A3] font-bold uppercase block">API Cost Estimate</span>
              <p className="text-3xl font-extrabold text-[#3730A3]">${usage?.estimatedCostUsd || '1.42'}</p>
              <p className="text-[10px] text-[#64748B]">OpenAI + Whisper compute</p>
            </div>
          </div>

          {/* Health & Infrastructure Gauges */}
          <div className="glass-card-frost rounded-3xl p-6 border-white space-y-4">
            <h3 className="text-sm font-sans font-extrabold text-[#1E1B4B] flex items-center gap-2">
              <Cpu className="w-4 h-4 text-[#4F46E5]" />
              <span>Infrastructure Health & Pipeline Latency</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
              <div className="p-3.5 rounded-2xl bg-white border border-indigo-100 space-y-1 shadow-sm">
                <span className="text-[#64748B] text-[11px] font-bold">Whisper STT Uptime</span>
                <p className="text-base font-bold text-emerald-700">99.98% Active</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-white border border-indigo-100 space-y-1 shadow-sm">
                <span className="text-[#64748B] text-[11px] font-bold">Average Processing Latency</span>
                <p className="text-base font-bold text-[#1E1B4B]">1.24s / audio min</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-white border border-indigo-100 space-y-1 shadow-sm">
                <span className="text-[#64748B] text-[11px] font-bold">Prisma SQLite Status</span>
                <p className="text-base font-bold text-emerald-700">Connected & Synced</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MEETINGS PIPELINE */}
      {activeTab === 'meetings' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-indigo-100 shadow-sm">
            <div className="relative w-full sm:w-72">
              <Search className="w-3.5 h-3.5 text-[#4F46E5] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search meeting titles..."
                value={meetingSearch}
                onChange={(e) => setMeetingSearch(e.target.value)}
                className="w-full bg-indigo-50/50 border border-indigo-100 rounded-xl pl-9 pr-3 py-2 text-xs text-[#1E1B4B] focus:outline-none focus:border-[#4F46E5]"
              />
            </div>

            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <select
                value={meetingStatusFilter}
                onChange={(e) => setMeetingStatusFilter(e.target.value)}
                className="bg-indigo-50/50 border border-indigo-100 rounded-xl px-3 py-2 text-xs text-[#1E1B4B] focus:outline-none"
              >
                <option value="ALL">All Statuses</option>
                <option value="ANALYZED">ANALYZED</option>
                <option value="PROCESSING">PROCESSING</option>
              </select>

              <button
                onClick={() => {
                  setSortField('createdAt');
                  setSortAsc(!sortAsc);
                }}
                className="flex items-center space-x-1 px-3 py-2 rounded-xl bg-indigo-50/50 border border-indigo-100 text-xs font-bold text-[#3730A3]"
              >
                <ArrowUpDown className="w-3 h-3 text-[#4F46E5]" />
                <span>Date {sortAsc ? '↑' : '↓'}</span>
              </button>
            </div>
          </div>

          <div className="glass-card-frost rounded-3xl overflow-hidden border-white shadow-md">
            <div className="overflow-x-auto">
              <table className="w-full text-left font-sans border-collapse">
                <thead>
                  <tr className="bg-indigo-50/70 border-b border-indigo-100 text-[10px] font-mono font-bold text-[#4338CA] uppercase">
                    <th className="p-4">Title</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Audio Duration</th>
                    <th className="p-4">Created Date</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-indigo-100 text-xs text-[#1E1B4B]">
                  {filteredMeetings.map((m) => (
                    <tr key={m.id} className="hover:bg-indigo-50/50 transition">
                      <td className="p-4 font-bold">{m.title}</td>
                      <td className="p-4">
                        <span className={`px-2.5 py-0.5 rounded-full font-mono text-[10px] font-bold ${
                          m.status === 'ANALYZED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {m.status}
                        </span>
                      </td>
                      <td className="p-4 font-mono">{m.duration ? `${m.duration}s` : '25 mins'}</td>
                      <td className="p-4 font-mono text-[#64748B]" suppressHydrationWarning>{new Date(m.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                      <td className="p-4 text-right space-x-2">
                        <button
                          onClick={() => handleRetrigger(m.id, m.title)}
                          disabled={retriggeringId === m.id}
                          className="px-3 py-1 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-[#3730A3] font-bold text-[11px] border border-indigo-200"
                        >
                          {retriggeringId === m.id ? 'Retriggering...' : 'Re-trigger'}
                        </button>
                        <button
                          onClick={() => handleDeleteMeeting(m.id, m.title)}
                          disabled={deletingId === m.id}
                          className="px-3 py-1 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-[11px] border border-rose-200"
                        >
                          {deletingId === m.id ? 'Deleting...' : 'Delete'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: TEAM MEMBERS */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-indigo-100 shadow-sm">
            <div className="relative w-full sm:w-72">
              <Search className="w-3.5 h-3.5 text-[#4F46E5] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search user name or email..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="w-full bg-indigo-50/50 border border-indigo-100 rounded-xl pl-9 pr-3 py-2 text-xs text-[#1E1B4B] focus:outline-none focus:border-[#4F46E5]"
              />
            </div>

            <select
              value={userRoleFilter}
              onChange={(e) => setUserRoleFilter(e.target.value as any)}
              className="bg-indigo-50/50 border border-indigo-100 rounded-xl px-3 py-2 text-xs text-[#1E1B4B] focus:outline-none"
            >
              <option value="ALL">All Roles</option>
              <option value="ADMIN">ADMIN</option>
              <option value="MEMBER">MEMBER</option>
            </select>
          </div>

          <div className="glass-card-frost rounded-3xl overflow-hidden border-white shadow-md">
            <div className="overflow-x-auto">
              <table className="w-full text-left font-sans border-collapse">
                <thead>
                  <tr className="bg-indigo-50/70 border-b border-indigo-100 text-[10px] font-mono font-bold text-[#4338CA] uppercase">
                    <th className="p-4">User</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">Role</th>
                    <th className="p-4">Joined Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-indigo-100 text-xs text-[#1E1B4B]">
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-indigo-50/50 transition">
                      <td className="p-4 font-bold flex items-center gap-2">
                        <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-[#3730A3] to-[#4F46E5] text-white font-mono text-xs flex items-center justify-center font-bold">
                          {u.name ? u.name.charAt(0) : 'U'}
                        </div>
                        <span>{u.name || 'Workspace User'}</span>
                      </td>
                      <td className="p-4 font-mono text-[#475569]">{u.email}</td>
                      <td className="p-4">
                        <span className={`px-2.5 py-0.5 rounded-full font-mono text-[10px] font-bold ${
                          u.role === 'ADMIN' ? 'bg-purple-50 text-purple-700 border border-purple-200' : 'bg-indigo-50 text-[#3730A3] border border-indigo-200'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="p-4 font-mono text-[#64748B]" suppressHydrationWarning>{new Date(u.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: OPERATIONS & AUDIT LOGS */}
      {activeTab === 'operations' && (
        <div className="space-y-6">
          <div className="glass-card-frost rounded-3xl p-6 border-white space-y-4">
            <h3 className="text-sm font-sans font-extrabold text-[#1E1B4B] flex items-center gap-2">
              <History className="w-4 h-4 text-[#4F46E5]" />
              <span>Admin Operations Audit Trail</span>
            </h3>

            <div className="space-y-2">
              {logs.map((log) => (
                <div key={log.id} className="p-3.5 rounded-2xl bg-white border border-indigo-100 flex items-center justify-between text-xs shadow-sm">
                  <div className="space-y-0.5">
                    <span className="font-bold text-[#1E1B4B]">{log.adminName}</span>
                    <span className="text-[#64748B] font-mono"> — {log.action} ({log.targetResource})</span>
                    <p className="text-[11px] text-[#475569]">{log.details}</p>
                  </div>
                  <span className="text-[10px] font-mono text-[#64748B] shrink-0">{new Date(log.createdAt).toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
