'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { UserCheck, LogIn } from 'lucide-react';

export function Header() {
  const pathname = usePathname();
  const { user, profile } = useAuth();

  // On home page, portal, admin or official portals, hide citizen header
  if (
    pathname === '/' ||
    pathname === '/portal' ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/official')
  ) {
    return null;
  }

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 py-3 font-sans">
      <div className="max-w-lg mx-auto flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-xl bg-[#1E1B4B] text-white font-extrabold flex items-center justify-center text-xs shadow-sm">
            JS
          </div>
          <span className="font-extrabold text-base tracking-tight text-slate-900 leading-none">
            Janaseva AI
          </span>
        </Link>

        {/* User state / Sign In button */}
        <div className="flex items-center gap-2">
          {user ? (
            <Link
              href="/profile"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full bg-slate-100 text-slate-800 hover:bg-slate-200 transition-colors"
            >
              <UserCheck className="w-3.5 h-3.5 text-indigo-600" />
              <span className="max-w-[80px] truncate">
                {profile?.name || user.email?.split('@')[0]}
              </span>
            </Link>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-full bg-[#1E1B4B] text-white hover:bg-[#2E2868] shadow-sm transition-all"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
