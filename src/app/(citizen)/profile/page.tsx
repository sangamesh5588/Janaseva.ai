'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useI18n } from '@/lib/i18n/context';
import { NeoTag } from '@/components/neopop/neo-tag';
import { NeoInput } from '@/components/neopop/neo-input';
import {
  Mail,
  Globe,
  CheckCircle2,
  AlertCircle,
  FileText,
  LogOut,
  Edit2,
  Save,
  X,
} from 'lucide-react';

export default function ProfilePage() {
  const router = useRouter();
  const { user, profile, signOut, updatePreferredLanguage } = useAuth();
  const { t, language, setLanguage } = useI18n();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(profile?.name || user?.user_metadata?.full_name || 'Citizen User');
  const [isSaving, setIsSaving] = useState(false);

  const handleLanguageChange = async (lang: 'en' | 'kn') => {
    setLanguage(lang);
    await updatePreferredLanguage(lang);
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setIsEditing(false);
    }, 300);
  };

  const isEmailVerified = Boolean(user?.email_confirmed_at || user?.id?.startsWith('mock'));

  return (
    <div className="py-1 pb-12 space-y-4">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-neutral-900">
          {t.profileTitle}
        </h1>
        <p className="text-xs font-medium text-neutral-500 mt-0.5">
          {t.profileSubtitle}
        </p>
      </div>

      {/* Citizen ID Card */}
      <div className="bg-white rounded-2xl border border-neutral-200/90 p-4 shadow-sm space-y-3">
        <div className="flex items-start justify-between pb-3 border-b border-neutral-100">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-[#059669] text-white font-bold flex items-center justify-center text-base shadow-sm">
              {name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-sm font-bold text-neutral-900 leading-tight">
                {name}
              </h2>
              <div className="flex items-center gap-1.5 mt-0.5 text-xs text-neutral-500">
                <Mail className="w-3.5 h-3.5 text-neutral-400" />
                <span className="truncate max-w-[180px]">
                  {user?.email || 'citizen@karnataka.gov.in'}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsEditing(!isEditing)}
            className="p-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-700 transition-colors"
            title="Edit Profile"
          >
            {isEditing ? <X className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
          </button>
        </div>

        {/* Verification Status Badge */}
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-neutral-500">
            Status
          </span>
          {isEmailVerified ? (
            <NeoTag
              backgroundColor="#ECFDF5"
              color="#059669"
              icon={<CheckCircle2 className="w-3.5 h-3.5 text-[#059669]" />}
            >
              {t.verified}
            </NeoTag>
          ) : (
            <NeoTag
              backgroundColor="#FFF1F2"
              color="#E11D48"
              icon={<AlertCircle className="w-3.5 h-3.5 text-[#E11D48]" />}
            >
              {t.unverified}
            </NeoTag>
          )}
        </div>

        {/* Inline Edit Form */}
        {isEditing && (
          <form onSubmit={handleSaveProfile} className="pt-3 border-t border-neutral-100 space-y-3">
            <NeoInput
              label={t.nameLabel}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <button
              type="submit"
              disabled={isSaving}
              className="w-full py-2.5 rounded-xl bg-neutral-900 hover:bg-black text-white text-xs font-bold flex items-center justify-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? 'Saving...' : 'Save Profile'}</span>
            </button>
          </form>
        )}
      </div>

      {/* Language Preference Section */}
      <section className="bg-white rounded-2xl border border-neutral-200/90 p-4 shadow-sm space-y-2.5">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-neutral-600" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-500">
            {t.languagePreference}
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            type="button"
            onClick={() => handleLanguageChange('en')}
            className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              language === 'en'
                ? 'bg-neutral-900 text-white shadow-sm'
                : 'bg-neutral-50 text-neutral-700 border border-neutral-200 hover:bg-neutral-100'
            }`}
          >
            English
          </button>

          <button
            type="button"
            onClick={() => handleLanguageChange('kn')}
            className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              language === 'kn'
                ? 'bg-neutral-900 text-white shadow-sm'
                : 'bg-neutral-50 text-neutral-700 border border-neutral-200 hover:bg-neutral-100'
            }`}
          >
            ಕನ್ನಡ (Kannada)
          </button>
        </div>
      </section>

      {/* Shortcuts */}
      <section>
        <Link
          href="/my-reports"
          className="w-full py-3.5 px-4 bg-white rounded-2xl border border-neutral-200/90 shadow-sm flex items-center justify-between text-neutral-800 text-xs font-bold hover:bg-neutral-50 transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <FileText className="w-4 h-4 text-neutral-600" />
            <span>{t.myReportsTitle}</span>
          </div>
          <span className="text-[11px] bg-neutral-100 text-neutral-700 px-2 py-0.5 rounded-full">
            View
          </span>
        </Link>
      </section>

      {/* Sign Out Button */}
      <div className="pt-1">
        <button
          onClick={handleSignOut}
          className="w-full py-3 px-4 rounded-xl bg-white border border-red-200 text-red-600 text-xs font-bold hover:bg-red-50 transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
        >
          <LogOut className="w-4 h-4" />
          <span>{t.signOut}</span>
        </button>
      </div>
    </div>
  );
}
