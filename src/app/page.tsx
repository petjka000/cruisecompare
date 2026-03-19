import fs from 'fs';
import path from 'path';
import { DealCard, type DealCardProps } from '@/components/DealCard';
import { CruiseLineCard } from '@/components/CruiseLineCard';
import { ComparisonCard, type ComparisonCardProps } from '@/components/ComparisonCard';
import { DestinationCard } from '@/components/DestinationCard';
import { TrustBadges } from '@/components/TrustBadges';
import { cruiseLines } from '@/data/cruise-lines';
import { destinations } from '@/data/destinations';
import { ports } from '@/data/ports';
import { placeholderDeals } from '@/data/placeholder-deals';

// ── Helpers ──────────────────────────────────────────────────────────────────

function slugToLineName(slug: string): string {
  const map: Record<string, string> = {
    'royal-caribbean': 'Royal Caribbean',
    'carnival':        'Carnival',
    'celebrity':       'Celebrity Cruises',
    'costa':           'Costa Cruises',
    'disney':          'Disney Cruise Line',
    'cunard':          'Cunard',
    'holland-america': 'Holland America',
    'msc':             'MSC Cruises',
    'norwegian':       'Norwegian',
    'oceania':         'Oceania Cruises',
    'p-and-o':         'P&O Cruises',
    'princess':        'Princess Cruises',
    'regent':          'Regent Seven Seas',
    'viking':          'Viking Ocean',
    'virgin':          'Virgin Voyages',
  };
  return map[slug] ?? slug.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

// ── Data loading ──────────────────────────────────────────────────────────────

function loadDeals(): DealCardProps[] {
  try {
    const dir = path.join(process.cwd(), 'src/data/generated/deals');
    const files = fs.readdirSync(dir).filter((f) => f.endsWith('.json'));
    const deals: DealCardProps[] = [];
    for (const file of files) {
      try {
        const raw = fs.readFileSync(path.join(dir, file), 'utf-8');
        deals.push(JSON.parse(raw) as DealCardProps);
      } catch { /* skip */ }
    }
    deals.sort((a, b) => {
      const ta = (a as { published_at?: string }).published_at ?? '';
      const tb = (b as { published_at?: string }).published_at ?? '';
      return tb.localeCompare(ta);
    });
    return deals.slice(0, 6);
  } catch { return []; }
}

interface ComparisonJSON {
  title: string;
  intro: string;
  at_a_glance: Record<string, { price_tier: string; avg_7night_inside_eur: number }>;
}

function loadComparisons(): ComparisonCardProps[] {
  try {
    const dir = path.join(process.cwd(), 'src/data/generated/comparisons');
    const files = fs.readdirSync(dir).filter((f) => f.endsWith('.json'));
    const results: ComparisonCardProps[] = [];

    for (const file of files.slice(0, 6)) {
      try {
        const slug = file.replace('.json', '');
        const raw = fs.readFileSync(path.join(dir, file), 'utf-8');
        const data = JSON.parse(raw) as ComparisonJSON;
        const lineKeys = Object.keys(data.at_a_glance ?? {});

        results.push({
          slug,
          lineAName: slugToLineName(lineKeys[0] ?? ''),
          lineBName: slugToLineName(lineKeys[1] ?? ''),
          title: data.title ?? slug,
          excerpt: (data.intro ?? '').slice(0, 140) + '…',
          priceA: data.at_a_glance[lineKeys[0]]?.avg_7night_inside_eur,
          priceB: data.at_a_glance[lineKeys[1]]?.avg_7night_inside_eur,
        });
      } catch { /* skip */ }
    }
    return results;
  } catch { return []; }
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function HomePage() {
  const realDeals = loadDeals();
  const dealsToShow: DealCardProps[] = realDeals.length > 0
    ? realDeals
    : placeholderDeals as unknown as DealCardProps[];
  const comparisons = loadComparisons();

  return (
    <>
      {/* ── SECTION 1: Hero ─────────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden"
        style={{
          background: 'linear-gradient(170deg, #5DADE2 0%, #1B6FA8 38%, #0A1B3D 95%)',
          minHeight: 'clamp(380px, 60vh, 680px)',
        }}
      >
        {/* Subtle radial highlight */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 30% 40%, rgba(255,255,255,0.08) 0%, transparent 60%)' }}
        />

        {/* Content */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-center"
          style={{ minHeight: 'clamp(380px, 60vh, 680px)' }}>
          <div className="max-w-2xl py-16">
            <p className="text-ocean font-medium text-sm uppercase tracking-widest mb-4">
              Honest cruise comparison
            </p>
            <h1
              className="text-white leading-tight mb-4"
              style={{
                fontFamily: 'var(--font-dm-serif, serif)',
                fontSize: 'clamp(2.25rem, 5vw, 3.5rem)',
                lineHeight: 1.15,
              }}
            >
              Find Your Perfect Cruise
            </h1>
            <p className="text-white/75 text-lg leading-relaxed mb-8 max-w-xl">
              Compare prices, ships, and itineraries across every major cruise line.
              No commissions. No bias. Just honest answers.
            </p>

            <div className="flex flex-wrap gap-3">
              <a
                href="/deals/"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white transition-all hover:-translate-y-0.5 hover:shadow-lg"
                style={{ background: '#e8593c' }}
              >
                Browse Deals
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </a>
              <a
                href="/compare/"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white border border-white/30 hover:bg-white/10 transition-all"
              >
                Compare Lines
              </a>
            </div>

            <TrustBadges badges={[
              { label: 'No commissions' },
              { label: '12 cruise lines' },
              { label: '50+ destinations' },
              { label: 'Updated daily' },
            ]} />
          </div>
        </div>

        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none"
            className="w-full block" style={{ height: 60 }}>
            <path d="M0,30 C240,60 480,0 720,30 C960,60 1200,10 1440,30 L1440,60 L0,60 Z"
              fill="var(--background, #faf8f5)"/>
          </svg>
        </div>
      </section>

      {/* ── SECTION 2: Latest Deals ─────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        <div className="flex items-baseline justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-navy" style={{ fontFamily: 'var(--font-dm-serif, serif)' }}>
              Latest cruise deals
            </h2>
            <p className="text-bluegray text-sm mt-1">
              {realDeals.length > 0
                ? 'Updated daily from verified sources'
                : 'Sample deals — live deals coming soon'}
            </p>
          </div>
          <a href="/deals/" className="text-sm font-medium text-marine hover:text-coral transition-colors whitespace-nowrap">
            View all →
          </a>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {dealsToShow.map((deal) => (
            <DealCard key={deal.slug} {...deal} />
          ))}
        </div>
      </section>

      {/* ── SECTION 3: Popular Cruise Lines ─────────────────────────────── */}
      <section className="py-12" style={{ background: '#fff' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-baseline justify-between mb-8">
            <h2 className="text-3xl font-bold text-navy" style={{ fontFamily: 'var(--font-dm-serif, serif)' }}>
              Popular cruise lines
            </h2>
            <a href="/cruises/" className="text-sm font-medium text-marine hover:text-coral transition-colors">
              All lines →
            </a>
          </div>

          {/* Horizontal scroll on mobile, grid on desktop */}
          <div className="flex gap-4 overflow-x-auto pb-2 sm:overflow-visible sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:pb-0">
            {cruiseLines.slice(0, 8).map((line) => (
              <div key={line.slug} className="min-w-[240px] sm:min-w-0">
                <CruiseLineCard line={line} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 4: Head-to-head Comparisons ─────────────────────────── */}
      {comparisons.length > 0 && (
        <section className="py-12" style={{ background: 'var(--background, #faf8f5)' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-baseline justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-navy" style={{ fontFamily: 'var(--font-dm-serif, serif)' }}>
                  Head-to-head comparisons
                </h2>
                <p className="text-bluegray text-sm mt-1">Side-by-side analysis to help you choose</p>
              </div>
              <a href="/compare/" className="text-sm font-medium text-marine hover:text-coral transition-colors">
                All comparisons →
              </a>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {comparisons.map((c) => (
                <ComparisonCard key={c.slug} {...c} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── SECTION 5: Destinations ─────────────────────────────────────── */}
      <section className="py-12" style={{ background: '#fff' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-baseline justify-between mb-8">
            <h2 className="text-3xl font-bold text-navy" style={{ fontFamily: 'var(--font-dm-serif, serif)' }}>
              Where do you want to go?
            </h2>
            <a href="/destinations/" className="text-sm font-medium text-marine hover:text-coral transition-colors">
              All destinations →
            </a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {destinations.map((d) => (
              <DestinationCard key={d.slug} destination={d} />
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 6: Departure Ports ──────────────────────────────────── */}
      <section className="py-12" style={{ background: 'var(--background, #faf8f5)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-navy mb-2" style={{ fontFamily: 'var(--font-dm-serif, serif)' }}>
            Sail from your nearest port
          </h2>
          <p className="text-bluegray text-sm mb-8">Find cruises departing from major European and US ports</p>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {ports.map((port) => (
              <a
                key={port.slug}
                href={`/from/${port.slug}/`}
                className="rounded-xl border border-navy/10 bg-white p-4 text-center hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group"
              >
                <div className="text-2xl mb-2">{port.flag}</div>
                <div className="text-xs font-semibold text-navy group-hover:text-marine transition-colors leading-tight">
                  {port.name}
                </div>
                <div className="text-xs text-bluegray mt-1">{port.cruiseCount} cruises</div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 7: Why CruiseCompare ────────────────────────────────── */}
      <section className="py-16" style={{ background: '#0A1B3D' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white text-center mb-12"
            style={{ fontFamily: 'var(--font-dm-serif, serif)' }}>
            Why use CruiseCompare?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Pillar 1 */}
            <div className="text-center">
              <div className="mx-auto mb-5 w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{ background: 'rgba(93,173,226,0.12)', border: '1px solid rgba(93,173,226,0.25)' }}>
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
                  <path d="M14 4l2 6h6l-5 3.5 2 6L14 16l-5 3.5 2-6L6 10h6L14 4z"
                    stroke="#5DADE2" strokeWidth="1.8" strokeLinejoin="round" fill="none"/>
                </svg>
              </div>
              <h3 className="text-white font-semibold text-lg mb-2">No commissions</h3>
              <p className="text-white/60 text-sm leading-relaxed">
                We don&apos;t sell cruises. We compare them honestly so you always get the best deal,
                not the one that pays us the most.
              </p>
            </div>

            {/* Pillar 2 */}
            <div className="text-center">
              <div className="mx-auto mb-5 w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{ background: 'rgba(93,173,226,0.12)', border: '1px solid rgba(93,173,226,0.25)' }}>
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
                  <rect x="4" y="6" width="20" height="16" rx="3" stroke="#5DADE2" strokeWidth="1.8" fill="none"/>
                  <path d="M10 14h8M10 18h5" stroke="#5DADE2" strokeWidth="1.8" strokeLinecap="round"/>
                  <path d="M8 6V4M20 6V4" stroke="#5DADE2" strokeWidth="1.8" strokeLinecap="round"/>
                </svg>
              </div>
              <h3 className="text-white font-semibold text-lg mb-2">Every major line</h3>
              <p className="text-white/60 text-sm leading-relaxed">
                Royal Caribbean, MSC, Norwegian, Carnival, Princess, and more — all in one place.
                No need to check 12 different sites.
              </p>
            </div>

            {/* Pillar 3 */}
            <div className="text-center">
              <div className="mx-auto mb-5 w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{ background: 'rgba(93,173,226,0.12)', border: '1px solid rgba(93,173,226,0.25)' }}>
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
                  <path d="M6 22l4-8 4 4 4-10 4 6" stroke="#5DADE2" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                  <circle cx="22" cy="8" r="2" fill="#5DADE2"/>
                </svg>
              </div>
              <h3 className="text-white font-semibold text-lg mb-2">Real prices</h3>
              <p className="text-white/60 text-sm leading-relaxed">
                Updated daily from multiple sources. No bait-and-switch. The price you see
                is the price you&apos;ll find when you click.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 8: SEO content ───────────────────────────────────────── */}
      <section className="py-10" style={{ background: 'var(--background, #faf8f5)' }}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-bluegray text-sm leading-relaxed">
            Looking for cruise deals in 2026? CruiseCompare tracks prices across all major cruise lines so
            you can compare cruise lines like Royal Caribbean, MSC Cruises, Norwegian, and Carnival in one
            place. Whether you want cheap cruises in the Mediterranean, Caribbean, or Alaska, our unbiased
            comparisons help you find the best value for your budget — without the sales pressure.
          </p>
        </div>
      </section>
    </>
  );
}
