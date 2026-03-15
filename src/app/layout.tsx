import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CruiseCompare — Compare Cruise Lines, Ships & Deals 2026",
  description: "Find your perfect cruise. Compare cruise lines, ships, destinations, and prices. Expert reviews and unbiased comparisons for 2026.",
  keywords: "cruise comparison, cruise deals, cruise reviews, best cruise lines 2026",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <header className="border-b">
          <div className="container mx-auto px-4 py-4">
            <nav className="flex items-center justify-between">
              <a href="/" className="text-xl font-bold">CruiseCompare</a>
              <ul className="flex gap-6">
                <li><a href="/destinations/">Destinations</a></li>
                <li><a href="/ships/">Ships</a></li>
                <li><a href="/compare/">Compare</a></li>
                <li><a href="/guides/">Guides</a></li>
              </ul>
            </nav>
          </div>
        </header>
        <main className="container mx-auto px-4 py-8 min-h-screen">
          {children}
        </main>
        <footer className="border-t mt-16">
          <div className="container mx-auto px-4 py-8">
            <p className="text-center text-gray-600">© 2026 CruiseCompare. All rights reserved.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
