'use client';

import React from 'react';

interface MeetrixLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showWordmark?: boolean;
  darkText?: boolean;
  variant?: 'light' | 'dark';
}

export function MeetrixLogo({
  className = '',
  size = 'md',
  showWordmark = true,
  darkText = false,
  variant = 'dark',
}: MeetrixLogoProps) {
  const dimensionMap = {
    sm: { icon: 26, text: 'text-base' },
    md: { icon: 34, text: 'text-xl' },
    lg: { icon: 44, text: 'text-2xl' },
  };

  const currentSize = dimensionMap[size];
  const isDarkText = darkText || variant === 'dark';

  return (
    <div className={`inline-flex items-center space-x-3 select-none ${className}`}>
      {/* Meetrix AI Electric Periwinkle Logo Icon */}
      <div className="relative flex items-center justify-center shrink-0">
        <svg
          width={currentSize.icon}
          height={currentSize.icon}
          viewBox="0 0 36 36"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect width="36" height="36" rx="10" fill="#0F172A" />
          <rect x="0.5" y="0.5" width="35" height="35" rx="9.5" stroke="#334155" />

          {/* Solid Outer Pillars */}
          <line x1="9" y1="10" x2="9" y2="26" stroke="#6366F1" strokeWidth="3.2" strokeLinecap="round" />
          <line x1="27" y1="10" x2="27" y2="26" stroke="#6366F1" strokeWidth="3.2" strokeLinecap="round" />

          {/* Running Stitch Crossbar */}
          <path
            d="M9 10L18 19L27 10"
            stroke="#818CF8"
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="4.5 3"
          />
        </svg>
      </div>

      {/* Clean Meetrix Wordmark */}
      {showWordmark && (
        <span
          className={`font-sans font-extrabold tracking-tight ${
            isDarkText ? 'text-[#1E1B4B]' : 'text-[#F8FAFC]'
          } ${currentSize.text}`}
        >
          Meetrix
        </span>
      )}
    </div>
  );
}
