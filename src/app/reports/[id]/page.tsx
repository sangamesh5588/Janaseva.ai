'use client';

import React, { useEffect, useState, use, Suspense } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useI18n } from '@/lib/i18n/context';
import { fetchReportById } from '@/lib/reports-store';
import { CitizenReport } from '@/types/report';
import { REPORT_STATUSES, PROBLEM_CATEGORIES } from '@/lib/constants';
import { formatDate } from '@/lib/utils';
import { NeoTag } from '@/components/neopop/neo-tag';
import { CategoryIllustration } from '@/components/icons/category-illustrations';
import {
  Clock,
  MapPin,
  Calendar,
  Copy,
  Check,
  ArrowLeft,
  Home,
  MessageSquare,
  ShieldAlert,
  ExternalLink,
  Camera,
  ZoomIn,
  X,
} from 'lucide-react';
import { getGoogleMapsLink } from '@/lib/google-maps';

function ReportDetailContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const unwrappedParams = use(params);
  const reportId = unwrappedParams.id;

  const router = useRouter();
  const { user } = useAuth();
  const { t, language } = useI18n();

  const [report, setReport] = useState<CitizenReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [selectedModalImage, setSelectedModalImage] = useState<string | null>(null);

  const load = async () => {
    const data = await fetchReportById(reportId, user?.id);
    setReport(data);
    setLoading(false);
  };

  useEffect(() => {
    setLoading(true);
    load();

    const handleUpdate = () => load();
    window.addEventListener('janaseva:report_created', handleUpdate);
    window.addEventListener('focus', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('janaseva:report_created', handleUpdate);
      window.removeEventListener('focus', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, [reportId, user?.id]);

  const copyTrackingId = () => {
    if (report?.tracking_id) {
      navigator.clipboard.writeText(report.tracking_id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="py-12 text-center space-y-2">
        <div className="w-7 h-7 border-3 border-neutral-200 border-t-[#059669] rounded-full animate-spin mx-auto" />
        <p className="text-xs font-semibold text-neutral-500">
          {language === 'kn' ? 'ಲೋಡ್ ಆಗುತ್ತಿದೆ...' : 'Loading report...'}
        </p>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="py-12 text-center space-y-3">
        <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto text-red-500">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h2 className="text-base font-bold text-neutral-900">
          {t.invalidTrackingId}
        </h2>
        <div className="pt-1">
          <Link
            href="/track"
            className="inline-block px-4 py-2 bg-neutral-900 text-white text-xs font-bold rounded-full shadow-sm hover:bg-black"
          >
            {t.trackReport}
          </Link>
        </div>
      </div>
    );
  }

  const categoryInfo = PROBLEM_CATEGORIES.find((c) => c.id === report.category);
  const statusInfo = REPORT_STATUSES[report.status] || REPORT_STATUSES.submitted;

  const timelineSteps: Array<{ key: string; labelEn: string; labelKn: string }> = [
    { key: 'submitted', labelEn: 'Submitted', labelKn: 'ದಾಖಲಾಗಿದೆ' },
    { key: 'under_review', labelEn: 'In Review', labelKn: 'ಪರಿಶೀಲನೆ' },
    { key: 'in_progress', labelEn: 'In Progress', labelKn: 'ಪ್ರಗತಿ' },
    { key: 'resolved', labelEn: 'Resolved', labelKn: 'ಪರಿಹಾರ' },
  ];

  const getStepIndex = (st: string) => {
    switch (st) {
      case 'submitted':
        return 0;
      case 'under_review':
        return 1;
      case 'in_progress':
      case 'needs_information':
        return 2;
      case 'resolved':
        return 3;
      default:
        return 0;
    }
  };

  const currentStepIdx = getStepIndex(report.status);

  return (
    <div className="py-1 pb-12 space-y-4">
      {/* Navigation Top */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-700 hover:text-black cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <Link
          href="/"
          className="inline-flex items-center gap-1 text-xs font-semibold text-neutral-500 hover:text-black"
        >
          <Home className="w-3.5 h-3.5" />
          <span>Home</span>
        </Link>
      </div>

      {/* Confirmation & Tracking Banner */}
      <section className="bg-white rounded-2xl border border-neutral-200/90 p-4 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
            Tracking ID
          </span>
          <NeoTag
            backgroundColor={statusInfo.badgeBg}
            color={statusInfo.color}
          >
            {statusInfo.labelEn}
          </NeoTag>
        </div>

        {/* Tracking Code Display with Copy Button */}
        <div className="flex items-center justify-between bg-neutral-50 rounded-xl border border-neutral-200/80 p-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-base font-extrabold tracking-wider text-neutral-900">
              {report.tracking_id}
            </span>
            <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">
              PIN {report.pincode || '560001'}
            </span>
          </div>
          <button
            onClick={copyTrackingId}
            className="flex items-center gap-1 px-3 py-1 bg-white text-neutral-700 text-xs font-bold rounded-lg border border-neutral-200 shadow-sm active:scale-95 cursor-pointer"
            title="Copy ID"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-[#059669]" />
                <span className="text-[#059669]">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-neutral-500" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>

        {/* Assigned Official Notice */}
        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs flex items-center justify-between">
          <span className="text-slate-500 font-medium">Assigned Department:</span>
          <span className="font-bold text-slate-800 font-mono text-[11px]">
            {report.assigned_department || 'Municipal Dept'} ({report.assigned_official_email || 'dept001@road.com'})
          </span>
        </div>

        <div className="flex items-center gap-3 text-xs text-neutral-500 font-medium pt-0.5">
          <div className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            <span>{formatDate(report.created_at, language)}</span>
          </div>
        </div>
      </section>

      {/* Official Status Progress Stepper */}
      <section className="bg-white rounded-2xl border border-neutral-200/90 p-4 shadow-sm space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-500 flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-[#059669]" />
          <span>{t.statusTimeline}</span>
        </h2>

        {/* Minimal Stepper */}
        <div className="grid grid-cols-4 gap-1.5 pt-1">
          {timelineSteps.map((step, idx) => {
            const isCompleted = idx <= currentStepIdx;
            const isCurrent = idx === currentStepIdx;

            return (
              <div key={step.key} className="flex flex-col items-center text-center">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold mb-1.5 transition-all ${
                    isCompleted
                      ? 'bg-[#059669] text-white'
                      : 'bg-neutral-100 text-neutral-400'
                  }`}
                >
                  {isCompleted ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : idx + 1}
                </div>
                <span
                  className={`text-[10px] leading-tight ${
                    isCurrent
                      ? 'font-bold text-[#059669]'
                      : isCompleted
                      ? 'font-medium text-neutral-800'
                      : 'font-normal text-neutral-400'
                  }`}
                >
                  {step.labelEn}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Official Notes / History */}
      <section className="bg-white rounded-2xl border border-neutral-200/90 p-4 shadow-sm space-y-2.5">
        <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-500 flex items-center gap-1.5">
          <MessageSquare className="w-3.5 h-3.5 text-neutral-600" />
          <span>Official Notes</span>
        </h2>

        {report.history && report.history.length > 0 ? (
          <div className="space-y-2">
            {report.history.map((h, i) => (
              <div
                key={h.id || i}
                className="p-3 bg-neutral-50 rounded-xl border border-neutral-200/70 space-y-1"
              >
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-neutral-900">
                    {REPORT_STATUSES[h.status]?.labelEn || h.status}
                  </span>
                  <span className="text-neutral-400">
                    {formatDate(h.created_at, language)}
                  </span>
                </div>
                <p className="text-xs font-medium text-neutral-600">
                  {h.official_comment || 'Status milestone updated.'}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-neutral-400 font-medium">
            {t.noCommentsYet}
          </p>
        )}
      </section>

      {/* Issue Details & Photo */}
      <section className="bg-white rounded-2xl border border-neutral-200/90 p-4 shadow-sm space-y-3">
        <div className="flex items-center gap-2.5">
          <CategoryIllustration categoryId={report.category} size={36} />
          <div>
            <h2 className="text-sm font-bold text-neutral-900 leading-tight">
              {categoryInfo?.labelEn}
            </h2>
            <div className="flex items-center gap-1 text-[11px] text-neutral-500 mt-0.5">
              <MapPin className="w-3.5 h-3.5 text-neutral-400 flex-shrink-0" />
              <span>{report.location}</span>
            </div>
          </div>
        </div>

        <p className="text-xs font-medium text-neutral-700 leading-relaxed bg-neutral-50 p-3 rounded-xl border border-neutral-100">
          {report.description}
        </p>

        {/* GPS Coordinates & Google Maps Link if available */}
        {typeof report.latitude === 'number' && typeof report.longitude === 'number' && (
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700">
            <div className="flex items-center gap-1.5 text-emerald-700">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>
                GPS: {report.latitude.toFixed(5)}°, {report.longitude.toFixed(5)}°
              </span>
            </div>
            <a
              href={getGoogleMapsLink(report.latitude, report.longitude)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-800"
            >
              <span>Google Maps</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        )}

        {/* Before Fix (Citizen Photo) */}
        {report.photo_url && (
          <div className="space-y-1.5 pt-1">
            <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider flex items-center gap-1.5">
              <Camera className="w-3.5 h-3.5 text-emerald-600" />
              <span>Grievance Photo (Before Fix)</span>
            </span>
            <div
              onClick={() => setSelectedModalImage(report.photo_url || null)}
              className="rounded-xl overflow-hidden border border-neutral-200 cursor-pointer group relative bg-neutral-100"
            >
              <div className="relative h-56 w-full">
                <img
                  src={report.photo_url}
                  alt="Citizen report evidence"
                  className="w-full h-full object-cover transition-transform group-hover:scale-101"
                />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold gap-1.5 backdrop-blur-[1px]">
                  <ZoomIn className="w-4 h-4" />
                  <span>Tap to view full photo</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Official Resolution Card if status is resolved */}
        {report.status === 'resolved' && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 space-y-2.5">
            <div className="flex items-center gap-2 font-bold text-emerald-900 text-xs">
              <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />
              <span>Resolved by Municipal Field Team</span>
            </div>
            {report.resolution_notes && (
              <p className="text-xs text-emerald-800 font-medium leading-relaxed">
                {report.resolution_notes}
              </p>
            )}
            {report.resolution_photo_url && (
              <div className="space-y-1.5 pt-1">
                <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Resolution Proof (After Fix)</span>
                </span>
                <div
                  onClick={() => setSelectedModalImage(report.resolution_photo_url || null)}
                  className="rounded-xl overflow-hidden border border-emerald-200 cursor-pointer group relative bg-white max-w-sm"
                >
                  <img
                    src={report.resolution_photo_url}
                    alt="Resolution proof"
                    className="w-full max-h-56 object-cover transition-transform group-hover:scale-101"
                  />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold gap-1.5 backdrop-blur-[1px]">
                    <ZoomIn className="w-4 h-4" />
                    <span>Tap to view full photo</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Action Buttons: Home & My Reports */}
      <div className="flex gap-2.5 pt-1">
        <Link
          href="/"
          className="flex-1 py-3 px-3 rounded-xl bg-white text-neutral-800 font-bold text-xs border border-neutral-200 shadow-sm text-center hover:bg-neutral-50"
        >
          {t.returnHome}
        </Link>
        <Link
          href="/my-reports"
          className="flex-1 py-3 px-3 rounded-xl bg-[#059669] text-white font-bold text-xs shadow-sm text-center hover:bg-[#047857]"
        >
          {t.myReportsTitle}
        </Link>
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

export default function ReportDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs font-semibold text-neutral-500">Loading...</div>}>
      <ReportDetailContent params={params} />
    </Suspense>
  );
}
