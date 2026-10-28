export type SupportedLanguage = 'en' | 'kn';

export interface CitizenProfile {
  id: string;
  name: string;
  email: string;
  preferred_language: SupportedLanguage;
  created_at: string;
}
