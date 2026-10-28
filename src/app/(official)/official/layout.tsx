'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { getStaffSession, clearStaffSession, StaffSession } from '@/lib/staff-auth';
import { OfficialBottomNav } from '@/components/official/official-bottom-nav';

export default function OfficialLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [session, setSession] = useState<StaffSession | null>(null);
  const [mounted, setMounted] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const isDashboard = pathname === '/official/dashboard';
  const isMap = pathname === '/official/map';
  const isFullBleed = isDashboard || isMap;

  useEffect(() => {
    setMounted(true);
    const active = getStaffSession();
    if (!active || active.role !== 'official') {
      router.push('/portal?tab=official');
    } else {
      setSession(active);
    }
  }, [router]);

  const handleLogout = () => {
    clearStaffSession();
    router.push('/portal?tab=official');
  };

  if (!mounted || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20">
      {/* Top Header for non-fullbleed pages */}
      {!isFullBleed && (
        <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
          <div className="max-w-md sm:max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
            {/* Left: Clean Brand Logo */}
            <Link
              href="/official/dashboard"
              className="flex items-center gap-2 font-black text-sm text-slate-900 tracking-tight"
            >
              <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-black text-xs shadow-xs">
                JS
              </div>
              <span className="font-extrabold tracking-tight">JANASEVA</span>
            </Link>

            {/* Right: Clean PIN Badge & Logout Icon */}
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-semibold font-mono">
                PIN {session.pincode}
              </span>

              {/* Logout icon with confirmation */}
              <button
                type="button"
                onClick={() => setShowLogoutModal(true)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-red-50 hover:text-red-600 text-slate-600 flex items-center justify-center transition-colors border border-slate-200/80 cursor-pointer"
                title="Logout"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </header>
      )}

      {/* Main Container - Full-bleed for dashboard and map so all edges touch */}
      <main className={isFullBleed ? 'w-full' : 'max-w-md sm:max-w-4xl mx-auto px-4 py-4 sm:py-6'}>
        {children}
      </main>

      {/* Mobile App Bottom Navigation Dock */}
      <OfficialBottomNav />

      {/* Logout Confirmation Popup Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-xs bg-white rounded-3xl p-5 shadow-2xl border border-slate-100 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="space-y-1.5 text-center">
              <div className="w-10 h-10 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-1">
                <LogOut className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Sign Out</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Are you sure you want to log out of your department console?
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowLogoutModal(false)}
                className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="py-2.5 px-3 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold transition-colors cursor-pointer shadow-xs"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
