import Link from 'next/link';
import { Inbox, Plus } from 'lucide-react';

export interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
}

export function EmptyState({ title, description, actionLabel, actionHref }: EmptyStateProps) {
  return (
    <div className="glass-card-frost rounded-3xl p-8 text-center space-y-4 flex flex-col items-center justify-center border-white shadow-sm">
      <div className="w-12 h-12 rounded-2xl bg-white border border-indigo-200 flex items-center justify-center text-[#4F46E5] shadow-sm">
        <Inbox className="w-6 h-6" />
      </div>
      <div className="space-y-1 max-w-sm">
        <h4 className="text-sm font-sans font-bold text-[#1E1B4B]">{title}</h4>
        <p className="text-xs text-[#475569] leading-relaxed font-medium">{description}</p>
      </div>

      {actionLabel && actionHref && (
        <Link
          href={actionHref}
          className="px-4 py-2 rounded-2xl btn-indigo-glow font-bold text-xs transition flex items-center space-x-1.5 shadow-md"
        >
          <Plus className="w-3.5 h-3.5 stroke-[3]" />
          <span>{actionLabel}</span>
        </Link>
      )}
    </div>
  );
}
