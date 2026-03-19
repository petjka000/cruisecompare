export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-20 border-t border-navy/10" style={{ background: '#0A1B3D' }}>
      {/* Wave divider */}
      <div className="overflow-hidden" style={{ marginTop: -1 }}>
        <svg viewBox="0 0 1440 48" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none"
          className="w-full block" style={{ height: 48 }}>
          <path d="M0,24 C240,48 480,0 720,24 C960,48 1200,8 1440,24 L1440,48 L0,48 Z"
            fill="#0A1B3D"/>
          <path d="M0,32 C360,8 720,48 1080,24 C1260,12 1380,28 1440,32 L1440,48 L0,48 Z"
            fill="#0F2347"/>
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8">
        {/* Trust tagline */}
        <div className="text-center mb-10">
          <p className="text-ocean text-sm font-medium tracking-wide uppercase">
            ✓ No commissions — honest cruise comparison
          </p>
        </div>

        {/* 4-column grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          <div>
            <h3 className="text-white font-semibold text-sm uppercase tracking-wide mb-4">Browse</h3>
            <ul className="space-y-2.5">
              {[
                { href: '/cruises/royal-caribbean/', label: 'Royal Caribbean' },
                { href: '/cruises/msc/', label: 'MSC Cruises' },
                { href: '/cruises/norwegian/', label: 'Norwegian' },
                { href: '/destinations/', label: 'All Destinations' },
                { href: '/from/', label: 'Departure Ports' },
              ].map(({ href, label }) => (
                <li key={href}>
                  <a href={href} className="text-white/60 hover:text-white text-sm transition-colors">
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold text-sm uppercase tracking-wide mb-4">Compare</h3>
            <ul className="space-y-2.5">
              {[
                { href: '/compare/royal-caribbean-vs-carnival/', label: 'Royal Caribbean vs Carnival' },
                { href: '/compare/msc-vs-costa/', label: 'MSC vs Costa' },
                { href: '/compare/norwegian-vs-celebrity/', label: 'Norwegian vs Celebrity' },
                { href: '/compare/', label: 'All Comparisons' },
              ].map(({ href, label }) => (
                <li key={href}>
                  <a href={href} className="text-white/60 hover:text-white text-sm transition-colors">
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold text-sm uppercase tracking-wide mb-4">Resources</h3>
            <ul className="space-y-2.5">
              {[
                { href: '/guides/', label: 'Cruise Guides' },
                { href: '/ships/', label: 'Ship Reviews' },
                { href: '/deals/', label: 'Latest Deals' },
                { href: '/guides/best-time-to-cruise/', label: 'When to Book' },
              ].map(({ href, label }) => (
                <li key={href}>
                  <a href={href} className="text-white/60 hover:text-white text-sm transition-colors">
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold text-sm uppercase tracking-wide mb-4">About</h3>
            <p className="text-white/60 text-sm leading-relaxed mb-4">
              CruiseCompare is an independent cruise comparison site. We earn no commission
              from cruise lines — our comparisons are always unbiased.
            </p>
            <p className="text-white/40 text-xs">
              Prices updated daily. All prices per person, subject to availability.
            </p>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <svg width="20" height="14" viewBox="0 0 28 20" fill="none" aria-hidden="true">
              <path d="M2 10 C5 4, 9 1, 14 4 C19 7, 23 3, 26 0" stroke="#5DADE2" strokeWidth="2" strokeLinecap="round" fill="none"/>
              <path d="M2 16 C5 10, 9 7, 14 10 C19 13, 23 9, 26 6" stroke="#1B6FA8" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
            </svg>
            <span className="text-white/40 text-sm">© {year} CruiseCompare. All rights reserved.</span>
          </div>
          <p className="text-white/30 text-xs">
            Independent comparison — no cruise line affiliation
          </p>
        </div>
      </div>
    </footer>
  );
}
