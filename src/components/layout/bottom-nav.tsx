'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, LayoutGrid, Camera } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();

  if (
    pathname === '/login' ||
    pathname === '/signup' ||
    pathname === '/portal' ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/official') ||
    pathname === '/report' ||
    pathname.startsWith('/report')
  ) {
    return null;
  }

  const isHomeActive = pathname === '/';
  const isReportsActive = pathname.startsWith('/my-reports') || pathname.startsWith('/track');

  const handleUploadClick = (e: React.MouseEvent) => {
    if (!user) {
      e.preventDefault();
      router.push('/login?redirectTo=/report');
    } else {
      router.push('/report');
    }
  };

  const handleReportsClick = (e: React.MouseEvent) => {
    if (!user) {
      e.preventDefault();
      router.push('/login?redirectTo=/my-reports');
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none pb-safe">
      <div className="max-w-lg mx-auto relative px-4 pb-4 pt-2">
        {/* Floating Upload / Camera Button on bottom right */}
        <div className="absolute right-5 -top-14 pointer-events-auto">
          <button
            onClick={handleUploadClick}
            className="w-14 h-14 rounded-full bg-[#18181B] hover:bg-black text-white shadow-xl flex items-center justify-center active:scale-95 transition-all group border-2 border-white ring-4 ring-black/5 cursor-pointer"
            title="Report Problem"
          >
            <div className="relative flex items-center justify-center">
              <Camera className="w-6 h-6 text-white stroke-[2.2] group-hover:scale-110 transition-transform" />
              <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#6366F1] ring-2 ring-[#18181B]" />
            </div>
          </button>
        </div>

        {/* 2-Option Pill Dock: Home (with HOME icon) & My Reports */}
        <div className="flex justify-center pointer-events-auto">
          <div className="bg-[#E4E4E7]/90 backdrop-blur-lg p-1 rounded-full shadow-lg border border-neutral-300/60 flex items-center gap-1">
            {/* Tab 1: Home with real Home Icon */}
            <Link
              href="/"
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold transition-all ${
                isHomeActive
                  ? 'bg-white text-neutral-950 shadow-sm'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <Home className="w-4 h-4 stroke-[2.2]" />
              <span>Home</span>
            </Link>

            {/* Tab 2: My Reports */}
            <Link
              href="/my-reports"
              onClick={handleReportsClick}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold transition-all ${
                isReportsActive
                  ? 'bg-white text-neutral-950 shadow-sm'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <LayoutGrid className="w-4 h-4 stroke-[2.2]" />
              <span>My Reports</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
