import { CitizenReport, ProblemCategory, ReportStatus } from '@/types/report';
import { createClient } from './supabase/client';
import { generateTrackingId } from './utils';
import { uploadReportPhoto } from './supabase/storage';
import { routeComplaint } from './routing-engine';

const LOCAL_REPORTS_KEY = 'janaseva_reports_store';

function getLocalReports(): CitizenReport[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LOCAL_REPORTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalReports(reports: CitizenReport[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_REPORTS_KEY, JSON.stringify(reports));
  } catch {
    // quota exceeded or private mode
  }
}

export async function submitNewReport({
  citizenId,
  category,
  description,
  location,
  landmark,
  pincode,
  latitude,
  longitude,
  photoFile,
}: {
  citizenId: string;
  category: ProblemCategory;
  description: string;
  location: string;
  landmark?: string;
  pincode?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  photoFile?: File | null;
}): Promise<{ report: CitizenReport | null; error: Error | null }> {
  const trackingId = generateTrackingId();
  let photoUrl: string | null = null;

  if (photoFile) {
    try {
      photoUrl = await uploadReportPhoto(photoFile, trackingId);
    } catch (e) {
      console.warn('Photo upload fallback to preview', e);
      photoUrl = URL.createObjectURL(photoFile);
    }
  }

  // 1. Run Auto-Routing Engine based on PIN Code, Locality, and Category
  const routing = routeComplaint(category, location, pincode, latitude, longitude);

  const newReport: CitizenReport = {
    id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `rep-${Date.now()}`,
    tracking_id: trackingId,
    citizen_id: citizenId,
    category,
    description,
    location,
    landmark: landmark || null,
    pincode: routing.pincode,
    latitude: latitude || null,
    longitude: longitude || null,
    photo_url: photoUrl,
    status: 'submitted',
    assigned_official_email: routing.assignedOfficialEmail,
    assigned_department: routing.assignedDepartment,
    created_at: new Date().toISOString(),
    history: [
      {
        id: `hist-${Date.now()}`,
        report_id: trackingId,
        status: 'submitted',
        official_comment: `Grievance registered and auto-routed to ${routing.assignedDepartment} (${routing.assignedOfficialEmail}) for PIN ${routing.pincode}.`,
        official_email: routing.assignedOfficialEmail,
        created_at: new Date().toISOString(),
      },
    ],
  };

  // 2. Always save in local storage for instant feedback & demo capability
  const current = getLocalReports();
  saveLocalReports([newReport, ...current]);

  // Dispatch custom event for real-time in-app sync
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('janaseva:report_created', { detail: newReport }));
  }

  // 3. Persist to live Supabase
  try {
    const supabase = createClient();
    const isMock =
      !process.env.NEXT_PUBLIC_SUPABASE_URL ||
      process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder');

    if (!isMock) {
      const { data, error } = await supabase
        .from('reports')
        .insert({
          tracking_id: trackingId,
          citizen_id: citizenId.startsWith('mock') ? null : citizenId,
          category,
          description,
          location,
          landmark,
          pincode: routing.pincode,
          latitude: latitude || null,
          longitude: longitude || null,
          photo_url: photoUrl,
          assigned_official_email: routing.assignedOfficialEmail,
          assigned_department: routing.assignedDepartment,
          status: 'submitted',
        })
        .select()
        .single();

      if (error) {
        console.warn('Supabase DB insert error, using local fallback:', error.message);
      } else if (data) {
        // Record initial status history
        await supabase.from('report_status_history').insert({
          report_id: data.id,
          status: 'submitted',
          official_comment: `Grievance registered and auto-routed to ${routing.assignedDepartment} (${routing.assignedOfficialEmail}) for PIN ${routing.pincode}.`,
        });
        return { report: { ...newReport, id: data.id }, error: null };
      }
    }
  } catch (err: unknown) {
    console.warn('Supabase error, continuing with local store:', err);
  }

  return { report: newReport, error: null };
}

export async function fetchMyReports(citizenId: string): Promise<CitizenReport[]> {
  try {
    const supabase = createClient();
    const isMock =
      !process.env.NEXT_PUBLIC_SUPABASE_URL ||
      process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder');

    if (!isMock && citizenId && !citizenId.startsWith('mock')) {
      const { data, error } = await supabase
        .from('reports')
        .select('*, history:report_status_history(*)')
        .eq('citizen_id', citizenId)
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        return data as CitizenReport[];
      }
    }
  } catch (err) {
    console.warn('Fetch my reports error, checking local store:', err);
  }

  const local = getLocalReports();
  return local.filter((r) => !citizenId || r.citizen_id === citizenId || r.citizen_id.startsWith('mock'));
}

