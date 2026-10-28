'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { createClient } from './supabase/client';
import { CitizenProfile } from '@/types/user';

interface AuthContextType {
  user: User | null;
  profile: CitizenProfile | null;
  isLoading: boolean;
  signInWithGoogle: (redirectTo?: string) => Promise<{ error: Error | null }>;
  signInWithEmail: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUpWithEmail: (email: string, password: string, name: string) => Promise<{ error: Error | null; isVerificationSent?: boolean }>;
  signOut: () => Promise<void>;
  updatePreferredLanguage: (lang: 'en' | 'kn') => Promise<void>;
  isMockMode: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  isLoading: true,
  signInWithGoogle: async () => ({ error: null }),
  signInWithEmail: async () => ({ error: null }),
  signUpWithEmail: async () => ({ error: null }),
  signOut: async () => {},
  updatePreferredLanguage: async () => {},
  isMockMode: false,
});

const MOCK_STORAGE_KEY = 'janaseva_mock_user';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<CitizenProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMockMode, setIsMockMode] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    const isMock =
      !process.env.NEXT_PUBLIC_SUPABASE_URL ||
      process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder') ||
      process.env.NEXT_PUBLIC_SUPABASE_URL.includes('your-project');

    setIsMockMode(isMock);

    if (isMock) {
      // Mock session fallback for local demo
      const savedMock = localStorage.getItem(MOCK_STORAGE_KEY);
      if (savedMock) {
        try {
          const parsed = JSON.parse(savedMock);
          setUser(parsed.user);
          setProfile(parsed.profile);
        } catch {
          // invalid
        }
      }
      setIsLoading(false);
      return;
    }

    // Live Supabase session
    const getSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session?.user) {
          setUser(session.user);
          await fetchProfile(session.user.id, session.user);
        }
      } catch (e) {
        console.error('Session error', e);
      } finally {
        setIsLoading(false);
      }
    };

    getSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        setUser(session.user);
        await fetchProfile(session.user.id, session.user);
      } else {
        setUser(null);
        setProfile(null);
      }
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchProfile = async (userId: string, authUser: User) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (!error && data) {
        setProfile(data as CitizenProfile);
      } else {
        // Fallback default profile
        setProfile({
          id: userId,
          name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'Citizen',
          email: authUser.email || '',
          preferred_language: 'en',
          created_at: new Date().toISOString(),
        });
      }
    } catch {
      // default
    }
  };

  const signInWithGoogle = async (redirectTo?: string) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const callbackUrl = `${origin}/auth/callback${redirectTo ? `?redirectTo=${encodeURIComponent(redirectTo)}` : ''}`;

    if (isMockMode) {
      // Simulate instant Google Login in mock mode
      const mockUser = {
        id: 'mock-google-user-123',
        email: 'citizen.karnataka@gmail.com',
        user_metadata: { full_name: 'Anand Kumar' },
      } as unknown as User;
      const mockProfile: CitizenProfile = {
        id: 'mock-google-user-123',
        name: 'Anand Kumar',
        email: 'citizen.karnataka@gmail.com',
        preferred_language: 'kn',
        created_at: new Date().toISOString(),
      };
      setUser(mockUser);
      setProfile(mockProfile);
      localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify({ user: mockUser, profile: mockProfile }));
      return { error: null };
    }

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: callbackUrl,
        },
      });
      return { error: error ? new Error(error.message) : null };
    } catch (err: any) {
      return { error: err };
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    if (isMockMode) {
      const mockUser = {
        id: 'mock-email-user-456',
        email,
        user_metadata: { full_name: email.split('@')[0] },
      } as unknown as User;
      const mockProfile: CitizenProfile = {
        id: 'mock-email-user-456',
        name: email.split('@')[0],
        email,
        preferred_language: 'en',
        created_at: new Date().toISOString(),
      };
      setUser(mockUser);
      setProfile(mockProfile);
      localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify({ user: mockUser, profile: mockProfile }));
      return { error: null };
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error: error ? new Error(error.message) : null };
  };

  const signUpWithEmail = async (email: string, password: string, name: string) => {
    if (isMockMode) {
      const mockUser = {
        id: 'mock-email-user-456',
        email,
        user_metadata: { full_name: name },
      } as unknown as User;
      const mockProfile: CitizenProfile = {
        id: 'mock-email-user-456',
        name,
        email,
        preferred_language: 'en',
        created_at: new Date().toISOString(),
      };
      setUser(mockUser);
      setProfile(mockProfile);
      localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify({ user: mockUser, profile: mockProfile }));
      return { error: null, isVerificationSent: false };
    }

    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name },
        emailRedirectTo: `${origin}/auth/callback`,
      },
    });

    const isVerificationSent = Boolean(data?.user && !data.session);
    return { error: error ? new Error(error.message) : null, isVerificationSent };
  };

  const signOut = async () => {
    if (isMockMode) {
      localStorage.removeItem(MOCK_STORAGE_KEY);
      setUser(null);
      setProfile(null);
      return;
    }
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  const updatePreferredLanguage = async (lang: 'en' | 'kn') => {
    if (profile) {
      const updated = { ...profile, preferred_language: lang };
      setProfile(updated);
      if (isMockMode) {
        localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify({ user, profile: updated }));
      } else {
        await supabase.from('profiles').update({ preferred_language: lang }).eq('id', profile.id);
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isLoading,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        signOut,
        updatePreferredLanguage,
        isMockMode,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
