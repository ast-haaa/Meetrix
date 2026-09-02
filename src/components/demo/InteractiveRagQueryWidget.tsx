'use client';

import { useState } from 'react';
import { Search, Sparkles, Database, CheckCircle2, ArrowRight, CornerDownLeft } from 'lucide-react';

const SAMPLE_QUERIES = [
  'What database migration did Alex commit to?',
  'Who is assigned to Slack webhook triggers?',
  'What decisions were made in Q3 Architecture Sync?',
];

export function InteractiveRagQueryWidget() {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleSearch = (textToSearch: string) => {
    setQuery(textToSearch);
    setIsSearching(true);
    setResult(null);

    setTimeout(() => {
      setIsSearching(false);
      if (textToSearch.toLowerCase().includes('database') || textToSearch.toLowerCase().includes('alex')) {
        setResult(
          `"Decision #DEC-302: Alex Rivera committed to deploying PostgreSQL database migration and verifying Slack webhook triggers by Friday EOD." (Source: Q3 Architecture Sync, Oct 12, Timestamp 14:22)`
        );
      } else if (textToSearch.toLowerCase().includes('webhook') || textToSearch.toLowerCase().includes('slack')) {
        setResult(
          `"Decision #DEC-[#104]: Sarah Chen and Alex Rivera configured Slack webhooks for real-time unacted decision SLA alerts." (Source: Sprint Retrospective, Oct 19, Timestamp 08:15)`
        );
      } else {
        setResult(
          `"Decision #DEC-204: Product Roadmap scope approved. Team velocity benchmarked at 2.4 days average resolution time." (Source: Q3 Strategy Sync, Oct 05, Timestamp 22:04)`
        );
      }
    }, 500);
  };

  return (
    <div className="w-full max-w-3xl mx-auto glass-card-frost rounded-3xl p-6 border-white shadow-xl space-y-4 text-left animate-border-beam">
      
      <div className="flex items-center justify-between border-b border-indigo-100 pb-3">
        <div className="flex items-center space-x-2">
          <Database className="w-4 h-4 text-[#4F46E5]" />
          <span className="text-xs font-mono font-bold text-[#1E1B4B]">
            Interactive RAG Semantic Search Query Studio
          </span>
        </div>
        <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 font-bold">
          pgvector Index Ready
        </span>
      </div>

      {/* Query Search Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (query.trim()) handleSearch(query);
        }}
        className="relative flex items-center"
      >
        <Search className="w-4 h-4 text-[#4F46E5] absolute left-4 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Ask anything about past meeting decisions or commitments..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full bg-white border border-indigo-200 rounded-2xl pl-11 pr-24 py-3.5 text-xs text-[#1E1B4B] placeholder-[#64748B] focus:outline-none focus:border-[#4F46E5] focus:ring-2 focus:ring-[#4F46E5]/20 transition shadow-inner font-sans font-medium"
        />
        <button
          type="submit"
          className="absolute right-2 px-4 py-2 rounded-xl btn-indigo-glow text-xs font-bold transition flex items-center space-x-1"
        >
          <span>Query RAG</span>
          <CornerDownLeft className="w-3 h-3" />
        </button>
      </form>

      {/* Sample Query Click Capsules */}
      <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
        <span className="text-[11px] font-mono text-[#64748B] font-semibold">Try sample:</span>
        {SAMPLE_QUERIES.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSearch(q)}
            className="px-3 py-1 rounded-xl bg-indigo-50/80 hover:bg-indigo-100 border border-indigo-100 text-[11px] font-sans font-bold text-[#3730A3] transition active:scale-95"
          >
            "{q}"
          </button>
        ))}
      </div>

      {/* Dynamic Search Spinner or RAG Result Card */}
      {isSearching && (
        <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 text-xs font-mono text-[#4338CA] flex items-center space-x-2 animate-pulse">
          <Sparkles className="w-4 h-4 text-[#4F46E5] animate-spin" />
          <span>Searching pgvector transcript embeddings...</span>
        </div>
      )}

      {result && !isSearching && (
        <div className="p-4 rounded-2xl bg-white border border-emerald-300 shadow-md space-y-2 animate-in fade-in zoom-in duration-300">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-emerald-700 font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>CITED DECISION VECTOR RESULT</span>
            </span>
            <span className="text-[10px] text-[#64748B]">Cosine Similarity: 0.96</span>
          </div>
          <p className="text-xs text-[#1E1B4B] font-sans font-medium leading-relaxed">
            {result}
          </p>
        </div>
      )}

    </div>
  );
}
