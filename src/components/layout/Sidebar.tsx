'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Mic,
  GitCommit,
  CheckSquare,
  Award,
  Settings2,
  ShieldCheck,
  Zap,
  Radio,
} from 'lucide-react';
import { clsx } from 'clsx';
import { useI18n } from '@/i18n/I18nContext';
import { MeetrixLogo } from '@/components/brand/MeetrixLogo';

export function Sidebar() {
  const pathname = usePathname();
  const { t } = useI18n();
  const [userRole, setUserRole] = useState<string>('member');
  const [userEmail, setUserEmail] = useState<string>('');
  const [userName, setUserName] = useState<string>('');

  const loadUserProfile = () => {
    fetch('/api/user/profile')
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setUserRole(data.user.role || 'member');
          setUserEmail(data.user.email || '');
          setUserName(data.user.name || '');
        }
      })
      .catch(() => {
        try {
          const cookies = document.cookie.split('; ');
          const sessionCookie = cookies.find((c) => c.startsWith('session_user='));
          if (sessionCookie) {
            const val = decodeURIComponent(sessionCookie.split('=')[1]);
            const userObj = JSON.parse(val);
            setUserRole(userObj.role || 'member');
            setUserEmail(userObj.email || '');
            setUserName(userObj.name || '');
          }
        } catch {}
      });
  };

  useEffect(() => {
    loadUserProfile();
    window.addEventListener('profileUpdated', loadUserProfile);
    return () => window.removeEventListener('profileUpdated', loadUserProfile);
  }, []);

  if (pathname === '/' || pathname === '/welcome' || pathname === '/login') {
    return null;
  }

  const isAdmin = userRole?.toLowerCase() === 'admin';
  const initials = userName
    ? userName.charAt(0).toUpperCase()
    : userEmail
    ? userEmail.charAt(0).toUpperCase()
    : 'M';

  const navItems = [
    { name: 'Overview',          href: '/dashboard',        icon: LayoutDashboard, color: '#4F46E5' },
    { name: 'Meetings',          href: '/meetings',         icon: Mic,             color: '#0D9488' },
    { name: 'Decisions',         href: '/decisions',        icon: GitCommit,       color: '#D97706', badge: '2', badgeVariant: 'amber' },
    { name: 'Action Items',      href: '/action-items',     icon: CheckSquare,     color: '#2563EB' },
    { name: 'Team Reliability',  href: '/accountability',   icon: Award,           color: '#D97706' },
  ] as any[];

  if (isAdmin) {
    navItems.push({
      name: 'Admin Control',
      href: '/admin/dashboard',
      icon: ShieldCheck,
      color: '#7C3AED',
      badge: '★',
      badgeVariant: 'violet',
    });
  }

  navItems.push({
    name: 'Integrations',
    href: '/settings/integrations',
    icon: Settings2,
    color: '#64748B',
  });

  return (
    <aside
      className="w-64 flex flex-col h-screen sticky top-0 z-40 select-none overflow-hidden glass-nav-frost border-r border-white/80"
    >
      {/* ── Brand ── */}
      <div className="px-5 pt-5 pb-4 border-b border-indigo-100/60">
        <Link href="/">
          <MeetrixLogo size="md" />
        </Link>
      </div>

      {/* ── Workspace Badge ── */}
      <div className="px-4 pt-3.5 pb-1">
        <div
          className="flex items-center gap-3 px-3.5 py-3 rounded-2xl bg-white/90 border border-indigo-100 shadow-sm"
        >
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-[11px] font-extrabold font-mono shrink-0 bg-gradient-to-tr from-[#3730A3] to-[#4F46E5] shadow-md"
          >
            {isAdmin ? 'AD' : 'MX'}
          </div>
          <div className="min-w-0">
            <p className="text-[12.5px] font-sans font-bold text-[#1E1B4B] truncate leading-tight">
              {isAdmin ? 'Admin Workspace' : 'Meetrix Workspace'}
            </p>
            <p className="text-[10px] font-mono font-bold mt-0.5 text-[#4338CA]">
              {isAdmin ? 'Full Access · Admin' : 'Team Plan'}
            </p>
          </div>
        </div>
      </div>

      {/* ── Nav ── */}
      <nav className="flex-1 px-4 py-3 space-y-1 overflow-y-auto">
        <p className="text-[9px] font-mono font-bold uppercase tracking-[0.15em] px-2 pb-2 pt-1 text-[#64748B]">
          Workspace Navigation
        </p>

        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== '/dashboard' && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex items-center justify-between px-3.5 py-2.5 rounded-2xl transition-all duration-200 group w-full ${
                isActive
                  ? 'bg-indigo-50/90 border border-indigo-200/80 shadow-sm font-bold text-[#1E1B4B]'
                  : 'border border-transparent text-[#475569] hover:bg-white/80 hover:text-[#1E1B4B]'
              }`}
            >
              {/* Active bar */}
              {isActive && (
                <span
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-[3.5px] h-6 rounded-r-full bg-[#4F46E5] shadow-[0_0_8px_#4F46E5]"
                />
              )}

              <div className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200 ${
                    isActive
                      ? 'bg-white border border-indigo-200 shadow-sm'
                      : 'bg-white/60 border border-slate-200/60'
                  }`}
                >
                  <Icon
                    className="w-[16px] h-[16px]"
                    style={{ color: isActive ? item.color : '#64748B' }}
                  />
                </div>

                <span className="text-[12.5px] font-sans">
                  {item.name}
                </span>
              </div>

              {item.badge && (
                <span
                  className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border shrink-0 ${
                    item.badgeVariant === 'amber'
                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                      : 'bg-purple-50 text-purple-700 border-purple-200'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* ── Ingest & Live CTAs ── */}
      <div className="px-4 pb-3 space-y-2">
        <Link
          href="/meetings/live"
          className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-[12px] font-bold font-sans transition-all duration-200 group shadow-sm hover:bg-rose-100"
        >
          <Radio className="w-3.5 h-3.5 text-rose-600 animate-pulse shrink-0" />
          <span>Start Live Meeting</span>
        </Link>

        <Link
          href="/meetings/upload"
          className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl btn-indigo-glow text-white text-[12px] font-bold font-sans transition-all duration-200 group shadow-md"
        >
          <Zap className="w-3.5 h-3.5 shrink-0" />
          <span>Ingest New Meeting</span>
        </Link>
      </div>

      {/* ── User Footer ── */}
      <div className="px-4 pb-5 pt-3 border-t border-indigo-100/60">
        <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-2xl bg-white/80 border border-indigo-100 shadow-sm">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#3730A3] to-[#4F46E5] text-white text-[11px] font-extrabold font-sans flex items-center justify-center shrink-0 shadow-sm">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[12px] font-sans font-bold text-[#1E1B4B] truncate leading-tight">
              {userName || 'You'}
            </p>
            <p className="text-[9px] font-mono text-[#64748B] truncate mt-0.5">
              {userEmail || 'authenticated'}
            </p>
          </div>
          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 shadow-[0_0_6px_#10B981]" />
        </div>
      </div>
    </aside>
  );
}
