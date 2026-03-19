'use client';

import { useState } from 'react';

const navLinks = [
  { href: '/deals/', label: 'Deals', highlight: true },
  { href: '/cruises/', label: 'Cruises', highlight: false },
  { href: '/compare/', label: 'Compare', highlight: false },
  { href: '/ships/', label: 'Ships', highlight: false },
  { href: '/destinations/', label: 'Destinations', highlight: false },
  { href: '/guides/', label: 'Guides', highlight: false },
];

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-white/10"
      style={{ background: 'rgba(10, 27, 61, 0.97)', backdropFilter: 'blur(12px)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex items-center justify-between h-16">

          {/* Logo */}
          <a href="/" className="flex items-center gap-2 group">
            {/* Wave icon SVG */}
            <svg width="28" height="20" viewBox="0 0 28 20" fill="none" aria-hidden="true">
              <path
                d="M2 14 C5 8, 9 4, 14 7 C19 10, 23 6, 26 2"
                stroke="#5DADE2" strokeWidth="2.5" strokeLinecap="round" fill="none"
              />
              <path
                d="M2 19 C5 13, 9 9, 14 12 C19 15, 23 11, 26 7"
                stroke="#1B6FA8" strokeWidth="2" strokeLinecap="round" fill="none"
              />
            </svg>
            <span
              className="text-xl font-bold tracking-tight text-white group-hover:text-ocean transition-colors"
              style={{ fontFamily: 'var(--font-dm-serif, serif)' }}
            >
              CruiseCompare
            </span>
          </a>

          {/* Desktop nav */}
          <ul className="hidden md:flex items-center gap-1">
            {navLinks.map((link) =>
              link.highlight ? (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold transition-colors"
                    style={{ background: '#e8593c', color: '#fff' }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = '#cf4a2d'; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = '#e8593c'; }}
                  >
                    {link.label}
                    <span className="text-xs bg-white/20 px-1 rounded font-bold">New</span>
                  </a>
                </li>
              ) : (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="px-3 py-2 text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              )
            )}
          </ul>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={() => setOpen(!open)}
          >
            {open ? (
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                <path d="M4 4L18 18M18 4L4 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            ) : (
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                <path d="M3 6h16M3 11h16M3 16h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            )}
          </button>
        </nav>

        {/* Mobile menu */}
        {open && (
          <div className="md:hidden border-t border-white/10 py-3 space-y-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={`block px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  link.highlight
                    ? 'text-coral font-semibold'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                {link.label}
                {link.highlight && <span className="ml-2 text-xs bg-coral/20 text-coral px-1.5 py-0.5 rounded">New</span>}
              </a>
            ))}
          </div>
        )}
      </div>
    </header>
  );
}