export async function fetchReportByTrackingId(
  trackingId: string,
  currentUserId?: string | null
): Promise<CitizenReport | null> {
  const normalized = trackingId.trim().toUpperCase();

  try {
    const supabase = createClient();
    const isMock =
      !process.env.NEXT_PUBLIC_SUPABASE_URL ||
      process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder');

    if (!isMock) {
      const { data, error } = await supabase
        .from('reports')
        .select('*, history:report_status_history(*)')
        .eq('tracking_id', normalized)
        .single();

      if (!error && data) {
        const local = getLocalReports();
        const foundLocal = local.find((r) => r.tracking_id.toUpperCase() === normalized);
        const useLocal =
          Boolean(foundLocal &&
          (!data.updated_at ||
            new Date(foundLocal.updated_at || 0).getTime() >= new Date(data.updated_at || 0).getTime()));
        const merged = useLocal ? { ...data, ...foundLocal } : data;
        const isOwner = Boolean(currentUserId && merged.citizen_id === currentUserId);
        return {
          ...merged,
          is_owner: isOwner,
        } as CitizenReport;
      }
    }
  } catch (e) {
    console.warn('Fetch by tracking id error:', e);
  }

  const local = getLocalReports();
  const found = local.find((r) => r.tracking_id.toUpperCase() === normalized);
  if (found) {
    return {
      ...found,
      is_owner: Boolean(currentUserId && (found.citizen_id === currentUserId || found.citizen_id.startsWith('mock'))),
    };
  }

  return null;
}

export async function fetchReportById(
  idOrTrackingId: string,
  currentUserId?: string | null
): Promise<CitizenReport | null> {
  const byTracking = await fetchReportByTrackingId(idOrTrackingId, currentUserId);
  if (byTracking) return byTracking;

  try {
    const supabase = createClient();
    const isMock =
      !process.env.NEXT_PUBLIC_SUPABASE_URL ||
      process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder');

    if (!isMock) {
      const { data, error } = await supabase
        .from('reports')
        .select('*, history:report_status_history(*)')
        .eq('id', idOrTrackingId)
        .single();

      if (!error && data) {
        return {
          ...data,
          is_owner: Boolean(currentUserId && data.citizen_id === currentUserId),
        } as CitizenReport;
      }
    }
  } catch (e) {
    console.warn('Fetch by ID error:', e);
  }

  const local = getLocalReports();
  const found = local.find((r) => r.id === idOrTrackingId || r.tracking_id === idOrTrackingId);
  if (found) {
    return {
      ...found,
      is_owner: Boolean(currentUserId && (found.citizen_id === currentUserId || found.citizen_id.startsWith('mock'))),
    };
  }

  return null;
}

/**
 * Official Portal: Fetch all complaints assigned to this official's email
 */
export async function fetchReportsForOfficial(officialEmail: string): Promise<CitizenReport[]> {
  const normalizedEmail = officialEmail.trim().toLowerCase();
  let dbReports: CitizenReport[] = [];

  try {
    const supabase = createClient();
    const isMock =
      !process.env.NEXT_PUBLIC_SUPABASE_URL ||
      process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder');

    if (!isMock) {
      const { data, error } = await supabase
        .from('reports')
        .select('*, history:report_status_history(*)')
        .ilike('assigned_official_email', normalizedEmail)
        .order('created_at', { ascending: false });

      if (!error && data) {
        dbReports = data as CitizenReport[];
      }
    }
  } catch (err) {
    console.warn('Official reports DB fetch error, using local fallback:', err);
  }

  // Get local reports matching this official
  const local = getLocalReports().filter(
    (r) => (r.assigned_official_email || '').toLowerCase() === normalizedEmail
  );

  // Merge and deduplicate by tracking_id/id
  if (dbReports.length > 0) {
    const dbKeys = new Set(dbReports.map((r) => r.tracking_id || r.id));
    const uniqueLocal = local.filter((r) => !dbKeys.has(r.tracking_id) && !dbKeys.has(r.id));
    return [...dbReports, ...uniqueLocal];
  }

  return local;
}

/**
 * Main Admin Portal: Fetch all city-wide complaints
 */
export async function fetchAllReportsForAdmin(): Promise<CitizenReport[]> {
  try {
    const supabase = createClient();
    const isMock =
      !process.env.NEXT_PUBLIC_SUPABASE_URL ||
      process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder');

    if (!isMock) {
      const { data, error } = await supabase
        .from('reports')
        .select('*, history:report_status_history(*)')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        return data as CitizenReport[];
      }
    }
  } catch (err) {
    console.warn('Admin reports DB fetch error, using local fallback:', err);
  }

  return getLocalReports();
}

/**
 * Official updates complaint status (e.g., In Progress, Resolved)
 */
