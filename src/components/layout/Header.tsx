'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Bell,
  Search,
  Zap,
  User as UserIcon,
  LogOut,
  ShieldCheck,
  X,
  CheckCircle2,
  ChevronDown,
  Mail,
  Building,
  Settings2,
  ChevronRight,
  FileText,
  Radio,
  LogIn,
  UserPlus,
} from 'lucide-react';
import { useI18n } from '@/i18n/I18nContext';

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useI18n();

  const [user, setUser] = useState({
    name: 'Admin User',
    email: 'admin@meetrix.ai',
    role: 'admin',
    initials: 'A',
    organization: 'Meetrix Workspace',
  });

  const [showProfileDrawer, setShowProfileDrawer] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchFocused, setSearchFocused] = useState(false);

  // Profile Edit State
  const [editName, setEditName] = useState(user.name);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');

  const menuRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Fetch logged in user profile
  useEffect(() => {
    fetch('/api/user/profile')
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setUser(data.user);
          setEditName(data.user.name);
        }
      })
      .catch(() => {});
  }, []);

  // Close notifications on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Live search handler
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(() => {
      fetch(`/api/decisions?search=${encodeURIComponent(searchQuery)}`)
        .then((res) => res.json())
        .then((data) => {
          setSearchResults(data.decisions || []);
        })
        .catch(() => {});
    }, 200);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editName }),
      });
      if (res.ok) {
        // Re-fetch from server to sync the updated cookie name everywhere
        const refreshed = await fetch('/api/user/profile');
        const data = await refreshed.json();
        if (data.user) {
          setUser(data.user);
          setEditName(data.user.name);
        } else {
          const updatedInitials = editName.charAt(0).toUpperCase();
          setUser((prev) => ({ ...prev, name: editName, initials: updatedInitials }));
        }
        setProfileSuccess('Profile updated successfully!');
        window.dispatchEvent(new Event('profileUpdated'));
        setTimeout(() => {
          setProfileSuccess('');
        }, 2500);
      }
    } catch {
    } finally {
      setSavingProfile(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/';
  };

  if (pathname === '/' || pathname === '/welcome' || pathname === '/login') {
    return null;
  }

  const isAdmin = user.role?.toLowerCase() === 'admin';

  return (
    <>
      <header className="h-14 glass-nav-frost border-b border-white/80 px-6 flex items-center justify-between sticky top-0 z-30 select-none">
        {/* Inline Search Bar with Dropdown */}
        <div className="flex items-center space-x-3 flex-1 max-w-sm" ref={searchRef}>
          <div className="relative w-full">
            <Search className="w-3.5 h-3.5 text-[#4F46E5] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder={t('common.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              className="w-full bg-white/90 border border-indigo-200 focus:border-[#4F46E5] rounded-2xl pl-9 pr-8 py-1.5 text-xs font-sans text-[#1E1B4B] placeholder-[#64748B] focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 transition duration-200 shadow-sm font-medium"
            />
            {searchQuery && (
              <button
                onClick={() => { setSearchQuery(''); setSearchResults([]); searchInputRef.current?.focus(); }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#1E1B4B] transition"
              >
                <X className="w-3 h-3" />
              </button>
            )}

            {/* Inline Dropdown Results */}
            {searchFocused && (
              <div className="absolute top-full left-0 right-0 mt-2 rounded-2xl bg-white/98 backdrop-blur-xl border border-indigo-100 shadow-[0_20px_60px_rgba(79,70,229,0.15)] z-50 overflow-hidden">
                {searchQuery.trim() === '' ? (
                  <div className="p-3 space-y-1">
                    <p className="text-[10px] font-mono text-[#64748B] font-bold uppercase tracking-wider px-1 pb-1">Quick Navigation</p>
                    {[
                      { label: 'Dashboard', href: '/dashboard' },
                      { label: 'All Meetings', href: '/meetings' },
                      { label: 'Decisions', href: '/decisions' },
                      { label: 'Action Items', href: '/action-items' },
                    ].map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setSearchFocused(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-indigo-50 text-xs font-semibold text-[#1E1B4B] transition"
                      >
                        <Search className="w-3 h-3 text-[#4F46E5]" />
                        <span>{item.label}</span>
                      </Link>
                    ))}
                  </div>
                ) : searchResults.length > 0 ? (
                  <div className="p-2 max-h-64 overflow-y-auto space-y-1">
                    <p className="text-[10px] font-mono text-[#64748B] font-bold uppercase tracking-wider px-2 pt-1 pb-1">Decisions</p>
                    {searchResults.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => {
                          setSearchFocused(false);
                          setSearchQuery('');
                          router.push('/decisions');
                        }}
                        className="flex items-start gap-2.5 px-3 py-2.5 rounded-xl hover:bg-indigo-50 cursor-pointer transition"
                      >
                        <FileText className="w-3.5 h-3.5 text-[#4F46E5] mt-0.5 shrink-0" />
                        <div>
                          <p className="text-xs font-bold text-[#1E1B4B] leading-snug">{item.title}</p>
                          <p className="text-[10px] text-[#64748B] line-clamp-1 mt-0.5">{item.context}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center text-[11px] text-[#64748B] font-mono">
                    No results for "{searchQuery}"
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center space-x-3" ref={menuRef}>
          {/* Live Meeting CTA */}
          <Link
            href="/meetings/live"
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-800 font-bold text-xs font-sans transition shadow-sm"
          >
            <Radio className="w-3.5 h-3.5 text-rose-600 animate-pulse" />
            <span>Live Meeting</span>
          </Link>

          {/* Primary Ingest CTA */}
          <Link
            href="/meetings/upload"
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full btn-indigo-glow font-bold text-xs font-sans transition shadow-md"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>{t('common.ingestAudio')}</span>
          </Link>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative w-8 h-8 rounded-xl bg-white border border-indigo-200 hover:border-[#4F46E5] flex items-center justify-center text-[#4F46E5] transition duration-200 shadow-sm"
            >
              <Bell className="w-3.5 h-3.5" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#4F46E5] shadow-[0_0_8px_#4F46E5]" />
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2.5 w-80 rounded-2xl bg-white/98 backdrop-blur-xl border border-indigo-100 shadow-[0_20px_60px_rgba(79,70,229,0.18)] p-4 space-y-3 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center justify-between border-b border-indigo-100 pb-2.5">
                  <span className="text-xs font-sans font-bold text-[#1E1B4B]">System Notifications</span>
                  <span className="text-[10px] font-mono font-bold text-[#4338CA] bg-indigo-50 px-2 py-0.5 rounded-full">2 Unread</span>
                </div>
                <div className="space-y-2 text-xs font-sans">
                  <div className="p-3 rounded-xl bg-indigo-50/60 border border-indigo-100 space-y-1">
                    <div className="flex items-center justify-between text-[#3730A3] font-bold text-[11px]">
                      <span>Follow-Through Review</span>
                      <span className="text-[9px] text-[#64748B] font-mono">Just now</span>
                    </div>
                    <p className="text-[#475569] text-[11px] leading-relaxed">
                      "Migrate database to PostgreSQL" review complete. Flagged 1 unacted decision.
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-rose-50/60 border border-rose-100 space-y-1">
                    <div className="flex items-center justify-between text-rose-700 font-bold text-[11px]">
                      <span>Stale Decision Alert</span>
                      <span className="text-[9px] text-[#64748B] font-mono">2h ago</span>
                    </div>
                    <p className="text-[#475569] text-[11px] leading-relaxed">
                      Decision #DEC-104 has been open for 14 days without owner verification.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* User Profile Trigger Button */}
          <button
            onClick={() => setShowProfileDrawer(true)}
            className="flex items-center space-x-2.5 pl-2.5 border-l border-indigo-100 hover:opacity-90 transition group"
          >
            <div className="relative">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#3730A3] to-[#4F46E5] text-white font-extrabold text-xs flex items-center justify-center font-sans shadow-sm">
                {user.initials || 'A'}
              </div>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white" />
            </div>

            <div className="hidden sm:flex flex-col items-start text-left">
              <span className="text-xs font-sans font-bold text-[#1E1B4B] group-hover:text-[#4F46E5] transition flex items-center gap-1">
                <span>{user.name}</span>
                <ChevronDown className="w-3 h-3 text-[#64748B]" />
              </span>
              <span className="text-[9px] font-mono font-bold text-[#4338CA] uppercase tracking-wider">
                {user.role}
              </span>
            </div>
          </button>
        </div>
      </header>

      {/* ULTRA-PREMIUM SLIDE-OVER SIDE PANEL DRAWER */}
      {showProfileDrawer && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop Dismiss Overlay */}
          <div
            onClick={() => setShowProfileDrawer(false)}
            className="fixed inset-0 bg-[#1E1B4B]/30 backdrop-blur-md transition-opacity duration-300"
          />

          {/* Sliding Panel */}
          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-sm sm:max-w-md glass-card-elevated-frost bg-white/95 border-l border-white shadow-2xl p-6 sm:p-7 flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-300">
              
              {/* Top Content */}
              <div className="space-y-6">
                {/* Panel Header */}
                <div className="flex items-center justify-between border-b border-indigo-100 pb-4">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-[#4F46E5]">
                      <Settings2 className="w-4 h-4" />
                    </div>
                    <h3 className="text-base font-sans font-extrabold text-[#1E1B4B]">Account & Session</h3>
                  </div>
                  <button
                    onClick={() => setShowProfileDrawer(false)}
                    className="w-8 h-8 rounded-full bg-white border border-indigo-200 flex items-center justify-center text-[#64748B] hover:text-[#1E1B4B] shadow-sm transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Identity Hero Card */}
                <div className="p-4 rounded-2xl bg-white border border-indigo-100 flex items-center space-x-4 shadow-sm">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#3730A3] to-[#4F46E5] text-white font-extrabold text-xl flex items-center justify-center font-sans shrink-0 shadow-md">
                    {user.initials || 'A'}
                  </div>
                  <div className="space-y-1 truncate">
                    <h4 className="text-base font-sans font-bold text-[#1E1B4B] truncate">{user.name}</h4>
                    <p className="text-xs font-mono text-[#64748B] truncate">{user.email}</p>
                    <div className="flex items-center gap-1.5 pt-0.5">
                      <span className="inline-block text-[9px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-[#3730A3] border border-indigo-200">
                        {user.role.toUpperCase()}
                      </span>
                      <span className="text-[10px] font-mono text-[#64748B] truncate">
                        • {user.organization}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Single Clean Action Card for Guest Mode */}
                {(user.email.toLowerCase().includes('guest') || user.name.toLowerCase().includes('guest')) ? (
                  <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-50/80 via-white to-indigo-50/40 border border-indigo-200 space-y-4 shadow-sm">
                    <div className="flex items-center justify-between text-xs font-mono font-bold text-[#3730A3]">
                      <span className="flex items-center gap-1.5">
                        <Zap className="w-4 h-4 text-[#4F46E5]" />
                        <span>GUEST DEMO SESSION</span>
                      </span>
                      <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full font-bold border border-emerald-200">
                        Active
                      </span>
                    </div>
                    <p className="text-xs text-[#475569] leading-relaxed font-medium">
                      You are exploring in <b>Guest Mode</b>. Create an account or sign in to save permanent meeting notes and sync tickets.
                    </p>

                    {/* Dual Action Buttons: Create Account & Sign In */}
                    <div className="grid grid-cols-2 gap-2.5 pt-1">
                      <Link
                        href="/login"
                        onClick={() => setShowProfileDrawer(false)}
                        className="py-3 rounded-xl btn-indigo-glow text-white font-bold text-xs shadow-md transition flex items-center justify-center space-x-1.5"
                      >
                        <UserPlus className="w-4 h-4" />
                        <span>Create Account</span>
                      </Link>

                      <Link
                        href="/login"
                        onClick={() => setShowProfileDrawer(false)}
                        className="py-3 rounded-xl bg-white border border-indigo-200 hover:bg-indigo-50 text-[#3730A3] font-bold text-xs transition flex items-center justify-center space-x-1.5 shadow-2xs"
                      >
                        <LogIn className="w-4 h-4 text-[#4F46E5]" />
                        <span>Sign In</span>
                      </Link>
                    </div>
                  </div>
                ) : (
                  /* Regular User Quick Actions */
                  <div className="pt-2 space-y-2 border-t border-indigo-100">
                    <Link
                      href="/login"
                      onClick={() => setShowProfileDrawer(false)}
                      className="w-full p-3.5 rounded-2xl bg-indigo-50/60 hover:bg-indigo-100/80 border border-indigo-200 flex items-center justify-between text-xs text-[#3730A3] font-bold transition group shadow-sm"
                    >
                      <div className="flex items-center space-x-2.5">
                        <LogIn className="w-4 h-4 text-[#4F46E5]" />
                        <span>Switch Account / Sign In</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[#4F46E5] group-hover:translate-x-0.5 transition" />
                    </Link>

                    {isAdmin && (
                      <Link
                        href="/admin/dashboard"
                        onClick={() => setShowProfileDrawer(false)}
                        className="w-full p-3.5 rounded-2xl bg-white border border-indigo-200 hover:border-[#4F46E5] flex items-center justify-between text-xs text-[#1E1B4B] transition group shadow-sm"
                      >
                        <div className="flex items-center space-x-3">
                          <ShieldCheck className="w-4 h-4 text-emerald-600" />
                          <div className="text-left">
                            <p className="font-bold font-sans">Admin Control Room</p>
                            <p className="text-[10px] text-[#64748B] font-mono">Manage meetings, members & audit logs</p>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-[#64748B] group-hover:text-[#1E1B4B] transition" />
                      </Link>
                    )}
                  </div>
                )}
              </div>

              {/* Bottom Log Out Button (Padded above floating AI chatbot) */}
              <div className="pt-4 pb-14 border-t border-indigo-100">
                <button
                  onClick={handleLogout}
                  className="w-full py-3.5 rounded-xl bg-[#FF3B30] hover:bg-[#E5352B] text-white font-extrabold text-sm tracking-wide transition flex items-center justify-center space-x-2 shadow-[0_0_20px_rgba(255,59,48,0.4)] hover:shadow-[0_0_30px_rgba(255,59,48,0.6)] cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log Out</span>
                </button>
              </div>

            </div>
          </div>
        </div>
      )}
    </>
  );
}
