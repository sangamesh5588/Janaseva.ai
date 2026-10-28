'use client';

import React, { useEffect, useState, use, Suspense } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  MapPin,
  ExternalLink,
  CheckCircle2,
  Clock,
  Camera,
  AlertCircle,
  Sparkles,
  Building,
  ZoomIn,
  X,
  ImageIcon,
} from 'lucide-react';
import { getStaffSession, StaffSession } from '@/lib/staff-auth';
import { fetchReportById, updateReportStatusByOfficial } from '@/lib/reports-store';
import { CitizenReport, ReportStatus } from '@/types/report';
import { REPORT_STATUSES } from '@/lib/constants';
import { formatDate } from '@/lib/utils';
import { getGoogleMapsLink } from '@/lib/google-maps';
import { CategoryIllustration } from '@/components/icons/category-illustrations';

function OfficialReportActionContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const unwrappedParams = use(params);
  const reportId = unwrappedParams.id;
  const router = useRouter();

  const [session, setSession] = useState<StaffSession | null>(null);
  const [report, setReport] = useState<CitizenReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [resolutionPhoto, setResolutionPhoto] = useState<File | null>(null);
  const [resolutionPhotoPreview, setResolutionPhotoPreview] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState('');
  const [selectedModalImage, setSelectedModalImage] = useState<string | null>(null);

  const loadReport = async () => {
    setLoading(true);
    const data = await fetchReportById(reportId);
    setReport(data);
    setLoading(false);
  };

  useEffect(() => {
    const active = getStaffSession();
    if (!active || active.role !== 'official') {
      router.push('/portal?tab=official');
    } else {
      setSession(active);
      loadReport();
    }
  }, [reportId]);

  const handleStatusChange = async (targetStatus: ReportStatus) => {
    if (!session || !report) return;
    setActionLoading(true);
    setActionSuccess('');

    try {
      await updateReportStatusByOfficial({
        reportIdOrTrackingId: report.tracking_id,
        status: targetStatus,
        officialEmail: session.email,
        comment: resolutionNotes.trim() || undefined,
        resolutionPhotoFile: resolutionPhoto,
      });

      setResolutionNotes('');
      setResolutionPhoto(null);
      setResolutionPhotoPreview(null);
      setActionSuccess(`Status updated to ${REPORT_STATUSES[targetStatus]?.labelEn.toLowerCase() || targetStatus}.`);
      await loadReport();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to update status.');
    } finally {
      setActionLoading(false);
    }
  };

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setResolutionPhoto(file);
      setResolutionPhotoPreview(URL.createObjectURL(file));
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center space-y-2 font-sans">
        <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-500">loading complaint...</p>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="py-12 bg-white rounded-2xl border border-slate-200/80 p-6 text-center space-y-3 font-sans max-w-lg mx-auto">
        <p className="text-sm font-semibold text-slate-800">complaint not found</p>
        <Link
          href="/official/dashboard"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-700 text-white text-xs font-medium"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>back to dashboard</span>
        </Link>
      </div>
    );
  }

  const isResolved = report.status === 'resolved';
  const isInProgress = report.status === 'in_progress' || report.status === 'under_review';

  return (
    <div className="max-w-lg mx-auto space-y-4 pb-28 font-sans">
      {/* 1. Minimal Back Link */}
      <div className="flex items-center justify-between">
        <Link
          href="/official/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-emerald-700 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>back to queue</span>
        </Link>
      </div>

      {actionSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200/80 rounded-2xl text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* 2. Flat Grievance Card (Zero nested sub-cards, clean hairline dividers) */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        {/* Top Header Row */}
        <div className="p-4 sm:p-5 flex items-center justify-between border-b border-slate-100">
          <div className="space-y-0.5">
            <span className="font-mono text-xs font-semibold text-slate-900">
              {report.tracking_id}
            </span>
            <div className="text-[11px] text-slate-400">
              {formatDate(report.created_at, 'en')}
            </div>
          </div>

          <span
            className={`text-xs px-2.5 py-1 rounded-full font-medium lowercase ${
              isResolved
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : isInProgress
                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}
          >
            {report.status.replace('_', ' ')}
          </span>
        </div>

        {/* Flat Divider Rows */}
        <div className="divide-y divide-slate-100 text-xs">
          {/* Department Row */}
          <div className="p-4 flex items-center gap-3">
            <CategoryIllustration categoryId={report.category} size={40} />
            <div>
              <div className="font-semibold text-slate-800">
                {report.assigned_department || report.category}
              </div>
              <div className="text-[11px] text-slate-500">
                assigned to your department
              </div>
            </div>
          </div>

          {/* Issue Description */}
          <div className="p-4 space-y-1">
            <span className="text-[11px] text-slate-400 font-medium">
              description
            </span>
            <p className="text-slate-800 leading-relaxed text-[13px]">
              {report.description}
            </p>
          </div>

          {/* Location Row */}
          <div className="p-4 flex items-start gap-2.5">
            <MapPin className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div className="space-y-0.5 flex-1">
              <span className="text-[11px] text-slate-400 font-medium block">
                location
              </span>
              <p className="text-slate-800 font-medium">
                {report.location}
              </p>
              {typeof report.latitude === 'number' && typeof report.longitude === 'number' && (
                <a
                  href={getGoogleMapsLink(report.latitude, report.longitude)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-medium pt-0.5 hover:underline"
                >
                  <span>open in google maps</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>

          {/* Landmark Row */}
          {report.landmark && (
            <div className="p-4 flex items-start gap-2.5">
              <Building className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
              <div>
                <span className="text-[11px] text-slate-400 font-medium block">
                  landmark
                </span>
                <p className="text-slate-700 font-medium">
                  {report.landmark}
                </p>
              </div>
            </div>
          )}

          {/* Citizen Photo Evidence (Customer Upload Image) */}
          <div className="p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-slate-500 font-medium flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5 text-emerald-600" />
                <span>citizen grievance photo (before fix)</span>
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                {report.photo_url ? 'attached' : 'none'}
              </span>
            </div>

            {report.photo_url ? (
              <div
                onClick={() => setSelectedModalImage(report.photo_url || null)}
                className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 cursor-pointer group relative max-h-80"
              >
                <img
                  src={report.photo_url}
                  alt="Citizen Evidence"
                  className="w-full max-h-80 object-cover transition-transform duration-200 group-hover:scale-101"
                />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold gap-1.5 backdrop-blur-[1px]">
                  <ZoomIn className="w-4 h-4" />
                  <span>tap to view full photo</span>
                </div>
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2 text-slate-400 text-xs">
                <ImageIcon className="w-4 h-4 text-slate-300 flex-shrink-0" />
                <span className="italic">no photo uploaded with this report by citizen</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. Official Action Section (Flat Card) */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-4 sm:p-5 space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <span className="text-xs font-semibold text-slate-900">
            take action
          </span>
          <span className="text-[11px] text-slate-400">
            officer controls
          </span>
        </div>

        {isResolved ? (
          <div className="py-2 space-y-3">
            <div className="flex items-center gap-2 text-emerald-700 text-xs font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>complaint resolved & closed</span>
            </div>
            {report.resolution_notes && (
              <p className="text-xs text-slate-600 pl-6 leading-relaxed">
                note: {report.resolution_notes}
              </p>
            )}
            {report.resolution_photo_url && (
              <div className="space-y-1.5 pt-1 pl-6">
                <span className="text-[11px] font-medium text-emerald-800 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>official resolution proof (after fix)</span>
                </span>
                <div
                  onClick={() => setSelectedModalImage(report.resolution_photo_url || null)}
                  className="rounded-2xl overflow-hidden border border-emerald-200/80 max-w-sm cursor-pointer group relative shadow-xs"
                >
                  <img
                    src={report.resolution_photo_url}
                    alt="Resolution proof"
                    className="w-full max-h-72 object-cover transition-transform group-hover:scale-101"
                  />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold gap-1.5 backdrop-blur-[1px]">
                    <ZoomIn className="w-4 h-4" />
                    <span>tap to view full photo</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-3 pt-1">
            {/* Quick status button if submitted */}
            {report.status === 'submitted' && (
              <button
                type="button"
                disabled={actionLoading}
                onClick={() => handleStatusChange('in_progress')}
                className="w-full py-2.5 px-4 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-medium flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>mark in progress</span>
              </button>
            )}

            {/* Resolution Form */}
            <div className="space-y-2 pt-1">
              <label htmlFor="completion-remarks" className="text-[11px] text-slate-500 font-medium block">
                completion remarks
              </label>
              <textarea
                id="completion-remarks"
                name="completionRemarks"
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                placeholder="e.g. road patched with asphalt; inspected by ward field team."
                rows={2}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/50 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:bg-white transition-all"
              />

              {resolutionPhotoPreview ? (
                <div className="relative w-36 h-24 rounded-xl overflow-hidden border border-emerald-200 group">
                  <img
                    src={resolutionPhotoPreview}
                    alt="Resolution preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setResolutionPhoto(null);
                      setResolutionPhotoPreview(null);
                    }}
                    className="absolute top-1 right-1 w-6 h-6 rounded-full bg-slate-900/80 hover:bg-red-600 text-white flex items-center justify-center transition-colors shadow-xs cursor-pointer"
                    title="Remove selected photo"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                  <div className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-emerald-700/90 text-white text-[9px] font-medium">
                    ready to upload
                  </div>
                </div>
              ) : (
                <label htmlFor="resolution-photo" className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium cursor-pointer transition-colors shadow-xs">
                  <Camera className="w-3.5 h-3.5 text-emerald-600" />
                  <span>upload after-fix photo (optional)</span>
                  <input
                    type="file"
                    id="resolution-photo"
                    name="resolutionPhoto"
                    aria-label="Upload after-fix photo"
                    accept="image/*"
                    onChange={handlePhotoSelect}
                    className="hidden"
                  />
                </label>
              )}

              <button
                type="button"
                disabled={actionLoading}
                onClick={() => handleStatusChange('resolved')}
                className="w-full py-2.5 px-4 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-medium flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 shadow-xs"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>mark resolved & close ticket</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 4. Timeline / History (Flat minimal list) */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-4 sm:p-5 space-y-3">
        <span className="text-xs font-semibold text-slate-900 block pb-2 border-b border-slate-100">
          timeline
        </span>

        <div className="divide-y divide-slate-100 text-xs">
          {report.history && report.history.length > 0 ? (
            report.history.map((h, i) => (
              <div key={h.id || i} className="py-2.5 first:pt-0 last:pb-0 space-y-0.5">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-slate-800 lowercase">
                    {h.status.replace('_', ' ')}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {formatDate(h.created_at, 'en')}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600">
                  {h.official_comment || 'status updated'}
                </p>
              </div>
            ))
          ) : (
            <p className="text-[11px] text-slate-400 py-1">no milestone events logged yet.</p>
          )}
        </div>
      </div>

      {/* Lightbox Zoom Modal */}
      {selectedModalImage && (
        <div
          onClick={() => setSelectedModalImage(null)}
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150 cursor-zoom-out"
        >
          <div
            className="relative max-w-2xl max-h-[90vh] w-full flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setSelectedModalImage(null)}
              className="absolute -top-10 right-0 p-1.5 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-colors cursor-pointer"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={selectedModalImage}
              alt="Full view"
              className="max-h-[85vh] w-auto max-w-full rounded-2xl object-contain shadow-2xl border border-white/10 bg-black"
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default function OfficialReportDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs font-medium text-slate-400">loading...</div>}>
      <OfficialReportActionContent params={params} />
    </Suspense>
  );
}
