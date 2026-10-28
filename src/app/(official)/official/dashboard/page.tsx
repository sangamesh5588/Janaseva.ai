'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Inbox,
  RefreshCw,
  LogOut,
  MapPin,
  ChevronRight,
  CheckCircle2,
} from 'lucide-react';
import { getStaffSession, clearStaffSession, StaffSession } from '@/lib/staff-auth';
import { fetchReportsForOfficial } from '@/lib/reports-store';
import { CitizenReport, ReportStatus } from '@/types/report';
import { NeoTag } from '@/components/neopop/neo-tag';
import { REPORT_STATUSES } from '@/lib/constants';
import { formatDate } from '@/lib/utils';
import { useRouter } from 'next/navigation';

export default function OfficialDashboardPage() {
  const router = useRouter();
  const [session, setSession] = useState<StaffSession | null>(null);
  const [reports, setReports] = useState<CitizenReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | ReportStatus>('all');
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const loadData = async (email: string) => {
    setLoading(true);
    const data = await fetchReportsForOfficial(email);
    setReports(data);
    setLoading(false);
  };

  useEffect(() => {
    const active = getStaffSession();
    if (!active) return;

    setSession(active);
    loadData(active.email);

    const handleRefresh = () => {
      loadData(active.email);
    };

    // Auto-refresh when citizen submits in another tab, in this tab, or when switching back
    window.addEventListener('storage', handleRefresh);
    window.addEventListener('focus', handleRefresh);
    window.addEventListener('janaseva:report_created', handleRefresh);

    return () => {
      window.removeEventListener('storage', handleRefresh);
      window.removeEventListener('focus', handleRefresh);
      window.removeEventListener('janaseva:report_created', handleRefresh);
    };
  }, []);

  const handleLogout = () => {
    clearStaffSession();
    router.push('/portal?tab=official');
  };

  if (!session) return null;

  const totalAssigned = reports.length;
  const inProgressCount = reports.filter((r) => r.status === 'in_progress' || r.status === 'under_review').length;
  const resolvedCount = reports.filter((r) => r.status === 'resolved').length;
  const newCount = reports.filter((r) => r.status === 'submitted').length;

  const filteredReports =
    statusFilter === 'all'
      ? reports
      : reports.filter((r) => r.status === statusFilter);

  return (
    <div className="space-y-4 pb-6 font-sans">
      {/* 1. Full-Bleed Edge-to-Edge Curved Green Hero (All edges touch, no gap/padding) */}
      <section className="w-full bg-gradient-to-b from-[#064E3B] via-[#047857] to-[#059669] text-white pt-5 px-4 pb-7 rounded-b-[36px] sm:rounded-b-[40px] shadow-lg relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-emerald-300/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-md sm:max-w-4xl mx-auto">
          {/* Top Bar inside Green Hero */}
          <div className="flex items-center justify-between mb-5 relative z-10">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-white/20 backdrop-blur-xs flex items-center justify-center text-white font-black text-xs border border-white/20">
                JS
              </div>
              <span className="font-extrabold text-sm tracking-wider uppercase text-white">
                JANASEVA AI
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full bg-white/15 backdrop-blur-xs border border-white/20 text-emerald-100 text-xs font-semibold font-mono">
                PIN {session.pincode}
              </span>

              <button
                type="button"
                onClick={() => setShowLogoutModal(true)}
                className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center border border-white/20 transition-colors cursor-pointer"
                title="Logout"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Hero Greeting */}
          <div className="mb-4 space-y-0.5 relative z-10">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Hello, Officer
            </h1>
            <p className="text-xs text-emerald-100 font-medium">
              Ward {session.pincode} • Municipal Operations
            </p>
          </div>

          {/* Floating White Summary Card (Minimal, Non-Nested) */}
          <div className="bg-white rounded-3xl p-4 text-slate-800 shadow-xl border border-slate-100/80 relative z-10 space-y-3">
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
              <div>
                <h2 className="text-sm font-bold text-slate-800 tracking-tight">
                  {session.departmentName}
                </h2>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  {session.email}
                </p>
              </div>

              <button
                onClick={() => loadData(session.email)}
                disabled={loading}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Refresh"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {/* Minimal 4-Metric Grid */}
            <div className="grid grid-cols-4 gap-2 text-center pt-0.5">
              <div className="p-2 rounded-2xl bg-slate-50 border border-slate-100/70">
                <span className="text-[11px] font-medium text-slate-500 block">Total</span>
                <span className="text-base font-bold text-slate-800 block mt-0.5">{totalAssigned}</span>
              </div>

              <div className="p-2 rounded-2xl bg-amber-50/60 border border-amber-100/80">
                <span className="text-[11px] font-medium text-amber-700 block">New</span>
                <span className="text-base font-bold text-amber-600 block mt-0.5">{newCount}</span>
              </div>

              <div className="p-2 rounded-2xl bg-indigo-50/60 border border-indigo-100/80">
                <span className="text-[11px] font-medium text-indigo-700 block">Active</span>
                <span className="text-base font-bold text-indigo-600 block mt-0.5">{inProgressCount}</span>
              </div>

              <div className="p-2 rounded-2xl bg-emerald-50/60 border border-emerald-100/80">
                <span className="text-[11px] font-medium text-emerald-700 block">Resolved</span>
                <span className="text-base font-bold text-emerald-600 block mt-0.5">{resolvedCount}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Complaints Section */}
      <div className="max-w-md sm:max-w-4xl mx-auto px-4 space-y-3">
        {/* Simple Heading */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Inbox className="w-4 h-4 text-slate-500" />
            <h2 className="text-sm font-bold text-slate-800">
              Complaints
            </h2>
          </div>

          <span className="text-xs font-medium text-slate-400">
            {filteredReports.length} {filteredReports.length === 1 ? 'item' : 'items'}
          </span>
        </div>

        {/* Filter Chips on their own row below heading */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5 -mx-1 px-1">
          {(
            [
              { id: 'all', label: 'All' },
              { id: 'submitted', label: 'New' },
              { id: 'in_progress', label: 'In progress' },
              { id: 'resolved', label: 'Resolved' },
            ] as const
          ).map((tab) => {
            const isSelected = statusFilter === tab.id;
            const count =
              tab.id === 'all'
                ? totalAssigned
                : tab.id === 'submitted'
                ? newCount
                : tab.id === 'in_progress'
                ? inProgressCount
                : resolvedCount;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 flex-shrink-0 select-none ${
                  isSelected
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200/80'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
                    isSelected
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Complaints List */}
        {loading ? (
          <div className="py-12 text-center space-y-2 bg-white rounded-2xl border border-slate-200/80">
            <div className="w-7 h-7 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-slate-400 font-medium">Loading complaints...</p>
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="py-10 bg-white rounded-2xl border border-slate-200/80 p-6 text-center space-y-2">
            <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center mx-auto text-slate-400">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-xs font-semibold text-slate-700">
                {statusFilter === 'all'
                  ? 'No complaints yet'
                  : `No complaints under ${statusFilter}`}
              </h3>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                Reports submitted for PIN {session.pincode} will appear here.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredReports.map((report) => {
              const statusMeta =
                REPORT_STATUSES[report.status] || REPORT_STATUSES.submitted;

              return (
                <div
                  key={report.id || report.tracking_id}
                  className="bg-white rounded-2xl border border-slate-200 p-4 hover:border-slate-300 transition-all space-y-3 shadow-xs"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                        {report.tracking_id}
                      </span>
                    </div>

                    <NeoTag
                      backgroundColor={statusMeta.badgeBg}
                      color={statusMeta.color}
                    >
                      {statusMeta.labelEn}
                    </NeoTag>
                  </div>

                  <div className="flex items-start gap-3">
                    {report.photo_url && (
                      <div className="w-16 h-16 rounded-xl overflow-hidden border border-slate-200 flex-shrink-0 bg-slate-100 relative">
                        <img
                          src={report.photo_url}
                          alt="Citizen Proof"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    <div className="flex-1 min-w-0 space-y-1">
                      <p className="text-xs font-bold text-slate-900 line-clamp-2">
                        {report.description}
                      </p>
                      <p className="text-[11px] text-slate-500 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span className="truncate">{report.location || report.landmark || `Ward ${session.pincode}`}</span>
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400 font-medium">
                      {formatDate(report.created_at)}
                    </span>

                    <Link
                      href={`/official/reports/${report.id}`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors"
                    >
                      <span>Take Action</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

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
