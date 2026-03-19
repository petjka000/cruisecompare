import fs from 'fs';
import path from 'path';
import type { Metadata } from 'next';

interface Deal {
  slug: string;
  title: string;
  cruise_line: string;
  destination: string;
  departure_port: string;
  duration_nights: number;
  price_eur: number;
  original_price_eur?: number;
  discount_pct?: number;
  departure_dates?: string[];
  excerpt?: string;
  published_at?: string;
  scraped_at?: string;
}

export const metadata: Metadata = {
  title: 'Cruise Deals 2026 — Best Prices on Mediterranean, Caribbean & More | CruiseCompare',
  description:
    'Browse the latest cruise deals and discounts for 2026. Compare prices on Mediterranean, Caribbean, Alaska, and worldwide cruises from Royal Caribbean, MSC, Costa, and more.',
};

const DEALS_DIR = path.join(process.cwd(), 'src/data/generated/deals');

function loadAllDeals(): Deal[] {
  try {
    const files = fs.readdirSync(DEALS_DIR).filter((f) => f.endsWith('.json'));
    const deals: Deal[] = [];
    for (const file of files) {
      try {
        const raw = fs.readFileSync(path.join(DEALS_DIR, file), 'utf-8');
        deals.push(JSON.parse(raw) as Deal);
      } catch {
        // skip malformed file
      }
    }
    // Sort newest first
    deals.sort((a, b) => {
      const ta = a.published_at ?? a.scraped_at ?? '';
      const tb = b.published_at ?? b.scraped_at ?? '';
      return tb.localeCompare(ta);
    });
    return deals;
  } catch {
    return [];
  }
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
}

export default async function DealsPage() {
  const deals = loadAllDeals();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-xl p-8 mb-10">
        <h1 className="text-4xl font-bold mb-2">🚢 Cruise Deals</h1>
        <p className="text-blue-100 text-lg">
          The best cruise prices for 2026 — updated regularly
        </p>
        {deals.length > 0 && (
          <p className="text-blue-200 text-sm mt-2">{deals.length} deals available</p>
        )}
      </div>

      {deals.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <p className="text-2xl mb-2">No deals yet</p>
          <p>Check back soon — we&apos;re adding new cruise deals regularly.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {deals.map((deal) => {
            const discountPct = deal.discount_pct
              ? deal.discount_pct
              : deal.original_price_eur
              ? Math.round(
                  ((deal.original_price_eur - deal.price_eur) /
                    deal.original_price_eur) *
                    100
                )
              : null;

            const nextDate = deal.departure_dates?.[0]
              ? formatDate(deal.departure_dates[0])
              : null;

            return (
              <a
                key={deal.slug}
                href={`/deals/${deal.slug}/`}
                className="border rounded-xl p-5 hover:shadow-lg transition block group"
              >
                {/* Price + Discount */}
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="text-2xl font-bold text-blue-700">
                      €{deal.price_eur}
                    </div>
                    {deal.original_price_eur && (
                      <div className="text-gray-400 line-through text-sm">
                        €{deal.original_price_eur}
                      </div>
                    )}
                  </div>
                  {discountPct !== null && discountPct > 0 && (
                    <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded">
                      -{discountPct}%
                    </span>
                  )}
                </div>

                {/* Title */}
                <h2 className="font-semibold text-gray-900 group-hover:text-blue-600 mb-2 leading-snug">
                  {deal.title}
                </h2>

                {/* Tags */}
                <div className="flex flex-wrap gap-1 mb-3">
                  <span className="bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded">
                    {deal.cruise_line}
                  </span>
                  <span className="bg-indigo-50 text-indigo-700 text-xs px-2 py-0.5 rounded">
                    {deal.destination}
                  </span>
                  <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded">
                    {deal.duration_nights}n
                  </span>
                </div>

                {/* Excerpt */}
                {deal.excerpt && (
                  <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                    {deal.excerpt}
                  </p>
                )}

                {/* Meta row */}
                <div className="flex items-center justify-between text-xs text-gray-400 border-t pt-2 mt-2">
                  <span>From {deal.departure_port}</span>
                  {nextDate && <span>Next: {nextDate}</span>}
                </div>
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}
