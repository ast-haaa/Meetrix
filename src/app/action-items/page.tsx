'use client';

import { useState } from 'react';
import {
  CheckSquare,
  Clock,
  User,
  Plus,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Send,
  Loader2,
  MessageSquare,
} from 'lucide-react';
import { MOCK_ACTION_ITEMS } from '@/lib/mockData';
import { ActionItemDTO } from '@/types';

export default function ActionItemsPage() {
  const [items, setItems] = useState<ActionItemDTO[]>(MOCK_ACTION_ITEMS);
  const [dispatchingId, setDispatchingId] = useState<string | null>(null);
  const [slackDispatchingId, setSlackDispatchingId] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  const handleExportJira = async (item: ActionItemDTO) => {
    setDispatchingId(item.id);
    setNotification(null);
    try {
      const res = await fetch('/api/export/jira', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actionItemId: item.id,
          title: item.title,
          description: item.description,
          priority: item.priority,
          assigneeName: item.assigneeName,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setNotification(`Dispatched Jira ticket ${data.ticketKey}! (${data.ticketUrl})`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDispatchingId(null);
    }
  };

  const handleExportSlack = async (item: ActionItemDTO) => {
    setSlackDispatchingId(item.id);
    setNotification(null);
    try {
      const res = await fetch('/api/export/slack', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actionItemId: item.id,
          title: item.title,
          description: item.description,
          assigneeName: item.assigneeName,
          channel: '#proj-meetrix',
        }),
      });

      const data = await res.json();
      if (data.success) {
        setNotification(`Dispatched notification to Slack ${data.channel}!`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSlackDispatchingId(null);
    }
  };

  const openItems = items.filter((i) => i.status === 'OPEN');
  const inProgressItems = items.filter((i) => i.status === 'IN_PROGRESS');
  const completedItems = items.filter((i) => i.status === 'COMPLETED');

  return (
    <div className="space-y-8 select-none pb-24">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-[#4338CA] text-xs font-mono font-bold uppercase tracking-wider">
            <CheckSquare className="w-3.5 h-3.5 text-[#4F46E5]" />
            <span>ACTION DISPATCH QUEUE</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-sans font-extrabold text-[#1E1B4B] tracking-tight">
            Action Items & Webhook Dispatch
          </h1>
          <p className="text-xs text-[#475569] font-medium">
            Task tickets extracted from meeting transcripts, assigned to owners, and synchronized with Jira/Slack.
          </p>
        </div>
      </div>

      {notification && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-mono font-bold flex items-center space-x-2 shadow-sm">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Kanban Board Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Column 1: OPEN */}
        <div className="glass-card-frost rounded-3xl p-5 space-y-4 border-white shadow-md">
          <div className="flex items-center justify-between border-b border-indigo-100 pb-3">
            <h3 className="text-xs font-mono font-bold text-[#1E1B4B] uppercase tracking-wider flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              Open ({openItems.length})
            </h3>
          </div>

          <div className="space-y-3">
            {openItems.map((item) => (
              <div key={item.id} className="p-4 rounded-2xl bg-white border border-indigo-100 space-y-3 shadow-sm hover:shadow-md transition">
                <div className="flex items-center justify-between">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase border ${
                      item.priority === 'URGENT'
                        ? 'bg-rose-50 text-rose-700 border-rose-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}
                  >
                    {item.priority}
                  </span>
                  <span className="text-[10px] text-[#64748B] font-mono" suppressHydrationWarning>
                    {new Date(item.createdAt).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>

                <div>
                  <h4 className="text-sm font-sans font-bold text-[#1E1B4B]">{item.title}</h4>
                  <p className="text-xs text-[#475569] mt-1 line-clamp-2 font-medium">{item.description}</p>
                </div>

                <div className="pt-2 border-t border-indigo-100 flex items-center justify-between gap-2">
                  <div className="flex items-center space-x-2 truncate">
                    <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-[#3730A3] to-[#4F46E5] text-white text-[9px] font-bold flex items-center justify-center shrink-0 font-mono">
                      {item.assigneeName?.charAt(0).toUpperCase() || '?'}
                    </div>
                    <span className="text-[11px] text-[#475569] font-mono font-bold truncate">{item.assigneeName}</span>
                  </div>

                  <div className="flex items-center space-x-1.5 shrink-0">
                    <button
                      onClick={() => handleExportSlack(item)}
                      disabled={slackDispatchingId === item.id}
                      className="px-2.5 py-1 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 text-[10px] font-mono font-bold transition flex items-center gap-1"
                    >
                      {slackDispatchingId === item.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <MessageSquare className="w-3 h-3 text-purple-600" />}
                      <span>Slack</span>
                    </button>

                    <button
                      onClick={() => handleExportJira(item)}
                      disabled={dispatchingId === item.id}
                      className="px-2.5 py-1 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-[10px] font-mono font-bold transition flex items-center gap-1"
                    >
                      {dispatchingId === item.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3 text-amber-600" />}
                      <span>Jira</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Column 2: IN_PROGRESS */}
        <div className="glass-card-frost rounded-3xl p-5 space-y-4 border-white shadow-md">
          <div className="flex items-center justify-between border-b border-indigo-100 pb-3">
            <h3 className="text-xs font-mono font-bold text-[#1E1B4B] uppercase tracking-wider flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#4F46E5]" />
              In Progress ({inProgressItems.length})
            </h3>
          </div>

          <div className="space-y-3">
            {inProgressItems.map((item) => (
              <div key={item.id} className="p-4 rounded-2xl bg-white border border-indigo-100 space-y-3 shadow-sm hover:shadow-md transition">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase bg-amber-50 text-amber-700 border border-amber-200">
                    {item.priority}
                  </span>
                </div>

                <div>
                  <h4 className="text-sm font-sans font-bold text-[#1E1B4B]">{item.title}</h4>
                  <p className="text-xs text-[#475569] mt-1 font-medium">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Column 3: COMPLETED */}
        <div className="glass-card-frost rounded-3xl p-5 space-y-4 border-white shadow-md">
          <div className="flex items-center justify-between border-b border-indigo-100 pb-3">
            <h3 className="text-xs font-mono font-bold text-[#1E1B4B] uppercase tracking-wider flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              Completed ({completedItems.length})
            </h3>
          </div>

          <div className="space-y-3">
            {completedItems.map((item) => (
              <div key={item.id} className="p-4 rounded-2xl bg-white border border-indigo-100 space-y-3 shadow-sm opacity-90">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                    COMPLETED
                  </span>
                </div>

                <div>
                  <h4 className="text-sm font-sans font-bold text-[#1E1B4B] line-through">{item.title}</h4>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
