import fs from 'fs';
import path from 'path';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { RelatedContent } from '@/components/RelatedContent';
import { getRelatedContentForShip } from '@/lib/internal-links';

interface ShipReview {
  slug: string;
  name: string;
  cruiseLine: string;
  cruiseLineSlug: string;
  metaTitle: string;
  metaDescription: string;
  heroSubtitle: string;
  overview: string;
  quickFacts: {
    yearBuilt: number | string;
    tonnage: string;
    passengers: number | string;
    crew: number | string;
    decks: number | string;
    length: string;
    cabins: number | string;
  };
  cabinTypes: Array<{
    type: string;
    priceFrom: number;
    sqft: string;
    description: string;
  }>;
  dining: Array<{ name: string; type: string; price?: string; description: string }>;
  entertainment: string[];
  pools: string[];
  kidsClubs: string[];
  bestFor: string[];
  notIdealFor: string[];
  prosAndCons: { pros: string[]; cons: string[] };
  verdict: string;
  rating: number;
  itineraries: Array<{ name: string; ports: string[]; from: string }>;
}

const SHIPS_DIR = path.join(process.cwd(), 'src/data/generated/ships');

function loadShip(slug: string): ShipReview | null {
  try {
    const filePath = path.join(SHIPS_DIR, `${slug}.json`);
    const raw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw) as ShipReview;
  } catch {
    return null;
  }
}

export async function generateStaticParams() {
  try {
    const files = fs.readdirSync(SHIPS_DIR);
    return files
      .filter((f) => f.endsWith('.json'))
      .map((f) => ({ ship: f.replace('.json', '') }));
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ ship: string }>;
}): Promise<Metadata> {
  const { ship } = await params;
  const data = loadShip(ship);
  if (!data) return { title: 'Ship Not Found' };

  return {
    title: data.metaTitle || `${data.name} Review | CruiseCompare`,
    description: data.metaDescription,
  };
}