export async function updateReportStatusByOfficial({
  reportIdOrTrackingId,
  status,
  officialEmail,
  comment,
  resolutionPhotoFile,
}: {
  reportIdOrTrackingId: string;
  status: ReportStatus;
  officialEmail: string;
  comment?: string;
  resolutionPhotoFile?: File | null;
}): Promise<{ success: boolean; error?: string }> {
  let resolutionPhotoUrl: string | null = null;

  if (resolutionPhotoFile) {
    try {
      resolutionPhotoUrl = await uploadReportPhoto(
        resolutionPhotoFile,
        `res-${Date.now()}`
      );
    } catch {
      resolutionPhotoUrl = URL.createObjectURL(resolutionPhotoFile);
    }
  }

  const now = new Date().toISOString();
  const defaultComment =
    status === 'resolved'
      ? 'Issue inspected and resolved by municipal field team.'
      : status === 'in_progress'
      ? 'Work order initiated; maintenance team deployed on-site.'
      : 'Grievance reviewed by assigned department official.';

  const officialComment = comment?.trim() || defaultComment;

  // 1. Update in local storage
  const local = getLocalReports();
  const index = local.findIndex(
    (r) => r.id === reportIdOrTrackingId || r.tracking_id === reportIdOrTrackingId
  );

  if (index !== -1) {
    const existing = local[index];
    existing.status = status;
    existing.updated_at = now;
    if (status === 'resolved') {
      existing.resolved_at = now;
      existing.resolution_notes = officialComment;
      if (resolutionPhotoUrl) existing.resolution_photo_url = resolutionPhotoUrl;
    }
    existing.history = existing.history || [];
    existing.history.unshift({
      id: `hist-${Date.now()}`,
      report_id: existing.tracking_id,
      status,
      official_comment: officialComment,
      official_email: officialEmail,
      created_at: now,
    });
    local[index] = existing;
    saveLocalReports(local);
  }

  // 2. Update Supabase
  try {
    const supabase = createClient();
    const isMock =
      !process.env.NEXT_PUBLIC_SUPABASE_URL ||
      process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder');

    if (!isMock) {
      const updatePayload: Record<string, unknown> = {
        status,
        updated_at: now,
      };

      if (status === 'resolved') {
        updatePayload.resolved_at = now;
        updatePayload.resolution_notes = officialComment;
        if (resolutionPhotoUrl) updatePayload.resolution_photo_url = resolutionPhotoUrl;
      }

      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(reportIdOrTrackingId);
      const query = supabase.from('reports').update(updatePayload);
      const { data: updatedReport, error: updateErr } = isUUID
        ? await query.eq('id', reportIdOrTrackingId).select().single()
        : await query.eq('tracking_id', reportIdOrTrackingId.trim().toUpperCase()).select().single();

      if (updateErr) {
        console.warn('Supabase update report error:', updateErr);
      }

      if (updatedReport) {
        await supabase.from('report_status_history').insert({
          report_id: updatedReport.id,
          status,
          official_comment: officialComment,
        });
      }
    }
  } catch (err: unknown) {
    console.warn('Update status Supabase error:', err);
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('janaseva:report_created'));
  }

  return { success: true };
}

/**
 * Main Admin reassigns a complaint to another official/department
 */
export async function reassignReportByAdmin({
  reportIdOrTrackingId,
  newOfficialEmail,
  newDepartmentName,
  adminReason,
}: {
  reportIdOrTrackingId: string;
  newOfficialEmail: string;
  newDepartmentName: string;
  adminReason?: string;
}): Promise<boolean> {
  const now = new Date().toISOString();
  const reason = adminReason || `Administrative reassignment to ${newOfficialEmail}`;

  // 1. Local storage update
  const local = getLocalReports();
  const index = local.findIndex(
    (r) => r.id === reportIdOrTrackingId || r.tracking_id === reportIdOrTrackingId
  );

  if (index !== -1) {
    const existing = local[index];
    existing.assigned_official_email = newOfficialEmail;
    existing.assigned_department = newDepartmentName;
    existing.updated_at = now;
    existing.history = existing.history || [];
    existing.history.unshift({
      id: `hist-${Date.now()}`,
      report_id: existing.tracking_id,
      status: existing.status,
      official_comment: reason,
      official_email: 'admin@janaseva.com',
      created_at: now,
    });
    local[index] = existing;
    saveLocalReports(local);
  }

  // 2. Supabase update
  try {
    const supabase = createClient();
    await supabase
      .from('reports')
      .update({
        assigned_official_email: newOfficialEmail,
        assigned_department: newDepartmentName,
        updated_at: now,
      })
      .or(`id.eq.${reportIdOrTrackingId},tracking_id.eq.${reportIdOrTrackingId}`);
  } catch (err) {
    console.warn('Reassign Supabase error:', err);
  }

  return true;
}
