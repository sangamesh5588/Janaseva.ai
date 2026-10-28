'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  User,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  HelpCircle,
  X,
  ShieldCheck,
  Building2,
} from 'lucide-react';
import { authenticateStaff } from '@/lib/staff-auth';

function PortalLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') === 'admin' ? 'admin' : 'official';

  const [activeTab, setActiveTab] = useState<'admin' | 'official'>(initialTab);
  const [email, setEmail] = useState(
    initialTab === 'admin' ? 'admin@janaseva.com' : 'dept038@road.com'
  );
  const [password, setPassword] = useState(
    initialTab === 'admin' ? 'Admin@123' : 'Dept038'
  );
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showHelpModal, setShowHelpModal] = useState(false);

  const switchTab = (tab: 'admin' | 'official') => {
    setActiveTab(tab);
    setError('');
    if (tab === 'admin') {
      setEmail('admin@janaseva.com');
      setPassword('Admin@123');
    } else {
      setEmail('dept038@road.com');
      setPassword('Dept038');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await authenticateStaff(email, password);
      if (!result.success || !result.session) {
        setError(result.error || 'Invalid credentials. Please verify your email and password.');
        setLoading(false);
        return;
      }

      if (result.session.role === 'admin') {
        router.push('/admin/dashboard');
      } else {
        router.push('/official/dashboard');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/70 sm:bg-slate-100/60 flex items-center justify-center p-4 sm:p-6 font-sans">
      <div className="w-full max-w-sm sm:max-w-md bg-white rounded-[32px] sm:rounded-[36px] shadow-xl sm:shadow-2xl sm:shadow-slate-200/60 border border-slate-100 p-6 sm:p-8 space-y-6">
        {/* Minimal Clean Brand Logo */}
        <div className="flex flex-col items-center justify-center gap-1.5 pt-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-black text-sm shadow-xs shadow-emerald-600/30">
              JS
            </div>
            <span className="text-xl font-black tracking-tight text-slate-900">
              JANASEVA<span className="text-emerald-600">.</span>
            </span>
          </div>
        </div>

        {/* Welcome Headline */}
        <div className="text-center space-y-1">
          <h1 className="text-2xl sm:text-[26px] font-extrabold text-slate-900 tracking-tight">
            Welcome back
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Sign in to manage municipal tasks and complaints
          </p>
        </div>

        {/* Segmented Switcher Tabs */}
        <div className="grid grid-cols-2 p-1.5 rounded-2xl bg-slate-100/90 border border-slate-200/60">
          <button
            type="button"
            onClick={() => switchTab('official')}
            className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'official'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Department
          </button>
          <button
            type="button"
            onClick={() => switchTab('admin')}
            className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'admin'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Admin
          </button>
        </div>

        {/* Section Heading */}
        <div className="space-y-0.5">
          <h2 className="text-sm font-bold text-slate-900">
            Sign in to continue
          </h2>
          <p className="text-xs text-slate-500">
            {activeTab === 'official'
              ? 'Access assigned ward grievances and live updates.'
              : 'Access city-wide oversight console and department routing.'}
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3.5 bg-red-50 border border-red-200/80 rounded-2xl text-xs font-semibold text-red-600 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span className="leading-tight">{error}</span>
          </div>
        )}

        {/* Clean Form */}
        <form onSubmit={handleLogin} className="space-y-3.5">
          {/* Email / Username Field */}
          <div className="relative flex items-center bg-slate-50/80 hover:bg-slate-50 focus-within:bg-white rounded-2xl border border-slate-200/80 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/10 transition-all px-4 py-3.5">
            <User className="w-5 h-5 text-slate-400 mr-3 flex-shrink-0" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={
                activeTab === 'admin' ? 'admin@janaseva.com' : 'dept038@road.com'
              }
              required
              className="w-full bg-transparent text-sm font-medium text-slate-900 placeholder:text-slate-400 outline-none"
            />
          </div>

          {/* Password Field */}
          <div className="relative flex items-center bg-slate-50/80 hover:bg-slate-50 focus-within:bg-white rounded-2xl border border-slate-200/80 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/10 transition-all px-4 py-3.5">
            <Lock className="w-5 h-5 text-slate-400 mr-3 flex-shrink-0" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full bg-transparent text-sm font-medium text-slate-900 placeholder:text-slate-400 outline-none"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-slate-400 hover:text-slate-600 focus:outline-none ml-2 transition-colors cursor-pointer"
              title={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>

          {/* Primary Action Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white font-bold text-sm shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-1"
          >
            <span>{loading ? 'Signing in...' : 'Sign In'}</span>
          </button>
        </form>

        {/* Footer Navigation & Subtle Help */}
        <div className="pt-2 border-t border-slate-100 flex flex-col items-center gap-2">
          <Link
            href="/"
            className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 transition-colors"
          >
            Citizen reporting portal? Return to Home
          </Link>

          <button
            type="button"
            onClick={() => setShowHelpModal(true)}
            className="text-[11px] font-medium text-slate-400 hover:text-slate-600 transition-colors inline-flex items-center gap-1 cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Bengaluru Ward Credentials Guide</span>
          </button>
        </div>
      </div>

      {/* Discrete Clean Credentials Guide Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Official Account Credentials
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowHelpModal(false)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                <span className="font-bold text-slate-900 block">Main Admin Account:</span>
                <p>Email: <code className="font-mono font-bold text-slate-800">admin@janaseva.com</code></p>
                <p>Password: <code className="font-mono font-bold text-slate-800">Admin@123</code></p>
              </div>

              <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 space-y-1.5">
                <span className="font-bold text-emerald-950 block">Bengaluru Department Accounts (117 PINs × 6 Departments):</span>
                <p className="text-[11px] text-emerald-900">
                  Formula: <code className="font-mono font-bold bg-white px-1.5 py-0.5 rounded border border-emerald-200">dept&lt;LAST_3_PIN&gt;@&lt;department&gt;.com</code>
                </p>
                <p className="text-[11px] text-emerald-900">
                  Password: <code className="font-mono font-bold bg-white px-1.5 py-0.5 rounded border border-emerald-200">Dept&lt;LAST_3_PIN&gt;</code>
                </p>
                <div className="pt-1 text-[11px] text-emerald-800 space-y-0.5">
                  <p>• <strong>Road:</strong> dept038@road.com (Indiranagar, PIN 560038)</p>
                  <p>• <strong>Water:</strong> dept038@water.com (Indiranagar, PIN 560038)</p>
                  <p>• <strong>Garbage:</strong> dept034@garbage.com (Koramangala, PIN 560034)</p>
                  <p>• <strong>Street Light:</strong> dept066@light.com (Whitefield, PIN 560066)</p>
                  <p>• <strong>Drainage:</strong> dept001@drainage.com (MG Road, PIN 560001)</p>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowHelpModal(false)}
              className="w-full py-3 rounded-2xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PortalLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <PortalLoginForm />
    </Suspense>
  );
}
