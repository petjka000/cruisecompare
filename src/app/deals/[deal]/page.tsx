import fs from 'fs';
import path from 'path';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

interface Deal {
  slug: string;
  title: string;
  cruise_line: string;
  ship?: string;
  destination: string;
  departure_port: string;
  duration_nights: number;
  price_eur: number;
  price_per_night?: number;
  original_price_eur?: number;
  discount_pct?: number;
  departure_dates?: string[];
  ports_of_call?: string[];
  includes?: string[];
  excludes?: string[];
  booking_url?: string;
  source?: string;
  scraped_at?: string;
  published_at?: string;
  meta_description?: string;
  excerpt?: string;
}

const DEALS_DIR = path.join(process.cwd(), 'src/data/generated/deals');

function loadDeal(slug: string): Deal | null {
  try {
    const filePath = path.join(DEALS_DIR, `${slug}.json`);
    const raw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw) as Deal;
  } catch {
    return null;
  }
}

export async function generateStaticParams() {
  try {
    const files = fs.readdirSync(DEALS_DIR);
    return files
      .filter((f) => f.endsWith('.json'))
      .map((f) => ({ deal: f.replace('.json', '') }));
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ deal: string }>;
}): Promise<Metadata> {
  const { deal } = await params;
  const data = loadDeal(deal);
  if (!data) return { title: 'Deal Not Found' };

  const description =
    data.meta_description ||
    `${data.cruise_line} ${data.destination} cruise — ${data.duration_nights} nights from €${data.price_eur}. Book now.`;

  return {
    title: `${data.title} | CruiseCompare`,
    description,
    openGraph: {
      title: data.title,
      description,
      type: 'article',
    },
  };
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

export default async function DealPage({
  params,
}: {
  params: Promise<{ deal: string }>;
}) {
  const { deal } = await params;
  const data = loadDeal(deal);
  if (!data) notFound();

  const pricePerNight =
    data.price_per_night ??
    Math.round(data.price_eur / data.duration_nights);

  const discountPct = data.discount_pct
    ? data.discount_pct
    : data.original_price_eur
    ? Math.round(
        ((data.original_price_eur - data.price_eur) / data.original_price_eur) *
          100
      )
    : null;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero / Price Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-xl p-8 mb-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-blue-200 text-sm font-medium uppercase tracking-wide mb-2">
              {data.cruise_line}
            </p>
            <h1 className="text-3xl font-bold mb-2">{data.title}</h1>
            {data.ship && (
              <p className="text-blue-200">
                🚢 {data.ship}
              </p>
            )}
          </div>
          <div className="text-right">
            <div className="text-5xl font-bold">€{data.price_eur}</div>
            <div className="text-blue-200 text-sm">per person</div>
            {data.original_price_eur && (
              <div className="text-blue-300 line-through text-sm mt-1">
                €{data.original_price_eur}
              </div>
            )}
            {discountPct !== null && (
              <div className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded mt-1 inline-block">
                {discountPct}% OFF
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Excerpt */}
          {data.excerpt && (
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
              <p className="text-gray-700">{data.excerpt}</p>
            </div>
          )}

          {/* Route Details Table */}
          <div className="border rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 border-b">
              <h2 className="font-semibold text-lg">Cruise Details</h2>
            </div>
            <table className="w-full">
              <tbody>
                <tr className="border-b">
                  <td className="px-4 py-3 text-gray-500 w-1/3">Cruise Line</td>
                  <td className="px-4 py-3 font-medium">{data.cruise_line}</td>
                </tr>
                {data.ship && (
                  <tr className="border-b">
                    <td className="px-4 py-3 text-gray-500">Ship</td>
                    <td className="px-4 py-3 font-medium">{data.ship}</td>
                  </tr>
                )}
                <tr className="border-b">
                  <td className="px-4 py-3 text-gray-500">Destination</td>
                  <td className="px-4 py-3 font-medium">{data.destination}</td>
                </tr>
                <tr className="border-b">
                  <td className="px-4 py-3 text-gray-500">Departure Port</td>
                  <td className="px-4 py-3 font-medium">{data.departure_port}</td>
                </tr>
                <tr className="border-b">
                  <td className="px-4 py-3 text-gray-500">Duration</td>
                  <td className="px-4 py-3 font-medium">
                    {data.duration_nights} nights
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="px-4 py-3 text-gray-500">Price from</td>
                  <td className="px-4 py-3 font-medium text-blue-700">
                    €{data.price_eur}{' '}
                    <span className="text-gray-400 font-normal text-sm">
                      (€{pricePerNight}/night)
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Departure Dates */}
          {data.departure_dates && data.departure_dates.length > 0 && (
            <div className="border rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-4 py-3 border-b">
                <h2 className="font-semibold text-lg">📅 Available Departure Dates</h2>
              </div>
              <div className="p-4 grid grid-cols-2 md:grid-cols-3 gap-2">
                {data.departure_dates.map((d) => (
                  <div
                    key={d}
                    className="bg-blue-50 border border-blue-200 rounded px-3 py-2 text-sm font-medium text-blue-800 text-center"
                  >
                    {formatDate(d)}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Ports of Call */}
          {data.ports_of_call && data.ports_of_call.length > 0 && (
            <div className="border rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-4 py-3 border-b">
                <h2 className="font-semibold text-lg">🗺️ Ports of Call</h2>
              </div>
              <div className="p-4 flex flex-wrap gap-2">
                {data.ports_of_call.map((port) => (
                  <span
                    key={port}
                    className="bg-indigo-50 border border-indigo-200 text-indigo-800 text-sm px-3 py-1 rounded-full"
                  >
                    {port}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Includes / Excludes */}
          {(data.includes?.length || data.excludes?.length) ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.includes && data.includes.length > 0 && (
                <div className="border border-green-200 rounded-lg overflow-hidden">
                  <div className="bg-green-50 px-4 py-3 border-b border-green-200">
                    <h2 className="font-semibold text-green-800">✅ Included</h2>
                  </div>
                  <ul className="p-4 space-y-1">
                    {data.includes.map((item) => (
                      <li key={item} className="text-sm text-gray-700 capitalize">
                        • {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {data.excludes && data.excludes.length > 0 && (
                <div className="border border-red-200 rounded-lg overflow-hidden">
                  <div className="bg-red-50 px-4 py-3 border-b border-red-200">
                    <h2 className="font-semibold text-red-800">❌ Not Included</h2>
                  </div>
                  <ul className="p-4 space-y-1">
                    {data.excludes.map((item) => (
                      <li key={item} className="text-sm text-gray-700 capitalize">
                        • {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : null}
        </div>

        {/* Sidebar: Booking CTA */}
        <div className="space-y-4">
          <div className="border rounded-xl p-6 sticky top-4 space-y-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-700">€{data.price_eur}</div>
              <div className="text-gray-500 text-sm">per person</div>
              {discountPct !== null && (
                <div className="mt-1 text-green-600 font-medium text-sm">
                  Save {discountPct}% off regular price
                </div>
              )}
            </div>

            {data.booking_url ? (
              <a
                href={data.booking_url}
                target="_blank"
                rel="noopener noreferrer sponsored"
                className="block w-full bg-blue-600 hover:bg-blue-700 text-white text-center font-bold py-4 px-6 rounded-lg text-lg transition"
              >
                Book This Cruise →
              </a>
            ) : (
              <div className="bg-gray-100 text-gray-500 text-center py-3 px-4 rounded-lg text-sm">
                Check cruise line website for booking
              </div>
            )}

            <div className="text-xs text-gray-400 text-center">
              Prices are per person based on double occupancy. Subject to availability.
            </div>

            <div className="border-t pt-4 space-y-2 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Duration</span>
                <span className="font-medium">{data.duration_nights} nights</span>
              </div>
              <div className="flex justify-between">
                <span>From port</span>
                <span className="font-medium">{data.departure_port}</span>
              </div>
              <div className="flex justify-between">
                <span>Price/night</span>
                <span className="font-medium">€{pricePerNight}</span>
              </div>
            </div>
          </div>

          {data.source && (
            <p className="text-xs text-gray-400 text-center">
              Deal sourced from {data.source}
            </p>
          )}
        </div>
      </div>

      {/* Back link */}
      <div className="mt-8 pt-8 border-t">
        <a href="/deals/" className="text-blue-600 hover:text-blue-800">
          ← Back to all cruise deals
        </a>
      </div>
    </div>
  );
}
