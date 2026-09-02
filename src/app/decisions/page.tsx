'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  GitCommit,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Clock,
  User as UserIcon,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { useI18n } from '@/i18n/I18nContext';

export default function DecisionsPage() {
  const { t } = useI18n();
  const [decisions, setDecisions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  useEffect(() => {
    async function loadDecisions() {
      try {
        const res = await fetch('/api/decisions');
        const data = await res.json();
        setDecisions(data.decisions || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadDecisions();
  }, []);

  const filteredDecisions = useMemo(() => {
    return decisions.filter((d) => {
      const matchesSearch =
        d.title.toLowerCase().includes(search.toLowerCase()) ||
        d.context.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'ALL' || d.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [decisions, search, statusFilter]);

  return (
    <div className="space-y-6 select-none text-xs font-sans pb-24">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-indigo-100">
        <div>
          <div className="flex items-center space-x-2 text-[#4338CA] text-[10px] font-mono font-bold uppercase tracking-wider">
            <GitCommit className="w-3.5 h-3.5 text-[#4F46E5]" />
            <span>AUTHORITATIVE DECISION LEDGER</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-sans font-extrabold text-[#1E1B4B] tracking-tight">
            Tracked Decisions & Follow-Through Audit
          </h1>
        </div>

        <Link
          href="/meetings/upload"
          className="px-5 py-2.5 rounded-2xl btn-indigo-glow font-bold text-xs flex items-center space-x-2 self-start sm:self-auto transition shadow-md"
        >
          <Sparkles className="w-4 h-4" />
          <span>Extract New Decision</span>
        </Link>
      </div>

      {/* CLEAN FILTER BAR */}
      <div className="glass-card-frost rounded-3xl p-4 border-white flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-[#4F46E5] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search decisions by title or context..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white/90 border border-indigo-200 rounded-2xl pl-10 pr-4 py-2 text-xs text-[#1E1B4B] placeholder-[#64748B] focus:outline-none focus:border-[#4F46E5] font-medium"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto shrink-0 font-mono text-xs">
          <Filter className="w-3.5 h-3.5 text-[#4F46E5]" />
          <span className="text-[#475569] font-bold">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white border border-indigo-200 rounded-xl px-3 py-2 text-[#1E1B4B] font-bold focus:outline-none"
          >
            <option value="ALL">All Decisions ({decisions.length})</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="STALE">STALE (Requires Action)</option>
            <option value="REVIEWED">REVIEWED</option>
          </select>
        </div>
      </div>

      {/* DECISIONS LIST LEDGER */}
      <div className="space-y-4">
        {filteredDecisions.length === 0 ? (
          <div className="glass-card-frost rounded-3xl p-12 text-center text-[#64748B] space-y-2 border-white">
            <GitCommit className="w-8 h-8 text-[#4F46E5] mx-auto opacity-50" />
            <p className="font-bold text-[#1E1B4B]">No decisions match filter</p>
            <p className="text-xs">Try adjusting search or status filters.</p>
          </div>
        ) : (
          filteredDecisions.map((decision) => {
            const isStale = decision.status === 'STALE';

            return (
              <div
                key={decision.id}
                className={`glass-card-frost rounded-3xl p-6 border transition space-y-4 shadow-md ${
                  isStale
                    ? 'border-rose-300 bg-rose-50/50'
                    : 'border-white hover:border-indigo-200'
                }`}
              >
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase border ${
                          isStale
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : decision.status === 'REVIEWED'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-indigo-50 text-[#3730A3] border-indigo-200'
                        }`}
                      >
                        {decision.status}
                      </span>
                      <span className="text-[11px] font-mono text-[#64748B]">
                        ID: #{decision.id.slice(-6)}
                      </span>
                    </div>

                    <h3 className="text-base font-sans font-bold text-[#1E1B4B]">
                      {decision.title}
                    </h3>
                  </div>

                  {decision.originMeeting && (
                    <Link
                      href={`/meetings/${decision.originMeeting.id}`}
                      className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-indigo-50 border border-indigo-200 text-xs font-bold text-[#3730A3] flex items-center space-x-1.5 shrink-0 self-start transition shadow-sm"
                    >
                      <span>Origin Meeting</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  )}
                </div>

                {/* Context Body */}
                <p className="text-xs text-[#475569] leading-relaxed bg-indigo-50/60 p-3.5 rounded-2xl border border-indigo-100 font-medium">
                  {decision.context}
                </p>

                {/* Action items & Owners strip */}
                <div className="pt-2 border-t border-indigo-100 flex flex-wrap items-center justify-between gap-3 text-xs text-[#64748B]">
                  <div className="flex items-center space-x-4">
                    <span className="flex items-center gap-1 font-mono" suppressHydrationWarning>
                      <Clock className="w-3.5 h-3.5 text-[#4F46E5]" />
                      {new Date(decision.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>

                    {decision.actionItems && decision.actionItems.length > 0 && (
                      <span className="font-mono text-amber-700 font-bold">
                        {decision.actionItems.length} Action Item{decision.actionItems.length > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>

                  {isStale && (
                    <span className="text-rose-700 text-[11px] font-bold flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Unacted Commitment Alert
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
