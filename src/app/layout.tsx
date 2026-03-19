import type { Metadata } from 'next';
import { DM_Serif_Display, DM_Sans, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

const dmSerif = DM_Serif_Display({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-dm-serif',
  display: 'swap',
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
});

const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'CruiseCompare — Compare Cruise Lines, Ships & Deals 2026',
    template: '%s | CruiseCompare',
  },
  description:
    'Find your perfect cruise. Compare cruise lines, ships, destinations, and prices. No commissions — honest, unbiased comparisons for 2026.',
  keywords: 'cruise comparison, cruise deals, compare cruise lines, cheap cruises 2026, Mediterranean cruise, Caribbean cruise',
  openGraph: {
    siteName: 'CruiseCompare',
    type: 'website',
    locale: 'en_GB',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${dmSerif.variable} ${dmSans.variable} ${geistMono.variable}`}>
      <body className="antialiased font-sans" style={{ background: 'var(--background)', color: 'var(--foreground)' }}>
        <Header />
        <main className="min-h-screen">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
