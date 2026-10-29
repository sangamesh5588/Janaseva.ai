'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useI18n } from '@/lib/i18n/context';
import { NeoInput } from '@/components/neopop/neo-input';
import { Mail, Lock, AlertCircle, ArrowLeft, ShieldCheck } from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirectTo') || '/my-reports';

  const { signInWithEmail, signInWithGoogle, isMockMode } = useAuth();
  const { t, language } = useI18n();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError(language === 'kn' ? 'ದಯವಿಟ್ಟು ಇಮೇಲ್ ಮತ್ತು ಪಾಸ್‌ವರ್ಡ್ ನಮೂದಿಸಿ' : 'Please enter email and password');
      return;
    }
    setError('');
    setLoading(true);

    const { error: signInError } = await signInWithEmail(email, password);
    setLoading(false);

    if (signInError) {
      setError(signInError.message || 'Failed to sign in. Please check credentials.');
    } else {
      router.push(redirectTo);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setGoogleLoading(true);
    const { error: googleError } = await signInWithGoogle(redirectTo);
    setGoogleLoading(false);

    if (googleError) {
      setError(googleError.message || 'Google sign-in could not be completed.');
    } else if (isMockMode) {
      router.push(redirectTo);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto py-2">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-500 hover:text-neutral-900 mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>{language === 'kn' ? 'ಮುಖಪುಟ' : 'Back'}</span>
      </Link>

      <div className="mb-5">
        <h1 className="text-2xl font-extrabold tracking-tight text-neutral-900">
          {t.loginTitle}
        </h1>
        <p className="text-xs font-medium text-neutral-500 mt-0.5">
          {t.loginSubtitle}
        </p>
      </div>

      {redirectTo.startsWith('/report') && (
        <div className="mb-4 p-3.5 bg-indigo-50 border border-indigo-200/90 rounded-2xl flex items-start gap-3 text-indigo-950 shadow-xs">
          <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-xs">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-bold leading-tight">
              {language === 'kn' ? 'ದೂರು ದಾಖಲಿಸಲು ಸೈನ್ ಇನ್ ಮಾಡಿ' : 'Sign in to file your report'}
            </p>
            <p className="text-[11px] text-indigo-700/90 font-medium mt-0.5 leading-snug">
              {language === 'kn'
                ? 'ಲಾಗಿನ್ ಆದ ತಕ್ಷಣ ನಿಮ್ಮ ದೂರು ನಮೂನೆಗೆ ನೇರವಾಗಿ ಮರುನಿರ್ದೇಶಿಸಲಾಗುತ್ತದೆ.'
                : 'You will be redirected straight to your complaint form immediately after sign in.'}
            </p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-neutral-200/90 p-5 shadow-sm space-y-4 mb-4">
        {/* Google OAuth Button */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={googleLoading}
          className="w-full flex items-center justify-center gap-2.5 py-3 px-4 bg-white border border-neutral-200 hover:bg-neutral-50 rounded-xl text-xs font-bold text-neutral-800 shadow-sm active:scale-[0.99] transition-all cursor-pointer"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>{googleLoading ? 'Connecting...' : t.googleSignIn}</span>
        </button>

        {/* Divider */}
        <div className="relative flex items-center justify-center my-2">
          <div className="border-t border-neutral-200 w-full" />
          <span className="bg-white px-2 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider absolute">
            {t.orEmail}
          </span>
        </div>

        {/* Error Notice */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-semibold text-red-600 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Email Form */}
        <form onSubmit={handleEmailSubmit} className="space-y-3.5">
          <NeoInput
            label={t.emailLabel}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t.enterEmail}
            leftIcon={<Mail className="w-4 h-4" />}
            required
          />

          <NeoInput
            label={t.passwordLabel}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t.enterPassword}
            leftIcon={<Lock className="w-4 h-4" />}
            required
          />

          <div className="pt-1">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-[#059669] hover:bg-[#047857] text-white font-bold text-xs uppercase tracking-wider shadow-sm active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Signing in...' : t.signIn}
            </button>
          </div>
        </form>
      </div>

      {/* Switch to Signup */}
      <div className="text-center text-xs text-neutral-500 font-medium">
        <span>{t.dontHaveAccount} </span>
        <Link
          href={`/signup?redirectTo=${encodeURIComponent(redirectTo)}`}
          className="font-bold text-[#059669] hover:underline"
        >
          {t.signUp}
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs font-semibold text-neutral-500">Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
