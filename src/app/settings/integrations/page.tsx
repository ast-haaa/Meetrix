'use client';

import { useState, useEffect } from 'react';
import {
  Settings,
  CheckCircle2,
  Lock,
  MessageSquare,
  Send,
  Loader2,
  KeyRound,
  ShieldCheck,
  Globe,
  ExternalLink,
  Sparkles,
} from 'lucide-react';

export default function IntegrationsPage() {
  const [slackWebhookUrl, setSlackWebhookUrl] = useState('');
  const [jiraHostUrl, setJiraHostUrl] = useState('https://meetrix-workspace.atlassian.net');
  const [jiraUserEmail, setJiraUserEmail] = useState('priya@meetrix.ai');
  const [jiraApiToken, setJiraApiToken] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isTestingSlack, setIsTestingSlack] = useState(false);
  const [isTestingJira, setIsTestingJira] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/settings/integrations')
      .then((res) => res.json())
      .then((data) => {
        if (data.slack?.rawWebhookUrl) setSlackWebhookUrl(data.slack.rawWebhookUrl);
        if (data.jira?.hostUrl) setJiraHostUrl(data.jira.hostUrl);
        if (data.jira?.userEmail) setJiraUserEmail(data.jira.userEmail);
        if (data.jira?.rawApiToken) setJiraApiToken(data.jira.rawApiToken);
      })
      .catch((err) => console.error(err));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setStatusMessage(null);

    try {
      const res = await fetch('/api/settings/integrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slackWebhookUrl,
          jiraHostUrl,
          jiraUserEmail,
          jiraApiToken,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSaveSuccess(true);
        setStatusMessage('Encrypted integration credentials saved successfully!');
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        setStatusMessage('Failed to save settings.');
      }
    } catch (err: any) {
      setStatusMessage('Error saving settings.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestSlack = async () => {
    setIsTestingSlack(true);
    setStatusMessage(null);

    try {
      const res = await fetch('/api/export/slack', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Database Migration & Prisma ORM Config',
          description: 'Action item completed during Sprint 14 Planning.',
          status: 'COMPLETED',
          assigneeName: 'Arjun Mehta',
          priority: 'HIGH',
          meetingTitle: 'Sprint Planning Sync',
        }),
      });

      const data = await res.json();
      setStatusMessage(data.message || 'Slack test completed.');
    } catch (err: any) {
      setStatusMessage('Slack test failed.');
    } finally {
      setIsTestingSlack(false);
    }
  };

  const handleTestJira = async () => {
    setIsTestingJira(true);
    setStatusMessage(null);

    try {
      const res = await fetch('/api/export/jira', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Build Whisper API Ingestion Worker',
          description: 'Integrate audio upload endpoint and async transcription pipeline.',
          priority: 'URGENT',
          assigneeName: 'Priya Sharma',
        }),
      });

      const data = await res.json();
      if (data.success) {
        setStatusMessage(`Jira test successful! Ticket Key: ${data.ticketKey} (${data.ticketUrl})`);
      } else {
        setStatusMessage(data.error || 'Jira test failed.');
      }
    } catch (err: any) {
      setStatusMessage('Jira test failed.');
    } finally {
      setIsTestingJira(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 select-none font-sans pb-24">
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center space-x-2 text-[#4338CA] text-xs font-mono font-bold uppercase tracking-wider">
          <Settings className="w-3.5 h-3.5 text-[#4F46E5]" />
          <span>TICKET & NOTIFICATION DISPATCH</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-sans font-extrabold text-[#1E1B4B] tracking-tight">
          Slack & Jira Integration Credentials
        </h1>
        <p className="text-xs text-[#475569] font-medium">
          Configure API webhooks to automatically push completed action items to Slack channels and dispatch Jira tickets.
        </p>
      </div>

      {/* Security Encryption Badge */}
      <div className="glass-card-frost rounded-3xl p-5 flex items-center justify-between border-white bg-amber-50/60 shadow-sm">
        <div className="flex items-center space-x-3.5">
          <div className="w-9 h-9 rounded-2xl bg-white border border-amber-200 flex items-center justify-center text-amber-600 shrink-0 shadow-sm">
            <Lock className="w-4.5 h-4.5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-[#1E1B4B] flex items-center gap-1.5 font-mono">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-600" /> ENCRYPTED AT REST (AES-256-CBC)
            </h4>
            <p className="text-[11px] text-[#475569] font-medium">
              API tokens and webhooks are encrypted before database insertion and never stored in plaintext.
            </p>
          </div>
        </div>
      </div>

      {statusMessage && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-mono font-bold flex items-center space-x-2 shadow-sm">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Slack Section */}
        <div className="glass-card-frost rounded-3xl p-6 space-y-4 border-white shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-700 font-bold shadow-sm">
                <MessageSquare className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#1E1B4B]">Slack Channel Webhooks</h3>
                <p className="text-xs text-[#64748B]">Push rich Block Kit action item notifications to Slack.</p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleTestSlack}
              disabled={isTestingSlack}
              className="px-3.5 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-800 font-mono text-xs font-bold transition flex items-center gap-1.5"
            >
              {isTestingSlack ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <MessageSquare className="w-3.5 h-3.5 text-purple-600" />}
              <span>Test Webhook</span>
            </button>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-[#1E1B4B]">Slack Incoming Webhook URL</label>
            <input
              type="url"
              placeholder="https://hooks.slack.com/services/YOUR_SLACK_WEBHOOK_URL"
              value={slackWebhookUrl}
              onChange={(e) => setSlackWebhookUrl(e.target.value)}
              className="w-full bg-white border border-indigo-200 rounded-2xl px-4 py-3 text-xs text-[#1E1B4B] placeholder-[#94A3B8] focus:outline-none focus:border-[#4F46E5] font-mono shadow-sm"
            />
          </div>
        </div>

        {/* Jira Section */}
        <div className="glass-card-frost rounded-3xl p-6 space-y-4 border-white shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-800 font-bold shadow-sm">
                <Send className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#1E1B4B]">Jira Software Cloud API</h3>
                <p className="text-xs text-[#64748B]">Automatically convert action items into Jira issue tickets.</p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleTestJira}
              disabled={isTestingJira}
              className="px-3.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 font-mono text-xs font-bold transition flex items-center gap-1.5"
            >
              {isTestingJira ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5 text-amber-600" />}
              <span>Test Jira Dispatch</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-[#1E1B4B]">Jira Cloud Host Domain</label>
              <input
                type="text"
                placeholder="https://your-domain.atlassian.net"
                value={jiraHostUrl}
                onChange={(e) => setJiraHostUrl(e.target.value)}
                className="w-full bg-white border border-indigo-200 rounded-2xl px-4 py-3 text-xs text-[#1E1B4B] placeholder-[#94A3B8] focus:outline-none focus:border-[#4F46E5] font-mono shadow-sm"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-[#1E1B4B]">Atlassian Account Email</label>
              <input
                type="email"
                placeholder="name@company.com"
                value={jiraUserEmail}
                onChange={(e) => setJiraUserEmail(e.target.value)}
                className="w-full bg-white border border-indigo-200 rounded-2xl px-4 py-3 text-xs text-[#1E1B4B] placeholder-[#94A3B8] focus:outline-none focus:border-[#4F46E5] font-mono shadow-sm"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-[#1E1B4B]">Atlassian API Token (AES Encrypted)</label>
            <input
              type="password"
              placeholder="ATATT3xFfGF0..."
              value={jiraApiToken}
              onChange={(e) => setJiraApiToken(e.target.value)}
              className="w-full bg-white border border-indigo-200 rounded-2xl px-4 py-3 text-xs text-[#1E1B4B] placeholder-[#94A3B8] focus:outline-none focus:border-[#4F46E5] font-mono shadow-sm"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="w-full py-4 rounded-2xl btn-indigo-glow text-xs font-bold shadow-md transition flex items-center justify-center space-x-2"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Encrypting & Saving Credentials...</span>
            </>
          ) : (
            <>
              <KeyRound className="w-4 h-4" />
              <span>Save Encrypted Integration Credentials</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
