'use client';

import { useTheme } from '@/context/ThemeContext';
import { Sun, Moon, Laptop } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative font-mono text-xs select-none" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-8 h-8 rounded-lg bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-elevated)] text-[var(--text-muted)] hover:text-[var(--text-primary)] flex items-center justify-center transition"
        title="Toggle Theme (Light / Dark / System)"
      >
        {resolvedTheme === 'dark' ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5 text-amber-600" />}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-36 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-color)] shadow-xl p-1.5 z-50 space-y-0.5">
          <button
            onClick={() => {
              setTheme('light');
              setIsOpen(false);
            }}
            className={`w-full flex items-center space-x-2 px-2.5 py-1.5 rounded-lg text-xs transition ${
              theme === 'light'
                ? 'bg-[var(--bg-surface-elevated)] text-[var(--brass-accent)] font-bold'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-elevated)]/60'
            }`}
          >
            <Sun className="w-3.5 h-3.5 text-amber-600" />
            <span>Light Paper</span>
          </button>

          <button
            onClick={() => {
              setTheme('dark');
              setIsOpen(false);
            }}
            className={`w-full flex items-center space-x-2 px-2.5 py-1.5 rounded-lg text-xs transition ${
              theme === 'dark'
                ? 'bg-[var(--bg-surface-elevated)] text-[var(--brass-accent)] font-bold'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-elevated)]/60'
            }`}
          >
            <Moon className="w-3.5 h-3.5" />
            <span>Dark Ink</span>
          </button>

          <button
            onClick={() => {
              setTheme('system');
              setIsOpen(false);
            }}
            className={`w-full flex items-center space-x-2 px-2.5 py-1.5 rounded-lg text-xs transition ${
              theme === 'system'
                ? 'bg-[var(--bg-surface-elevated)] text-[var(--brass-accent)] font-bold'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-elevated)]/60'
            }`}
          >
            <Laptop className="w-3.5 h-3.5" />
            <span>System</span>
          </button>
        </div>
      )}
    </div>
  );
}
