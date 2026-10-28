'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { SupportedLanguage } from '@/types/user';
import { DICTIONARY } from './dictionaries';

interface I18nContextType {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  t: (typeof DICTIONARY)['en'];
}

const I18nContext = createContext<I18nContextType>({
  language: 'en',
  setLanguage: () => {},
  t: DICTIONARY.en,
});

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<SupportedLanguage>('en');

  useEffect(() => {
    const saved = localStorage.getItem('janaseva_lang') as SupportedLanguage;
    if (saved === 'en' || saved === 'kn') {
      setLanguageState(saved);
    }
  }, []);

  const setLanguage = (lang: SupportedLanguage) => {
    setLanguageState(lang);
    localStorage.setItem('janaseva_lang', lang);
  };

  const t = DICTIONARY[language];

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}
