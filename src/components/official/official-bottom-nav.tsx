'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Inbox, MapPin, User } from 'lucide-react';

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  badge?: number;
}

export function OfficialBottomNav({ pendingCount = 0 }: { pendingCount?: number }) {
  const pathname = usePathname();

  const navItems: NavItem[] = [
    {
      name: 'Queue',
      href: '/official/dashboard',
      icon: Inbox,
      badge: pendingCount > 0 ? pendingCount : undefined,
    },
    {
      name: 'Ward Map',
      href: '/official/map',
      icon: MapPin,
    },
    {
      name: 'Profile',
      href: '/official/profile',
      icon: User,
    },
  ];

  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 bg-white/95 backdrop-blur-md border-t border-slate-200/80 shadow-md pb-[env(safe-area-inset-bottom,0px)]">
      <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-around">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href === '/official/dashboard' && pathname.startsWith('/official/reports'));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center justify-center flex-1 py-1 transition-all select-none group"
            >
              <div
                className={`relative px-4 py-1 rounded-full transition-all duration-200 flex items-center justify-center ${
                  isActive
                    ? 'bg-emerald-100/80 text-emerald-800'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <Icon
                  className={`w-5 h-5 transition-transform ${
                    isActive ? 'stroke-[2.3px] scale-105' : 'stroke-[1.8px]'
                  }`}
                />
                {item.badge !== undefined && (
                  <span className="absolute -top-1 -right-1 px-1.5 py-0.2 rounded-full bg-emerald-600 text-white text-[10px] font-black leading-tight border border-white">
                    {item.badge}
                  </span>
                )}
              </div>
              <span
                className={`text-[11px] mt-0.5 tracking-tight transition-colors ${
                  isActive
                    ? 'font-bold text-emerald-800'
                    : 'font-medium text-slate-500 group-hover:text-slate-700'
                }`}
              >
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
