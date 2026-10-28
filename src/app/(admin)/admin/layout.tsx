'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
  Shield,
  Building2,
  LogOut,
  BarChart3,
  ListOrdered,
  FileText,
  MapPin,
} from 'lucide-react';
import { getStaffSession, clearStaffSession, StaffSession } from '@/lib/staff-auth';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [session, setSession] = useState<StaffSession | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const active = getStaffSession();
    if (!active || active.role !== 'admin') {
      router.push('/portal?tab=admin');
    } else {
      setSession(active);
    }
  }, [router]);

  const handleLogout = () => {
    clearStaffSession();
    router.push('/portal?tab=admin');
  };

  if (!mounted || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const navItems = [
    { href: '/admin/dashboard', label: 'City Dashboard', icon: BarChart3 },
    { href: '/admin/departments', label: 'PIN Code Directory', icon: MapPin },
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-16">
      {/* Admin Top Navigation */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/admin/dashboard"
              className="flex items-center gap-2 font-extrabold text-sm text-slate-900 tracking-tight"
            >
              <div className="w-8 h-8 rounded-xl bg-indigo-900 text-white flex items-center justify-center font-bold text-xs">
                JS
              </div>
              <span>JANASEVA AI ADMIN</span>
            </Link>

            <span className="text-slate-300">|</span>

            <nav className="flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors ${
                      isActive
                        ? 'bg-slate-900 text-white'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-800 text-[11px] font-bold">
              <Shield className="w-3 h-3 text-indigo-600" />
              <span>Chief Administrator</span>
            </div>

            <button
              onClick={handleLogout}
              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Logout from admin portal"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-6">{children}</main>
    </div>
  );
}
