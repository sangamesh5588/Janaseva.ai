import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import './globals.css';
import StyledComponentsRegistry from '@/components/neopop/registry';
import { I18nProvider } from '@/lib/i18n/context';
import { AuthProvider } from '@/lib/auth-context';
import { MobileWrapper } from '@/components/layout/mobile-wrapper';

export const metadata: Metadata = {
  title: 'Janaseva AI — Civic Grievance Reporting',
  description: 'Report civic issues directly to municipal authorities with real-time status tracking.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className="min-h-full flex flex-col bg-[#F8FAFC] text-slate-900 selection:bg-indigo-600 selection:text-white"
        style={{
          fontFamily:
            "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
        }}
      >
        <StyledComponentsRegistry>
          <I18nProvider>
            <AuthProvider>
              <Suspense fallback={null}>
                <MobileWrapper>{children}</MobileWrapper>
              </Suspense>
            </AuthProvider>
          </I18nProvider>
        </StyledComponentsRegistry>
      </body>
    </html>
  );
}
