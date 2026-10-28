'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import {
  LogIn,
  CheckCircle2,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import { PROBLEM_CATEGORIES } from '@/lib/constants';
import { CategoryIllustration } from '@/components/icons/category-illustrations';

export default function HomePage() {
  const router = useRouter();
  const { user, profile } = useAuth();

  const handleCategorySelect = (categoryId: string) => {
    router.push(`/report?category=${categoryId}`);
  };

  const citizenName =
    profile?.name ||
    user?.user_metadata?.full_name ||
    'Citizen';

  return (
    <div className="space-y-6 pb-24 font-sans">
      {/* 1. Full-Bleed Midnight Indigo Hero (Edges touch top, left, right completely with generous height) */}
      <section className="-mx-4 -mt-3 bg-gradient-to-b from-[#161626] via-[#1E1B4B] to-[#2B2564] text-white pt-7 px-5 pb-9 rounded-b-[40px] shadow-xl relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Bar: Brand + Avatar */}
        <div className="flex items-center justify-between mb-6 relative z-10">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-sm tracking-wider uppercase text-white">
              JANASEVA AI
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/portal"
              className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-indigo-100 text-[11px] font-semibold flex items-center gap-1.5 transition-colors border border-white/15"
              title="Official & Admin Portal"
            >
              <span>Staff Portal</span>
            </Link>

            {user ? (
              <Link
                href="/profile"
                className="w-10 h-10 rounded-full bg-white text-[#1E1B4B] font-extrabold flex items-center justify-center text-xs shadow-md ring-2 ring-white/30"
              >
                {citizenName.charAt(0).toUpperCase()}
              </Link>
            ) : (
              <Link
                href="/login"
                className="px-4 py-1.5 rounded-full bg-white/15 hover:bg-white/25 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </Link>
            )}
          </div>
        </div>

        {/* Hero Greeting */}
        <div className="mb-6 relative z-10">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight">
            Hello, {citizenName}
          </h1>
          <p className="text-xs text-indigo-200/90 font-medium mt-1">
            What problem would you like to fix today?
          </p>
        </div>

        {/* Stacked Layered Card: Generous height, no extra button, no upload icon, pure clean message */}
        <div className="relative z-10 pt-2">
          {/* Back card layer peeking out from behind */}
          <div className="mx-4 h-3.5 rounded-t-2xl bg-white/20 backdrop-blur-md border-t border-x border-white/25 shadow-sm" />

          {/* Front White Card with generous height & spacious layout */}
          <div className="bg-white text-slate-900 rounded-3xl p-6 sm:p-7 shadow-lg shadow-black/15 border border-slate-100 min-h-[175px] flex flex-col justify-between space-y-4">
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 leading-snug tracking-tight">
                Solve your area problems in minutes
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed mt-2 line-clamp-2">
                Snap a photo to alert local ward authorities and track resolution in real time.
              </p>
            </div>

            {/* Feature highlights filling the card space cleanly */}
            <div className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-3 text-xs font-semibold text-slate-700">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Direct Ward Action</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                <span>100% Tracked</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Problem Categories (Clean 6 Illustrated SVGs) */}
      <section className="space-y-3 px-1 pt-1">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Select Category
          </h3>
          <span className="text-[11px] text-slate-400 font-medium">
            6 Categories
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {PROBLEM_CATEGORIES.map((cat) => (
            <div
              key={cat.id}
              onClick={() => handleCategorySelect(cat.id)}
              className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 transition-all cursor-pointer flex flex-col items-center text-center group hover:bg-slate-50/70 hover:border-slate-300 active:scale-[0.98]"
            >
              <div className="mb-3 transition-transform group-hover:scale-105">
                <CategoryIllustration categoryId={cat.id} size={58} />
              </div>

              <span className="text-xs sm:text-[13px] font-bold text-slate-800 leading-snug tracking-tight">
                {cat.labelEn}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
