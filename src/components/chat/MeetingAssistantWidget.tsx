'use client';

import { useState } from 'react';
import { Bot, X, Send, Sparkles } from 'lucide-react';

interface ChatMessage {
  role: 'user' | 'assistant';
  text: string;
}

export function MeetingAssistantWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      text: 'Ask me anything about past meeting decisions, action items, or owner commitments!',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: userMsg }),
      });

      const data = await res.json();
      if (data.answer) {
        setMessages((prev) => [...prev, { role: 'assistant', text: data.answer }]);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', text: 'No matching decision found in vector index.' },
        ]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', text: 'Error querying meeting decision vector store.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans select-none">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="w-12 h-12 rounded-2xl btn-indigo-glow text-white flex items-center justify-center shadow-xl transition"
          title="Open Meetrix Vector Assistant"
        >
          <Bot className="w-5 h-5" />
        </button>
      ) : (
        <div className="w-96 glass-card-elevated-frost bg-white/95 border border-white rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[480px]">
          {/* Widget Header */}
          <div className="p-4 bg-indigo-50/80 border-b border-indigo-100 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-xl bg-white border border-indigo-200 flex items-center justify-center text-[#4F46E5] shadow-sm">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <div>
                <h4 className="text-xs font-sans font-extrabold text-[#1E1B4B]">Meetrix AI Assistant</h4>
                <p className="text-[10px] font-mono font-bold text-[#4338CA]">Semantic Decision RAG</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-[#64748B] hover:text-[#1E1B4B] p-1.5 rounded-full hover:bg-white transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 font-sans text-xs">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] p-3.5 rounded-2xl leading-relaxed shadow-sm font-medium whitespace-pre-wrap ${
                    m.role === 'user'
                      ? 'btn-indigo-glow text-white'
                      : 'bg-white border border-indigo-100 text-[#1E1B4B]'
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="text-[10px] font-mono font-bold text-[#4338CA] animate-pulse">
                Searching decision RAG vector index...
              </div>
            )}
          </div>

          {/* Chat Input */}
          <form onSubmit={handleSend} className="p-3 bg-indigo-50/50 border-t border-indigo-100 flex gap-2">
            <input
              type="text"
              placeholder="Ask about meeting decisions..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 bg-white border border-indigo-200 rounded-xl px-3 py-2 text-xs text-[#1E1B4B] placeholder-[#64748B] focus:outline-none focus:border-[#4F46E5] font-medium shadow-sm"
            />
            <button
              type="submit"
              className="p-2.5 rounded-xl btn-indigo-glow text-white transition shadow-sm"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
