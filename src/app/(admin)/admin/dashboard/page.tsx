'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Shield,
  BarChart3,
  Search,
  Filter,
  RefreshCw,
  MapPin,
  CheckCircle2,
  Clock,
  AlertTriangle,
  UserCheck,
  ChevronRight,
  ExternalLink,
  Edit3,
} from 'lucide-react';
import { fetchAllReportsForAdmin, reassignReportByAdmin } from '@/lib/reports-store';
import { CitizenReport, ProblemCategory, ReportStatus } from '@/types/report';
import { REPORT_STATUSES, PROBLEM_CATEGORIES } from '@/lib/constants';
import { CategoryIllustration } from '@/components/icons/category-illustrations';
import { NeoTag } from '@/components/neopop/neo-tag';
import { formatDate } from '@/lib/utils';
import { getGoogleMapsLink } from '@/lib/google-maps';

export default function AdminDashboardPage() {
  const [reports, setReports] = useState<CitizenReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPincode, setSelectedPincode] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Reassignment Modal State
  const [reassignModalReport, setReassignModalReport] = useState<CitizenReport | null>(null);
  const [newOfficialEmail, setNewOfficialEmail] = useState('');
  const [newDepartmentName, setNewDepartmentName] = useState('');
  const [reassignReason, setReassignReason] = useState('');
  const [reassignLoading, setReassignLoading] = useState(false);

  const loadAll = async () => {
    setLoading(true);
    const data = await fetchAllReportsForAdmin();
    setReports(data);
    setLoading(false);
  };

  useEffect(() => {
    loadAll();
  }, []);

  // Compute metrics
  const totalReports = reports.length;
  const resolvedReports = reports.filter((r) => r.status === 'resolved').length;
  const inProgressReports = reports.filter((r) => r.status === 'in_progress' || r.status === 'under_review').length;
  const newReports = reports.filter((r) => r.status === 'submitted').length;
  const resolutionRate = totalReports > 0 ? Math.round((resolvedReports / totalReports) * 100) : 0;

  // Distinct PIN codes present in data
  const uniquePincodes = Array.from(
    new Set(reports.map((r) => r.pincode).filter(Boolean))
  ) as string[];

  // Filtered reports
  const filtered = reports.filter((r) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTrack = r.tracking_id.toLowerCase().includes(q);
      const matchDesc = r.description.toLowerCase().includes(q);
      const matchLoc = r.location.toLowerCase().includes(q);
      const matchOfficial = (r.assigned_official_email || '').toLowerCase().includes(q);
      if (!matchTrack && !matchDesc && !matchLoc && !matchOfficial) return false;
    }

    if (selectedPincode !== 'all' && r.pincode !== selectedPincode) {
      return false;
    }

    if (selectedCategory !== 'all' && r.category !== selectedCategory) {
      return false;
    }

    if (selectedStatus !== 'all' && r.status !== selectedStatus) {
      return false;
    }

    return true;
  });

  const handleOpenReassign = (report: CitizenReport) => {
    setReassignModalReport(report);
    setNewOfficialEmail(report.assigned_official_email || '');
    setNewDepartmentName(report.assigned_department || '');
    setReassignReason('');
  };

  const handleExecuteReassign = async () => {
    if (!reassignModalReport || !newOfficialEmail.trim()) return;
    setReassignLoading(true);

    try {
      await reassignReportByAdmin({
        reportIdOrTrackingId: reassignModalReport.tracking_id,
        newOfficialEmail: newOfficialEmail.trim().toLowerCase(),
        newDepartmentName: newDepartmentName.trim() || 'Municipal Department',
        adminReason: reassignReason.trim() || undefined,
      });

      setReassignModalReport(null);
      await loadAll();
    } catch (e) {
      alert('Failed to reassign');
    } finally {
      setReassignLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white rounded-3xl border border-slate-200 p-6 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
              City-Wide Command Center
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs font-semibold text-slate-500">
              Bengaluru 117 PIN Codes
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Municipal Oversight Dashboard
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Real-time automated grievance distribution across all ward department engineers
          </p>
        </div>

        <button
          onClick={loadAll}
          disabled={loading}
          className="self-start sm:self-auto px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-2xl border border-slate-200 p-4.5 shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            Total Complaints
          </span>
          <span className="text-2xl font-extrabold text-slate-900 mt-1 block">
            {totalReports}
          </span>
          <span className="text-[10px] text-slate-400 font-medium mt-0.5 block">
            City-wide registered
          </span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4.5 shadow-xs">
          <span className="text-[11px] font-bold text-amber-600 uppercase tracking-wider block">
            New / Pending
          </span>
          <span className="text-2xl font-extrabold text-amber-600 mt-1 block">
            {newReports}
          </span>
          <span className="text-[10px] text-amber-600/80 font-medium mt-0.5 block">
            Awaiting field inspection
          </span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4.5 shadow-xs">
          <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider block">
            Work in Progress
          </span>
          <span className="text-2xl font-extrabold text-indigo-600 mt-1 block">
            {inProgressReports}
          </span>
          <span className="text-[10px] text-indigo-600/80 font-medium mt-0.5 block">
            Field maintenance active
          </span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4.5 shadow-xs">
          <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider block">
            Resolved Rate
          </span>
          <span className="text-2xl font-extrabold text-emerald-600 mt-1 block">
            {resolutionRate}%
          </span>
          <span className="text-[10px] text-emerald-600/80 font-medium mt-0.5 block">
            {resolvedReports} cases closed with proof
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Tracking ID, address, or official email (e.g. dept038@road.com)"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all pl-9"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* PIN Code Filter */}
            <select
              value={selectedPincode}
              onChange={(e) => setSelectedPincode(e.target.value)}
              className="px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
            >
              <option value="all">All PIN Codes</option>
              {uniquePincodes.map((pin) => (
                <option key={pin} value={pin}>
                  PIN {pin}
                </option>
              ))}
            </select>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
            >
              <option value="all">All Categories</option>
              {PROBLEM_CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.labelEn}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="submitted">New</option>
              <option value="under_review">Under Review</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
        </div>

        {/* Complaints Table */}
        {loading ? (
          <div className="py-12 text-center space-y-2">
            <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-bold text-slate-500">Loading complaints across city...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center text-xs font-semibold text-slate-400">
            No complaints found matching the active filters.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filtered.map((report) => {
              const statusMeta =
                REPORT_STATUSES[report.status] || REPORT_STATUSES.submitted;

              return (
                <div
                  key={report.id || report.tracking_id}
                  className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                >
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <CategoryIllustration categoryId={report.category} size={36} />

                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-extrabold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                          {report.tracking_id}
                        </span>
                        <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                          PIN {report.pincode || '560001'}
                        </span>
                        <NeoTag
                          backgroundColor={statusMeta.badgeBg}
                          color={statusMeta.color}
                        >
                          {statusMeta.labelEn}
                        </NeoTag>
                      </div>

                      <p className="text-xs text-slate-700 font-medium line-clamp-1">
                        {report.description}
                      </p>

                      <div className="flex items-center gap-3 text-[11px] text-slate-400">
                        <span className="truncate max-w-xs">{report.location}</span>
                        <span>•</span>
                        <span>{formatDate(report.created_at, 'en')}</span>
                      </div>
                    </div>
                  </div>

                  {/* Assigned Department Official & Reassign Action */}
                  <div className="flex items-center gap-3 self-end sm:self-center">
                    <div className="text-right">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        Assigned Official
                      </span>
                      <span className="font-mono text-xs font-bold text-slate-800 block">
                        {report.assigned_official_email || 'dept001@road.com'}
                      </span>
                    </div>

                    <button
                      onClick={() => handleOpenReassign(report)}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                      title="Reassign to another department or official"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Reassign</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Admin Reassignment Modal */}
      {reassignModalReport && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 max-w-md w-full space-y-4 shadow-xl">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
                Reassign Grievance
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Ticket: <span className="font-mono font-bold">{reassignModalReport.tracking_id}</span> • PIN {reassignModalReport.pincode}
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Target Official Email *
                </label>
                <input
                  type="email"
                  value={newOfficialEmail}
                  onChange={(e) => setNewOfficialEmail(e.target.value)}
                  placeholder="e.g. dept038@road.com"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Department Name
                </label>
                <input
                  type="text"
                  value={newDepartmentName}
                  onChange={(e) => setNewDepartmentName(e.target.value)}
                  placeholder="e.g. Road & Infrastructure Dept"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Admin Reassignment Reason
                </label>
                <input
                  type="text"
                  value={reassignReason}
                  onChange={(e) => setReassignReason(e.target.value)}
                  placeholder="e.g. Rerouted due to boundary jurisdiction update"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setReassignModalReport(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={reassignLoading}
                onClick={handleExecuteReassign}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold cursor-pointer disabled:opacity-50"
              >
                {reassignLoading ? 'Reassigning...' : 'Confirm Reassignment'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
