'use client';

import { useI18n, SupportedLocale } from '@/i18n/I18nContext';
import { Globe } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

const LANGUAGES: Array<{ code: SupportedLocale; name: string; label: string }> = [
  { code: 'en', name: 'English', label: 'EN' },
  { code: 'hi', name: 'हिंदी (Hindi)', label: 'HI' },
];

export function LanguageSwitcher() {
  const { locale, setLocale } = useI18n();
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

  const currentLang = LANGUAGES.find((l) => l.code === locale) || LANGUAGES[0];

  return (
    <div className="relative font-mono text-xs select-none" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="h-8 px-3 rounded-xl bg-white border border-indigo-200 hover:border-[#4F46E5] text-[#3730A3] flex items-center space-x-1.5 transition shadow-sm"
        title="Switch Language (i18n)"
      >
        <Globe className="w-3.5 h-3.5 text-[#4F46E5]" />
        <span className="font-bold">{currentLang.label}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-36 rounded-2xl bg-white/98 backdrop-blur-xl border border-indigo-100 shadow-[0_15px_40px_rgba(79,70,229,0.15)] p-1.5 z-50 space-y-0.5 animate-in fade-in">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => {
                setLocale(lang.code);
                setIsOpen(false);
              }}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-sans font-bold transition ${
                locale === lang.code
                  ? 'bg-indigo-50 text-[#3730A3] border border-indigo-200 shadow-sm'
                  : 'text-[#475569] hover:text-[#1E1B4B] hover:bg-slate-50'
              }`}
            >
              <span>{lang.name}</span>
              <span className="text-[10px] font-mono font-bold text-[#4338CA] uppercase">{lang.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
