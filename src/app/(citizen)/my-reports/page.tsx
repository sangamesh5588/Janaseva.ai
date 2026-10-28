'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useI18n } from '@/lib/i18n/context';
import { fetchMyReports } from '@/lib/reports-store';
import { CitizenReport, ReportStatus } from '@/types/report';
import { REPORT_STATUSES, PROBLEM_CATEGORIES } from '@/lib/constants';
import { formatDate } from '@/lib/utils';
import { NeoTag } from '@/components/neopop/neo-tag';
import { CategoryIllustration } from '@/components/icons/category-illustrations';
import {
  FileText,
  Plus,
  MapPin,
  ChevronRight,
  Search,
} from 'lucide-react';

type FilterType = 'all' | ReportStatus;

export default function MyReportsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { t, language } = useI18n();

  const [reports, setReports] = useState<CitizenReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function load() {
      setLoading(true);
      const data = await fetchMyReports(user?.id || 'mock-citizen-id');
      setReports(data);
      setLoading(false);
    }
    load();
  }, [user?.id]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = searchQuery.trim().toUpperCase();
    if (clean.startsWith('JAN-')) {
      router.push(`/reports/${clean}`);
    }
  };

  const filterTabs: Array<{ id: FilterType; labelEn: string; labelKn: string }> = [
    { id: 'all', labelEn: 'All', labelKn: 'ಎಲ್ಲವೂ' },
    { id: 'submitted', labelEn: 'Submitted', labelKn: 'ದಾಖಲಾಗಿದೆ' },
    { id: 'under_review', labelEn: 'In Review', labelKn: 'ಪರಿಶೀಲನೆ' },
    { id: 'in_progress', labelEn: 'In Progress', labelKn: 'ಪ್ರಗತಿ' },
    { id: 'resolved', labelEn: 'Resolved', labelKn: 'ಪರಿಹಾರ' },
  ];

  const filteredReports = reports.filter((r) => {
    const matchesFilter = filter === 'all' || r.status === filter;
    const matchesSearch =
      !searchQuery.trim() ||
      r.tracking_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.location.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  return (
    <div className="py-1 pb-20 space-y-3.5">
      {/* 1. Search Bar at Top of All Access / Reports */}
      <form onSubmit={handleSearchSubmit} className="relative flex items-center">
        <div className="absolute left-3.5 flex items-center pointer-events-none text-neutral-400">
          <Search className="w-4 h-4" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search tracking ID (e.g. JAN-2026-X8K2)..."
          className="w-full bg-white rounded-full border border-neutral-200 py-2.5 pl-10 pr-4 shadow-sm focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 focus:outline-none text-xs font-medium placeholder:text-neutral-400"
        />
      </form>

      {/* Page Header */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight text-neutral-900">
            All Reports
          </h1>
          <p className="text-[11px] font-medium text-neutral-500">
            Track submitted issues & updates
          </p>
        </div>

        <Link
          href="/report"
          className="flex items-center gap-1 px-3 py-1.5 bg-[#1E1B4B] hover:bg-[#2A2663] text-white text-xs font-bold rounded-full shadow-sm active:scale-95 transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New</span>
        </Link>
      </div>

      {/* Status Filter Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {filterTabs.map((tab) => {
          const isSelected = filter === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                isSelected
                  ? 'bg-[#1E1B4B] text-white shadow-sm'
                  : 'bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-50'
              }`}
            >
              {tab.labelEn}
            </button>
          );
        })}
      </div>

      {/* Reports List */}
      {loading ? (
        <div className="py-12 text-center space-y-2">
          <div className="w-7 h-7 border-3 border-neutral-200 border-t-[#065F46] rounded-full animate-spin mx-auto" />
          <p className="text-xs font-semibold text-neutral-500">
            {language === 'kn' ? 'ಲೋಡ್ ಆಗುತ್ತಿದೆ...' : 'Loading reports...'}
          </p>
        </div>
      ) : filteredReports.length === 0 ? (
        <div className="py-12 bg-white rounded-2xl border border-neutral-200/80 p-6 text-center space-y-3 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center mx-auto text-neutral-400">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-neutral-900">
              {filter === 'all'
                ? t.noReportsYet
                : language === 'kn'
                ? 'ಯಾವುದೇ ವರದಿಗಳಿಲ್ಲ'
                : 'No reports found'}
            </h3>
            <p className="text-xs text-neutral-400 font-medium mt-0.5">
              {language === 'kn'
                ? 'ಸಮಸ್ಯೆ ವರದಿ ಮಾಡಲು ಕೆಳಗಿನ ಬಟನ್ ಒತ್ತಿ'
                : 'Tap below to report an issue'}
            </p>
          </div>
          <div>
            <Link
              href="/report"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#065F46] text-white text-xs font-bold rounded-full shadow-sm hover:bg-[#054d38]"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{t.reportProblem}</span>
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredReports.map((report) => {
            const cat = PROBLEM_CATEGORIES.find((c) => c.id === report.category);
            const statusMeta = REPORT_STATUSES[report.status] || REPORT_STATUSES.submitted;

            return (
              <div
                key={report.id || report.tracking_id}
                onClick={() => router.push(`/reports/${report.tracking_id}`)}
                className="bg-white rounded-2xl border border-neutral-200/90 p-4 shadow-sm hover:border-neutral-300 active:scale-[0.99] transition-all cursor-pointer group"
              >
                {/* Header: Tracking ID & Status */}
                <div className="flex items-center justify-between pb-2.5 border-b border-neutral-100">
                  <span className="font-mono text-xs font-bold text-neutral-700 bg-neutral-100 px-2 py-0.5 rounded-md">
                    {report.tracking_id}
                  </span>
                  <NeoTag
                    backgroundColor={statusMeta.badgeBg}
                    color={statusMeta.color}
                  >
                    {statusMeta.labelEn}
                  </NeoTag>
                </div>

                {/* Body: Illustration & Category & Description */}
                <div className="py-3 flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <CategoryIllustration categoryId={report.category} size={42} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-bold text-neutral-900 block leading-tight">
                      {cat?.labelEn}
                    </span>
                    <p className="text-xs text-neutral-500 font-medium line-clamp-2 mt-1">
                      {report.description}
                    </p>
                  </div>
                </div>

                {/* Footer: Location & Date & Arrow */}
                <div className="flex items-center justify-between text-[11px] text-neutral-400 pt-2 border-t border-neutral-100">
                  <div className="flex items-center gap-1 truncate max-w-[200px]">
                    <MapPin className="w-3.5 h-3.5 text-neutral-500 flex-shrink-0" />
                    <span className="truncate text-neutral-600 font-medium">{report.location}</span>
                  </div>
                  <div className="flex items-center gap-1 font-semibold text-neutral-700 group-hover:text-[#065F46]">
                    <span>{formatDate(report.created_at, language).split(',')[0]}</span>
                    <ChevronRight className="w-4 h-4 text-neutral-400 group-hover:text-[#065F46]" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
