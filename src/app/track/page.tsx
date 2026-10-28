'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useI18n } from '@/lib/i18n/context';
import { fetchReportByTrackingId } from '@/lib/reports-store';
import { NeoInput } from '@/components/neopop/neo-input';
import { Search, ShieldAlert, ArrowRight, ShieldCheck, History } from 'lucide-react';

export default function TrackPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { t, language } = useI18n();

  const [trackingId, setTrackingId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = trackingId.trim().toUpperCase();

    if (!cleanId) {
      setError(language === 'kn' ? 'ದಯವಿಟ್ಟು ಟ್ರ್ಯಾಕಿಂಗ್ ಐಡಿ ನಮೂದಿಸಿ' : 'Please enter tracking ID');
      return;
    }

    setError('');
    setLoading(true);

    const report = await fetchReportByTrackingId(cleanId, user?.id);
    setLoading(false);

    if (!report) {
      setError(t.invalidTrackingId);
    } else {
      router.push(`/reports/${report.tracking_id}`);
    }
  };

  return (
    <div className="py-1 pb-12 space-y-4">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-neutral-900">
          {t.trackTitle}
        </h1>
        <p className="text-xs font-medium text-neutral-500 mt-0.5">
          {t.trackSubtitle}
        </p>
      </div>

      {/* Tracking Form Card */}
      <div className="bg-white rounded-2xl border border-neutral-200/90 p-4 shadow-sm">
        <form onSubmit={handleSearch} className="space-y-3.5">
          <NeoInput
            label={t.trackingIdLabel}
            value={trackingId}
            onChange={(e) => {
              setTrackingId(e.target.value);
              if (error) setError('');
            }}
            placeholder={t.trackingInputPlaceholder}
            leftIcon={<Search className="w-4 h-4 text-neutral-400" />}
            autoCapitalize="characters"
            helperText="e.g. JAN-2026-X8K2"
          />

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-semibold text-red-600 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-[#059669] hover:bg-[#047857] text-white font-bold text-xs uppercase tracking-wider shadow-sm active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Search className="w-4 h-4" />
            <span>{loading ? 'Searching...' : t.checkStatusBtn}</span>
          </button>
        </form>
      </div>

      {/* Privacy Notice Card */}
      <div className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-200/70 flex items-center gap-2.5 text-xs text-neutral-500">
        <ShieldCheck className="w-4 h-4 text-[#059669] flex-shrink-0" />
        <span>{t.privacyNotice}</span>
      </div>

      {/* Shortcut to My Reports */}
      {user && (
        <button
          onClick={() => router.push('/my-reports')}
          className="w-full py-3 px-4 bg-white rounded-xl border border-neutral-200 shadow-sm flex items-center justify-between text-neutral-800 text-xs font-bold hover:bg-neutral-50 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-neutral-500" />
            <span>{language === 'kn' ? 'ನನ್ನ ಎಲ್ಲಾ ವರದಿಗಳು' : 'All My Submissions'}</span>
          </div>
          <ArrowRight className="w-4 h-4 text-neutral-400" />
        </button>
      )}
    </div>
  );
}
