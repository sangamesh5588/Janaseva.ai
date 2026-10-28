export type ProblemCategory =
  | 'road_damage'
  | 'garbage'
  | 'drainage'
  | 'water_supply'
  | 'streetlight'
  | 'other';

export type ReportStatus =
  | 'submitted'
  | 'under_review'
  | 'in_progress'
  | 'needs_information'
  | 'resolved';

export type UserRole = 'citizen' | 'official' | 'admin';

export interface ReportStatusHistoryItem {
  id: string;
  report_id: string;
  status: ReportStatus;
  official_comment?: string | null;
  official_email?: string | null;
  created_at: string;
}

export interface CitizenReport {
  id: string;
  tracking_id: string;
  citizen_id: string;
  category: ProblemCategory;
  description: string;
  location: string;
  landmark?: string | null;
  pincode?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  photo_url?: string | null;
  status: ReportStatus;
  assigned_official_email?: string | null;
  assigned_department?: string | null;
  resolution_notes?: string | null;
  resolution_photo_url?: string | null;
  resolved_at?: string | null;
  created_at: string;
  updated_at?: string;
  history?: ReportStatusHistoryItem[];
  is_owner?: boolean;
}

export interface OfficialProfile {
  id: string;
  email: string;
  department_code: ProblemCategory;
  pincode: string;
  pincode_suffix: string;
  full_name: string;
  role: 'official' | 'admin';
}
