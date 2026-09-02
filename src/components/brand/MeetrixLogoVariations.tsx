import React from 'react';
import { MeetrixLogo } from './MeetrixLogo';

export function MeetrixLogoVariations() {
  return (
    <div className="bg-white p-8 rounded-3xl border border-indigo-100 space-y-8 select-none shadow-sm">
      <div className="border-b border-indigo-100 pb-4">
        <h2 className="text-xl font-bold text-[#1E1B4B]">Meetrix AI Brand Identity System</h2>
        <p className="text-xs text-[#64748B] mt-1">Official logo variations and brand assets for light frosted glass themes.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-indigo-50/50 p-6 rounded-2xl border border-indigo-100 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-[#3730A3] uppercase">Primary Brand Logo</span>
            <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">Default</span>
          </div>
          <div className="flex items-center space-x-6 justify-center py-4 bg-white rounded-xl border border-indigo-100 shadow-sm">
            <MeetrixLogo size="lg" />
          </div>
        </div>

        <div className="bg-indigo-50/50 p-6 rounded-2xl border border-indigo-100 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-[#3730A3] uppercase">Compact Logo Icon</span>
            <span className="text-[10px] font-mono text-[#64748B]">Favicon / App Icon</span>
          </div>
          <div className="flex items-center space-x-6 justify-center py-4 bg-white rounded-xl border border-indigo-100 shadow-sm">
            <MeetrixLogo showWordmark={false} size="lg" />
          </div>
        </div>
      </div>
    </div>
  );
}
