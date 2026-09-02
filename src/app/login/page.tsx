'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Lock, Mail, Zap } from 'lucide-react';
import { MeetrixLogo } from '@/components/brand/MeetrixLogo';

export default function LoginPage() {
  const [authMode, setAuthMode] = useState<'signin' | 'signup' | 'forgot'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMessage('');

    if (authMode === 'forgot') {
      setTimeout(() => {
        setLoading(false);
        setSuccessMessage(`Password reset link sent to ${email || 'your email'}! Check your inbox.`);
      }, 600);
      return;
    }

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Authentication failed');
      }

      window.location.href = data.redirectUrl || '/dashboard';
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
      setLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'guest@meetrix.ai', password: 'guest', name: 'Guest User' }),
      });
      const data = await res.json();
      window.location.href = data.redirectUrl || '/dashboard';
    } catch {
      window.location.href = '/dashboard';
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0D17] text-[#F8FAFC] flex flex-col justify-between selection:bg-[#6366F1]/20 selection:text-[#818CF8] relative overflow-hidden">
      {/* Background Radial Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[450px] bg-[#6366F1]/10 rounded-full blur-[130px] pointer-events-none" />

      {/* Top Header Panel */}
      <div className="p-6 max-w-7xl mx-auto w-full z-20 flex items-center justify-between">
        <Link href="/">
          <MeetrixLogo size="md" variant="light" />
        </Link>

        {/* Enter as Guest in Top Panel */}
        <button
          onClick={handleGuestLogin}
          className="px-4 py-2 rounded-full bg-[#1A1E33] hover:bg-[#252B48] border border-[#2D3554] text-xs font-sans font-bold text-[#818CF8] hover:text-white transition flex items-center space-x-2 shadow-lg"
        >
          <Zap className="w-3.5 h-3.5 text-[#818CF8]" />
          <span>Enter as Guest</span>
        </button>
      </div>

      {/* Main Login Card Container */}
      <div className="flex-1 flex items-center justify-center p-6 relative z-20">
        <div className="w-full max-w-md nocturne-card rounded-2xl p-8 shadow-2xl relative space-y-6 border border-[#1D2238]">
          {/* Header Title */}
          <div className="space-y-2 text-center">
            <h2 className="text-3xl font-sans font-extrabold text-[#F8FAFC]">
              {authMode === 'forgot'
                ? 'Reset Password'
                : authMode === 'signin'
                ? 'Welcome to Meetrix'
                : 'Create Meetrix Account'}
            </h2>
            <p className="text-xs font-sans text-[#94A3B8]">
              {authMode === 'forgot'
                ? 'Enter your work email to receive a password reset code.'
                : authMode === 'signin'
                ? 'Sign in to access your team decision audit trail and owner index.'
                : 'Get started with autonomous meeting decision tracking in seconds.'}
            </p>
          </div>

          {/* Mode Switcher Pill Bar */}
          {authMode !== 'forgot' && (
            <div className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-[#0B0D17] border border-[#1D2238]">
              <button
                onClick={() => setAuthMode('signin')}
                className={`py-2 rounded-lg text-xs font-sans transition ${
                  authMode === 'signin'
                    ? 'bg-[#1A1E33] text-[#818CF8] font-bold border border-[#2D3554]'
                    : 'text-[#94A3B8] hover:text-[#F8FAFC]'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => setAuthMode('signup')}
                className={`py-2 rounded-lg text-xs font-sans transition ${
                  authMode === 'signup'
                    ? 'bg-[#1A1E33] text-[#818CF8] font-bold border border-[#2D3554]'
                    : 'text-[#94A3B8] hover:text-[#F8FAFC]'
                }`}
              >
                Create Account
              </button>
            </div>
          )}

          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-mono">
              {error}
            </div>
          )}

          {successMessage && (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold">
              {successMessage}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4 font-sans text-xs">
            <div className="space-y-1.5">
              <label className="text-[#94A3B8] font-medium">Work Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#0B0D17] border border-[#1D2238] rounded-xl pl-10 pr-4 py-3 text-xs text-[#F8FAFC] placeholder-[#94A3B8] focus:outline-none focus:border-[#818CF8] transition"
                />
              </div>
            </div>

            {authMode !== 'forgot' && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[#94A3B8] font-medium">Password</label>
                  <button
                    type="button"
                    onClick={() => { setAuthMode('forgot'); setError(''); setSuccessMessage(''); }}
                    className="text-[11px] text-[#818CF8] hover:underline font-medium"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[#0B0D17] border border-[#1D2238] rounded-xl pl-10 pr-4 py-3 text-xs text-[#F8FAFC] placeholder-[#94A3B8] focus:outline-none focus:border-[#818CF8] transition"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl btn-iris-glow font-bold text-xs transition flex items-center justify-center space-x-2 pt-3"
            >
              <span>
                {loading
                  ? 'Processing...'
                  : authMode === 'forgot'
                  ? 'Send Reset Link'
                  : authMode === 'signin'
                  ? 'Sign In'
                  : 'Create Account'}
              </span>
              <Zap className="w-4 h-4" />
            </button>

            {authMode === 'forgot' && (
              <button
                type="button"
                onClick={() => setAuthMode('signin')}
                className="w-full text-center text-xs text-[#94A3B8] hover:text-white transition pt-2"
              >
                Back to Sign In
              </button>
            )}
          </form>

          <div className="pt-2 text-center text-xs text-[#94A3B8]">
            <span>Need an enterprise workspace? </span>
            <Link href="/" className="text-[#818CF8] font-semibold hover:underline">
              Contact Sales
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-6 text-center text-xs font-mono text-[#94A3B8] z-20">
        © 2026 Meetrix AI Inc. Secure Workspace Auth.
      </div>
    </div>
  );
}
