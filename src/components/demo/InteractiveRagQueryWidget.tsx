'use client';

import { useState } from 'react';
import { Search, Sparkles, Database, CheckCircle2, CornerDownLeft, RefreshCw } from 'lucide-react';

const SAMPLE_QUERIES = [
  'What database migration did Alex commit to?',
  'Who is assigned to Slack webhook triggers?',
  'What decisions were made in Q3 Architecture Sync?',
];

export function InteractiveRagQueryWidget() {
  const [query, setQuery] = useState('What database migration did Alex commit to?');
  const [isSearching, setIsSearching] = useState(false);
  const [step, setStep] = useState<number>(2); // 0: input, 1: embedding search, 2: cited result

  const [currentResult, setCurrentResult] = useState({
    code: 'DECISION #DEC-302',
    timestamp: 'Oct 12 • 14:22 UTC',
    title: 'Alex Rivera: PostgreSQL Database Migration & Webhooks',
    snippet:
      'Alex Rivera committed to deploying PostgreSQL database schema migration and verifying Slack webhook triggers with zero downtime by Friday EOD.',
    source: 'Q3 Architecture Sync',
    score: 'Cosine Sim: 0.96',
    speaker: 'Alex Rivera',
  });

  const handleSearch = (textToSearch: string) => {
    setQuery(textToSearch);
    setIsSearching(true);
    setStep(1);

    setTimeout(() => {
      setIsSearching(false);
      setStep(2);

      if (textToSearch.toLowerCase().includes('database') || textToSearch.toLowerCase().includes('alex')) {
        setCurrentResult({
          code: 'DECISION #DEC-302',
          timestamp: 'Oct 12 • 14:22 UTC',
          title: 'Alex Rivera: PostgreSQL Database Migration',
          snippet:
            'Alex Rivera committed to deploying PostgreSQL database schema migration and verifying Slack webhook triggers with zero downtime by Friday EOD.',
          source: 'Q3 Architecture Sync',
          score: 'Cosine Sim: 0.96',
          speaker: 'Alex Rivera',
        });
      } else if (textToSearch.toLowerCase().includes('webhook') || textToSearch.toLowerCase().includes('slack')) {
        setCurrentResult({
          code: 'DECISION #DEC-104',
          timestamp: 'Oct 19 • 08:15 UTC',
          title: 'Sarah Chen: Slack SLA Escalation Webhooks',
          snippet:
            'Sarah Chen and Alex Rivera configured Slack webhooks for real-time unacted decision SLA alerts dispatched to #eng-governance.',
          source: 'Sprint Retrospective',
          score: 'Cosine Sim: 0.94',
          speaker: 'Sarah Chen',
        });
      } else {
        setCurrentResult({
          code: 'DECISION #DEC-204',
          timestamp: 'Oct 05 • 22:04 UTC',
          title: 'Team Roadmap: 2.4-Day Resolution SLA',
          snippet:
            'Product Roadmap scope approved unanimously. Team velocity benchmarked at 2.4 days average resolution time across all sprint commitments.',
          source: 'Q3 Strategy Sync',
          score: 'Cosine Sim: 0.91',
          speaker: 'David Kim',
        });
      }
    }, 450);
  };

  return (
    <div className="w-full glass-card-elevated-frost rounded-3xl p-5 sm:p-7 md:p-8 border-white shadow-[0_40px_100px_rgba(79,70,229,0.15)] relative overflow-hidden text-left">
      {/* Top Traffic Lights Header Bar */}
      <div className="flex items-center justify-between pb-4 border-b border-indigo-100 mb-6">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-rose-400" />
          <div className="w-3 h-3 rounded-full bg-amber-400" />
          <div className="w-3 h-3 rounded-full bg-emerald-400" />
          <span className="text-xs font-mono font-bold text-[#4338CA] ml-2">
            Meetrix RAG Semantic Search Studio
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 font-bold flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
            pgvector Ready • 1,420 Chunks
          </span>
        </div>
      </div>

      {/* Step Sequence Indicator */}
      <div className="grid grid-cols-3 gap-2 mb-6">
        <div
          className={`h-1.5 rounded-full transition-all duration-500 ${
            step >= 0 ? 'bg-[#4F46E5]' : 'bg-indigo-100'
          }`}
        />
        <div
          className={`h-1.5 rounded-full transition-all duration-500 ${
            step >= 1 ? 'bg-[#4F46E5]' : 'bg-indigo-100'
          }`}
        />
        <div
          className={`h-1.5 rounded-full transition-all duration-500 ${
            step >= 2 ? 'bg-[#4F46E5]' : 'bg-indigo-100'
          }`}
        />
      </div>

      {/* Main 50/50 Symmetrical Two-Stage Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
        {/* Left Stage: Natural Language Query */}
        <div className="space-y-3 flex flex-col justify-between h-full">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold text-[#4338CA] uppercase tracking-wider flex items-center gap-1">
              <Database className="w-3.5 h-3.5 text-[#4F46E5]" />
              1. NATURAL LANGUAGE QUERY
            </span>
            <span className="text-[10px] font-mono text-emerald-700 font-bold">Vector Search</span>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-indigo-100 shadow-sm flex-1 flex flex-col justify-between space-y-4 min-h-[240px]">
            <div className="space-y-3">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (query.trim()) handleSearch(query);
                }}
                className="relative flex items-center"
              >
                <Search className="w-4 h-4 text-[#4F46E5] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Ask anything about past meeting decisions..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full bg-slate-50/70 border border-indigo-200 rounded-xl pl-10 pr-20 py-2.5 text-xs text-[#1E1B4B] placeholder-[#64748B] focus:outline-none focus:border-[#4F46E5] font-sans font-medium"
                />
                <button
                  type="submit"
                  className="absolute right-1.5 px-3 py-1.5 rounded-lg btn-indigo-glow text-[11px] font-bold transition flex items-center space-x-1"
                >
                  <span>Query</span>
                  <CornerDownLeft className="w-3 h-3" />
                </button>
              </form>

              {/* Sample Query Click Capsules */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[10px] font-mono text-[#64748B] font-semibold block">Try sample queries:</span>
                <div className="flex flex-wrap gap-1.5">
                  {SAMPLE_QUERIES.map((q, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSearch(q)}
                      className="px-2.5 py-1 rounded-lg bg-indigo-50/80 hover:bg-indigo-100 border border-indigo-100 text-[10px] font-sans font-bold text-[#3730A3] transition active:scale-95 truncate max-w-full text-left"
                    >
                      "{q}"
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-indigo-100 text-xs font-sans text-[#64748B]">
              <span className="text-[10px] font-mono font-semibold text-[#475569]">Model: text-embedding-3-small</span>
              <span className="text-[10px] font-mono font-bold text-[#3730A3] bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200">
                1536-dim Vector
              </span>
            </div>
          </div>
        </div>

        {/* Right Stage: Cited Decision Vector Result */}
        <div className="space-y-3 flex flex-col justify-between h-full">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              2. CITED SEMANTIC RETRIEVAL
            </span>
            <span className="text-[10px] font-mono text-[#64748B] font-bold">Source Verified</span>
          </div>

          <div
            className={`rounded-2xl p-5 border transition-all duration-500 flex-1 flex flex-col justify-between space-y-4 shadow-sm min-h-[240px] ${
              isSearching
                ? 'bg-indigo-50/50 border-indigo-200 animate-pulse'
                : 'bg-white border-[#4F46E5] shadow-lg'
            }`}
          >
            {isSearching ? (
              <div className="flex-1 flex flex-col items-center justify-center space-y-2 py-8">
                <Sparkles className="w-6 h-6 text-[#4F46E5] animate-spin" />
                <span className="text-xs font-mono font-bold text-[#4338CA]">
                  Querying pgvector transcript embeddings...
                </span>
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase bg-indigo-50 text-[#3730A3] border border-indigo-200">
                      {currentResult.code}
                    </span>
                    <span className="text-xs font-mono font-bold text-emerald-700">
                      {currentResult.score}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <h4 className="text-sm font-sans font-bold text-[#1E1B4B]">
                      {currentResult.title}
                    </h4>
                    <p className="text-xs font-sans text-[#1E1B4B] leading-relaxed pl-3.5 border-l-2 border-[#4F46E5] font-medium bg-slate-50/70 p-2.5 rounded-r-xl">
                      "{currentResult.snippet}"
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-indigo-100 text-xs font-sans text-[#64748B]">
                  <span className="text-[10px] font-mono font-bold text-[#1E1B4B]">
                    Source: {currentResult.source}
                  </span>
                  <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    Timestamp {currentResult.timestamp}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
