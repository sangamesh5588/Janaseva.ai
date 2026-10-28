import { ProblemCategory, ReportStatus } from '@/types/report';

export interface CategoryMetadata {
  id: ProblemCategory;
  labelEn: string;
  labelKn: string;
  color: string;
  bgColor: string;
}

export const PROBLEM_CATEGORIES: CategoryMetadata[] = [
  {
    id: 'road_damage',
    labelEn: 'Road & Pothole',
    labelKn: 'ರಸ್ತೆ ಗುಂಡಿ',
    color: '#EA580C',
    bgColor: '#FFF7ED',
  },
  {
    id: 'garbage',
    labelEn: 'Garbage Dump',
    labelKn: 'ಕಸ ತ್ಯಾಜ್ಯ',
    color: '#059669',
    bgColor: '#ECFDF5',
  },
  {
    id: 'drainage',
    labelEn: 'Drainage Overflow',
    labelKn: 'ಒಳಚರಂಡಿ',
    color: '#0284C7',
    bgColor: '#F0F9FF',
  },
  {
    id: 'water_supply',
    labelEn: 'Water Leakage',
    labelKn: 'ಕುಡಿಯುವ ನೀರು',
    color: '#2563EB',
    bgColor: '#EFF6FF',
  },
  {
    id: 'streetlight',
    labelEn: 'Streetlight Off',
    labelKn: 'ಬೀದಿ ದೀಪ',
    color: '#D97706',
    bgColor: '#FEFCE8',
  },
  {
    id: 'other',
    labelEn: 'Other Hazard',
    labelKn: 'ಇತರ ಸಮಸ್ಯೆ',
    color: '#7C3AED',
    bgColor: '#F5F3FF',
  },
];

export interface StatusMetadata {
  id: ReportStatus;
  labelEn: string;
  labelKn: string;
  color: string;
  badgeBg: string;
  badgeText: string;
}

export const REPORT_STATUSES: Record<ReportStatus, StatusMetadata> = {
  submitted: {
    id: 'submitted',
    labelEn: 'Submitted',
    labelKn: 'ದಾಖಲಾಗಿದೆ',
    color: '#2563EB',
    badgeBg: '#EFF6FF',
    badgeText: '#1D4ED8',
  },
  under_review: {
    id: 'under_review',
    labelEn: 'In Review',
    labelKn: 'ಪರಿಶೀಲನೆ',
    color: '#D97706',
    badgeBg: '#FFFBEB',
    badgeText: '#B45309',
  },
  in_progress: {
    id: 'in_progress',
    labelEn: 'In Progress',
    labelKn: 'ಪ್ರಗತಿಯಲ್ಲಿದೆ',
    color: '#0284C7',
    badgeBg: '#F0F9FF',
    badgeText: '#0369A1',
  },
  needs_information: {
    id: 'needs_information',
    labelEn: 'Need Info',
    labelKn: 'ಮಾಹಿತಿ ಬೇಕು',
    color: '#E11D48',
    badgeBg: '#FFF1F2',
    badgeText: '#BE123C',
  },
  resolved: {
    id: 'resolved',
    labelEn: 'Resolved',
    labelKn: 'ಪರಿಹರಿಸಲಾಗಿದೆ',
    color: '#059669',
    badgeBg: '#ECFDF5',
    badgeText: '#047857',
  },
};

// Samsung Wallet style 2-tab navigation
export const CITIZEN_NAV_TABS = [
  { id: 'home', labelEn: 'Home', labelKn: 'ಮುಖಪುಟ', href: '/' },
  { id: 'reports', labelEn: 'All Reports', labelKn: 'ವರದಿಗಳು', href: '/my-reports' },
];
