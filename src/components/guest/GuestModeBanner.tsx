'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Lock, LogIn, UserPlus, Eye, ShieldAlert, Sparkles, X, ChevronRight } from 'lucide-react';

export function GuestModeBanner() {
  const [isGuest, setIsGuest] = useState(false);
  const [showFreezeModal, setShowFreezeModal] = useState(false);
  const [frozenActionName, setFrozenActionName] = useState('This feature');
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check cookie or profile
    const checkUser = () => {
      try {
        const cookies = document.cookie.split(';');
        for (const cookie of cookies) {
          const [name, val] = cookie.trim().split('=');
          if (name === 'session_user') {
            const parsed = JSON.parse(decodeURIComponent(val));
            if (parsed.role === 'guest' || parsed.email?.includes('guest')) {
              setIsGuest(true);
              return;
            }
          }
        }
      } catch {}

      fetch('/api/user/profile')
        .then((res) => res.json())
        .then((data) => {
          if (data.user?.isGuest || data.user?.role === 'guest' || data.user?.email?.includes('guest')) {
            setIsGuest(true);
          }
        })
        .catch(() => {});
    };

    checkUser();

    // Listen to custom freeze action events across the app
    const handleFreezeEvent = (e: any) => {
      setFrozenActionName(e.detail?.actionName || 'This feature');
      setShowFreezeModal(true);
    };

    window.addEventListener('meetrix-guest-freeze', handleFreezeEvent);
    return () => window.removeEventListener('meetrix-guest-freeze', handleFreezeEvent);
  }, []);

  if (!isGuest) return null;

  return (
    <>
      {/* Prominent Sticky/Top Guest Notice Card */}
      {!dismissed && (
        <div className="w-full glass-card-elevated-frost rounded-3xl p-4 sm:p-5 border-amber-300 bg-gradient-to-r from-amber-50/95 via-white/95 to-indigo-50/95 shadow-[0_20px_50px_rgba(245,158,11,0.12)] relative overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300 mb-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center space-x-3.5">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-700 shadow-sm shrink-0">
                <Lock className="w-4 h-4 text-amber-600" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center space-x-2">
                  <h4 className="text-sm font-sans font-bold text-[#1E1B4B]">
                    Guest Preview • View Only
                  </h4>
                  <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-mono font-bold border border-amber-300">
                    Preview
                  </span>
                </div>
                <p className="text-xs text-[#475569] font-medium leading-relaxed max-w-xl">
                  You're exploring as a guest. Feel free to look around! To record new meetings or edit tasks, please sign in.
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2.5 shrink-0 w-full md:w-auto">
              <Link
                href="/login"
                className="flex-1 md:flex-none px-5 py-2.5 rounded-xl btn-indigo-glow text-white text-xs font-bold transition flex items-center justify-center space-x-2 shadow-md hover:scale-[1.02]"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Log In to Use Features</span>
              </Link>
              <Link
                href="/#auth-section"
                className="flex-1 md:flex-none px-4 py-2.5 rounded-xl btn-white-frost text-[#1E1B4B] text-xs font-bold transition flex items-center justify-center space-x-1"
              >
                <span>Create Account</span>
              </Link>
              <button
                onClick={() => setDismissed(true)}
                className="p-2 rounded-xl hover:bg-slate-100 text-[#64748B] hover:text-[#1E1B4B] transition"
                title="Hide banner"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Pill if Banner is Dismissed */}
      {dismissed && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in duration-200">
          <button
            onClick={() => setDismissed(false)}
            className="px-4 py-2.5 rounded-full bg-amber-500 hover:bg-amber-600 text-white shadow-xl text-xs font-mono font-bold flex items-center space-x-2 transition"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Guest View • Log In</span>
          </button>
        </div>
      )}

      {/* Interactive Freeze Notice Modal */}
      {showFreezeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md glass-card-elevated-frost rounded-3xl p-6 sm:p-7 border-white shadow-2xl space-y-5 bg-white relative animate-in zoom-in-95 duration-200 text-center">
            <button
              onClick={() => setShowFreezeModal(false)}
              className="absolute top-4 right-4 p-2 rounded-xl hover:bg-slate-100 text-[#64748B] transition"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-700 mx-auto shadow-sm">
              <Lock className="w-6 h-6 text-amber-600" />
            </div>

            <div className="space-y-2">
              <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-[10px] font-mono font-bold uppercase border border-amber-200">
                Log In Required
              </span>
              <h3 className="text-lg font-sans font-extrabold text-[#1E1B4B]">
                Want to use {frozenActionName.toLowerCase()}?
              </h3>
              <p className="text-xs text-[#475569] leading-relaxed font-medium">
                Log in or create a free account to record meetings, assign tasks, and save your progress!
              </p>
            </div>

            <div className="space-y-2 pt-2">
              <Link
                href="/login"
                className="w-full py-3 rounded-xl btn-indigo-glow text-white text-xs font-bold transition flex items-center justify-center space-x-2 shadow-md"
              >
                <LogIn className="w-4 h-4" />
                <span>Log In Now</span>
              </Link>
              <Link
                href="/#auth-section"
                className="w-full py-2.5 rounded-xl btn-white-frost text-[#1E1B4B] text-xs font-bold transition flex items-center justify-center space-x-1.5"
              >
                <UserPlus className="w-4 h-4 text-[#4F46E5]" />
                <span>Create Free Account</span>
              </Link>
              <button
                type="button"
                onClick={() => setShowFreezeModal(false)}
                className="text-[11px] font-sans font-semibold text-[#64748B] hover:text-[#1E1B4B] transition pt-1"
              >
                Keep Looking Around
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/**
 * Utility helper to trigger freeze notice if in guest mode
 */
export function triggerGuestFreeze(actionName: string = 'This feature'): boolean {
  try {
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const [name, val] = cookie.trim().split('=');
      if (name === 'session_user') {
        const parsed = JSON.parse(decodeURIComponent(val));
        if (parsed.role === 'guest' || parsed.email?.includes('guest')) {
          window.dispatchEvent(
            new CustomEvent('meetrix-guest-freeze', { detail: { actionName } })
          );
          return true; // was frozen
        }
      }
    }
  } catch {}
  return false;
}
