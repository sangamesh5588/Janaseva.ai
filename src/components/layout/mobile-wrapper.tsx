'use client';

import React, { Suspense } from 'react';
import { usePathname } from 'next/navigation';
import { Header } from './header';
import { BottomNav } from './bottom-nav';

export function MobileWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const isStaffRoute =
    pathname.startsWith('/official') ||
    pathname.startsWith('/admin') ||
    pathname === '/portal';

  // For official and admin routes, don't wrap with citizen margins or padding
  if (isStaffRoute) {
    return <div className="min-h-screen bg-slate-50 font-sans">{children}</div>;
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-neutral-900 flex flex-col font-sans">
      <Suspense fallback={<div className="h-14 bg-white border-b border-neutral-200" />}>
        <Header />
      </Suspense>
      <main className="flex-1 max-w-lg w-full mx-auto px-4 pt-3 pb-28">
        {children}
      </main>
      <Suspense fallback={null}>
        <BottomNav />
      </Suspense>
    </div>
  );
}