export default async function ShipPage({
  params,
}: {
  params: Promise<{ ship: string }>;
}) {
  const { ship } = await params;
  const data = loadShip(ship);
  if (!data) notFound();

  const ratingStars = '★'.repeat(Math.round(data.rating)) + '☆'.repeat(5 - Math.round(data.rating));

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl p-8 mb-8">
        <p className="text-indigo-200 text-sm font-medium uppercase tracking-wide mb-2">
          {data.cruiseLine}
        </p>
        <h1 className="text-3xl font-bold mb-2">{data.name}</h1>
        <p className="text-indigo-100">{data.heroSubtitle}</p>
        <div className="mt-3 text-amber-300 text-xl">
          {ratingStars} <span className="text-white text-base ml-1">{data.rating.toFixed(1)}/5</span>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="text-sm text-gray-500 mb-6">
        <a href="/ships/" className="hover:text-blue-600">Ships</a>
        {' > '}
        <a href={`/cruises/${data.cruiseLineSlug}/`} className="hover:text-blue-600">{data.cruiseLine}</a>
        {' > '}
        <span>{data.name}</span>
      </div>

      <div className="space-y-8">
        {/* Overview */}
        <section>
          <h2 className="text-2xl font-semibold mb-3">Overview</h2>
          {data.overview.split('\n\n').map((p, i) => (
            <p key={i} className="text-gray-700 mb-3">{p}</p>
          ))}
        </section>

        {/* Quick Facts */}
        <section className="border rounded-lg overflow-hidden">
          <div className="bg-gray-50 px-4 py-3 border-b">
            <h2 className="font-semibold text-lg">📋 Quick Facts</h2>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {data.quickFacts.yearBuilt && (
                <div className="text-center">
                  <div className="text-xl font-bold text-indigo-600">{data.quickFacts.yearBuilt}</div>
                  <div className="text-gray-500 text-xs">Year Built</div>
                </div>
              )}
              {data.quickFacts.tonnage && (
                <div className="text-center">
                  <div className="text-xl font-bold text-indigo-600">{data.quickFacts.tonnage}</div>
                  <div className="text-gray-500 text-xs">Gross Tons</div>
                </div>
              )}
              {data.quickFacts.passengers && (
                <div className="text-center">
                  <div className="text-xl font-bold text-indigo-600">{data.quickFacts.passengers}</div>
                  <div className="text-gray-500 text-xs">Passengers</div>
                </div>
              )}
              {data.quickFacts.decks && (
                <div className="text-center">
                  <div className="text-xl font-bold text-indigo-600">{data.quickFacts.decks}</div>
                  <div className="text-gray-500 text-xs">Decks</div>
                </div>
              )}
              {data.quickFacts.length && (
                <div className="text-center">
                  <div className="text-xl font-bold text-indigo-600">{data.quickFacts.length}</div>
                  <div className="text-gray-500 text-xs">Length</div>
                </div>
              )}
              {data.quickFacts.cabins && (
                <div className="text-center">
                  <div className="text-xl font-bold text-indigo-600">{data.quickFacts.cabins}</div>
                  <div className="text-gray-500 text-xs">Cabins</div>
                </div>
              )}
              {data.quickFacts.crew && (
                <div className="text-center">
                  <div className="text-xl font-bold text-indigo-600">{data.quickFacts.crew}</div>
                  <div className="text-gray-500 text-xs">Crew</div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Cabin Types */}
        {data.cabinTypes && data.cabinTypes.length > 0 && (
          <section>
            <h2 className="text-2xl font-semibold mb-3">🏠 Cabin Types</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {data.cabinTypes.map((cabin, i) => (
                <div key={i} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-gray-800">{cabin.type}</h3>
                    <span className="text-green-600 font-bold text-sm">€{cabin.priceFrom}</span>
                  </div>
                  <p className="text-gray-500 text-xs mb-2">{cabin.sqft} sq ft</p>
                  <p className="text-gray-600 text-sm">{cabin.description}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Dining */}
        {data.dining && data.dining.length > 0 && (
          <section className="border rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 border-b">
              <h2 className="font-semibold text-lg">🍽️ Dining</h2>
            </div>
            <div className="p-4 space-y-3">
              {data.dining.map((d, i) => (
                <div key={i} className="border-b last:border-b-0 pb-3 last:pb-0">
                  <div className="flex justify-between items-start">
                    <h3 className="font-medium text-gray-800">{d.name}</h3>
                    {d.type === 'surcharge' && d.price && (
                      <span className="text-amber-600 text-sm font-medium">{d.price}</span>
                    )}
                    {d.type === 'included' && (
                      <span className="text-green-600 text-xs bg-green-50 px-2 py-0.5 rounded">Included</span>
                    )}
                  </div>
                  <p className="text-gray-600 text-sm mt-1">{d.description}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Entertainment */}
        {data.entertainment && data.entertainment.length > 0 && (
          <section>
            <h2 className="text-2xl font-semibold mb-3">🎭 Entertainment & Activities</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {data.entertainment.map((item, i) => (
                <div key={i} className="flex gap-2 text-gray-700">
                  <span className="text-purple-500">✦</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Pools */}
        {data.pools && data.pools.length > 0 && (
          <section>
            <h2 className="text-2xl font-semibold mb-3">🏊 Pools & Recreation</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {data.pools.map((pool, i) => (
                <div key={i} className="flex gap-2 text-gray-700">
                  <span className="text-sky-500">🌊</span>
                  <span>{pool}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Kids Clubs */}
        {data.kidsClubs && data.kidsClubs.length > 0 && (
          <section>
            <h2 className="text-2xl font-semibold mb-3">👧 Kids & Family</h2>
            {data.kidsClubs.map((item, i) => (
              <p key={i} className="text-gray-700 mb-1">{item}</p>
            ))}
          </section>
        )}

        {/* Best For / Not Ideal For */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.bestFor && data.bestFor.length > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-semibold text-green-800 mb-2">✅ Best For</h3>
              <ul className="space-y-1">
                {data.bestFor.map((item, i) => (
                  <li key={i} className="text-green-700 text-sm">{item}</li>
                ))}
              </ul>
            </div>
          )}
          {data.notIdealFor && data.notIdealFor.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h3 className="font-semibold text-red-800 mb-2">⚠️ Not Ideal For</h3>
              <ul className="space-y-1">
                {data.notIdealFor.map((item, i) => (
                  <li key={i} className="text-red-700 text-sm">{item}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Pros and Cons */}
        {data.prosAndCons && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold text-lg text-green-700 mb-2">👍 Pros</h3>
              <ul className="space-y-2">
                {data.prosAndCons.pros.map((pro, i) => (
                  <li key={i} className="flex gap-2 text-gray-700 text-sm">
                    <span className="text-green-500">+</span>
                    <span>{pro}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-lg text-red-700 mb-2">👎 Cons</h3>
              <ul className="space-y-2">
                {data.prosAndCons.cons.map((con, i) => (
                  <li key={i} className="flex gap-2 text-gray-700 text-sm">
                    <span className="text-red-500">−</span>
                    <span>{con}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Verdict */}
        {data.verdict && (
          <section className="bg-indigo-50 border border-indigo-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-indigo-800 mb-3">Our Verdict</h2>
            {data.verdict.split('\n\n').map((p, i) => (
              <p key={i} className="text-indigo-900 mb-2">{p}</p>
            ))}
          </section>
        )}

        {/* Itineraries */}
        {data.itineraries && data.itineraries.length > 0 && (
          <section>
            <h2 className="text-2xl font-semibold mb-3">🗺️ Sample Itineraries</h2>
            <div className="space-y-4">
              {data.itineraries.map((it, i) => (
                <div key={i} className="border rounded-lg p-4">
                  <h3 className="font-semibold text-gray-800 mb-1">{it.name}</h3>
                  <p className="text-gray-500 text-sm mb-2">From: {it.from}</p>
                  <div className="flex flex-wrap gap-1">
                    {it.ports.map((port) => (
                      <span key={port} className="bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded">
                        {port}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Related Content */}
      <RelatedContent {...getRelatedContentForShip(data.slug)} />

      {/* Back link */}
      <div className="mt-8 pt-8 border-t">
        <a href="/ships/" className="text-blue-600 hover:text-blue-800">
          ← Browse all cruise ships
        </a>
      </div>
    </div>
  );
}
