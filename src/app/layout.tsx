import type { Metadata, Viewport } from 'next';
import './globals.css';
import { I18nProvider } from '@/i18n';

export const metadata: Metadata = {
  title: 'SkyRoute Finder — Cheapest Flights',
  description: 'Find the cheapest flights and hotels. Search across trusted airlines in seconds.',
  keywords: ['flights', 'cheap flights', 'hotel', 'travel', 'booking'],
  manifest: '/manifest.json',
  icons: {
    icon: '/icons/airplane-icon.svg',
    apple: '/icons/airplane-icon.svg',
  },
};

export const viewport: Viewport = {
  themeColor: '#0ea5e9',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        {/* PWA */}
        <meta name="application-name" content="SkyRoute Finder" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="SkyRoute" />
        <meta name="mobile-web-app-capable" content="yes" />
        <link rel="apple-touch-icon" href="/icons/airplane-icon.svg" />
      </head>
      <body>
        <I18nProvider>{children}</I18nProvider>
      </body>
    </html>
  );
}
