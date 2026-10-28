'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  LogOut,
  Bell,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { getStaffSession, clearStaffSession, StaffSession } from '@/lib/staff-auth';
import { normalizePincode, ALL_117_BENGALURU_PINCODES } from '@/lib/routing-engine';

export default function OfficialProfilePage() {
  const router = useRouter();
  const [session, setSession] = useState<StaffSession | null>(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
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

  if (!session) return null;

  const { suffix, pincode } = normalizePincode(session.pincodeSuffix || session.pincode);
  const locality = ALL_117_BENGALURU_PINCODES.find((p) => p.suffix === suffix);

  return (
    <div className="max-w-md mx-auto space-y-4 pb-8 font-sans">
      {/* Officer Header - Flat & Minimal */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold text-base shadow-xs">
            {session.departmentName ? session.departmentName.slice(0, 2).toUpperCase() : 'OF'}
          </div>

          <div>
            <h1 className="text-sm font-bold text-slate-800">
              {session.departmentName}
            </h1>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              {session.email}
            </p>
          </div>
        </div>

        <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200/60">
          Active
        </span>
      </div>

      {/* Flat Details List - Zero Nested Boxes */}
      <div className="bg-white rounded-3xl border border-slate-200/80 px-5 py-2 shadow-xs divide-y divide-slate-100 text-xs">
        <div className="py-3 flex items-center justify-between">
          <span className="text-slate-500 font-medium">Department</span>
          <span className="font-semibold text-slate-800 text-right">{session.departmentName}</span>
        </div>

        <div className="py-3 flex items-center justify-between">
          <span className="text-slate-500 font-medium">Ward PIN</span>
          <span className="font-semibold font-mono text-slate-800">{pincode}</span>
        </div>

        <div className="py-3 flex items-center justify-between">
          <span className="text-slate-500 font-medium">Ward Area</span>
          <span className="font-semibold text-slate-800 text-right">{locality?.name || `Bengaluru PIN ${pincode}`}</span>
        </div>

        <div className="py-3 flex items-center justify-between">
          <span className="text-slate-500 font-medium">Official Mailbox</span>
          <span className="font-semibold font-mono text-slate-800">{session.email}</span>
        </div>

        <div className="py-3 flex items-center justify-between">
          <span className="text-slate-500 font-medium">Jurisdiction</span>
          <span className="text-emerald-700 font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Verified Official</span>
          </span>
        </div>

        <div className="py-3 flex items-center justify-between">
          <span className="text-slate-500 font-medium">Incident Notifications</span>
          <button
            type="button"
            onClick={() => setNotificationsEnabled(!notificationsEnabled)}
            className={`w-10 h-5.5 rounded-full transition-colors relative cursor-pointer ${
              notificationsEnabled ? 'bg-emerald-600' : 'bg-slate-300'
            }`}
          >
            <div
              className={`w-4.5 h-4.5 rounded-full bg-white shadow-xs transition-transform transform ${
                notificationsEnabled ? 'translate-x-5' : 'translate-x-0.5'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Flat Minimal Sign Out */}
      <button
        type="button"
        onClick={() => setShowLogoutModal(true)}
        className="w-full py-3.5 rounded-2xl bg-red-50 hover:bg-red-100 text-red-600 border border-red-200/70 font-semibold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
      >
        <LogOut className="w-4 h-4" />
        <span>Sign Out of Department Console</span>
      </button>

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
