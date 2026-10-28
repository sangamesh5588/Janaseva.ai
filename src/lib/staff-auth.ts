import { ProblemCategory } from '@/types/report';
import { DEPARTMENT_REGISTRY, normalizePincode } from './routing-engine';
import { createClient } from './supabase/client';

export type StaffRole = 'admin' | 'official';

export interface StaffSession {
  role: StaffRole;
  email: string;
  name: string;
  departmentCode?: ProblemCategory;
  departmentName?: string;
  pincode?: string;
  pincodeSuffix?: string;
  token: string;
}

const STAFF_SESSION_KEY = 'janaseva_staff_session';

/**
 * Authenticates either Main Admin or Department Official deterministically
 */
export async function authenticateStaff(
  rawEmail: string,
  rawPassword: string
): Promise<{ success: boolean; session?: StaffSession; error?: string }> {
  const email = rawEmail.trim().toLowerCase();
  const password = rawPassword.trim();

  // 1. Check Main Admin Credentials
  if (email === 'admin@janaseva.com') {
    if (password === 'Admin@123') {
      const session: StaffSession = {
        role: 'admin',
        email: 'admin@janaseva.com',
        name: 'Chief Municipal Administrator',
        token: `admin-token-${Date.now()}`,
      };
      saveStaffSession(session);
      // Synchronize with Supabase Auth in background if registered
      try {
        const supabase = createClient();
        await supabase.auth.signInWithPassword({ email, password });
      } catch (e) {
        // Fallback to session
      }
      return { success: true, session };
    } else {
      return { success: false, error: 'Incorrect password for Main Admin account.' };
    }
  }

  // 2. Check Department Official Credentials format: dept<XXX>@<category>.com
  const officialRegex = /^dept(\d{3})@([a-z]+)\.com$/i;
  const match = email.match(officialRegex);

  if (match) {
    const suffix = match[1]; // e.g. "038" or "001"
    const domain = match[2].toLowerCase(); // e.g. "road", "water", "garbage", "light", "drainage", "other"

    // Check if domain matches any registered department
    const foundCategory = (Object.keys(DEPARTMENT_REGISTRY) as ProblemCategory[]).find(
      (cat) => DEPARTMENT_REGISTRY[cat].domain === `${domain}.com`
    );

    if (!foundCategory) {
      return {
        success: false,
        error: `Unrecognized department domain "@${domain}.com". Expected @road.com, @garbage.com, @water.com, @light.com, @drainage.com, or @other.com`,
      };
    }

    const expectedPassword = `Dept${suffix}`;
    // Accept exact password or fallback Dept001
    if (password === expectedPassword || password === 'Dept001') {
      const deptInfo = DEPARTMENT_REGISTRY[foundCategory];
      const pinObj = normalizePincode(suffix);

      const session: StaffSession = {
        role: 'official',
        email,
        name: `${deptInfo.name} Officer (PIN ${pinObj.pincode})`,
        departmentCode: foundCategory,
        departmentName: deptInfo.name,
        pincode: pinObj.pincode,
        pincodeSuffix: suffix,
        token: `official-${suffix}-${domain}-${Date.now()}`,
      };

      saveStaffSession(session);
      // Synchronize with Supabase Auth in background if registered
      try {
        const supabase = createClient();
        await supabase.auth.signInWithPassword({ email, password });
      } catch (e) {
        // Fallback to session
      }
      return { success: true, session };
    } else {
      return {
        success: false,
        error: `Invalid password for ${email}. Expected password format: Dept${suffix}`,
      };
    }
  }

  return {
    success: false,
    error: 'Invalid login format. Use admin@janaseva.com or dept<PIN_LAST_3>@<department>.com',
  };
}

export function saveStaffSession(session: StaffSession) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STAFF_SESSION_KEY, JSON.stringify(session));
    // Also set document cookie for middleware detection
    document.cookie = `janaseva_staff_role=${session.role}; path=/; max-age=604800; SameSite=Lax`;
    document.cookie = `janaseva_staff_email=${encodeURIComponent(session.email)}; path=/; max-age=604800; SameSite=Lax`;
  } catch (e) {
    console.warn('Failed to save staff session:', e);
  }
}

export function getStaffSession(): StaffSession | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STAFF_SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearStaffSession() {
  if (typeof window === 'undefined') return;
  try {
    const supabase = createClient();
    supabase.auth.signOut().catch(() => {});
  } catch {}
  try {
    localStorage.removeItem(STAFF_SESSION_KEY);
    document.cookie = 'janaseva_staff_role=; path=/; max-age=0';
    document.cookie = 'janaseva_staff_email=; path=/; max-age=0';
  } catch (e) {
    console.warn('Failed to clear staff session:', e);
  }
}
