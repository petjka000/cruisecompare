import fs from 'fs';
import path from 'path';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { RelatedContent } from '@/components/RelatedContent';
import { getRelatedContentForDestination } from '@/lib/internal-links';

interface DestinationGuide {
  slug: string;
  name: string;
  region: string;
  metaTitle: string;
  metaDescription: string;
  heroSubtitle: string;
  overview: string;
  subRegions: string[];
  bestTimeToVisit: {
    peak: string;
    shoulder: string;
    avoid: string;
    tip: string;
  };
  topPorts: Array<{
    name: string;
    highlight: string;
    description: string;
  }>;
  popularItineraries: Array<{
    name: string;
    from: string;
    ports: string[];
    priceFrom: number;
  }>;
  cruiseLinesOperating: string[];
  whatToExpect: {
    weather: string;
    food: string;
    culture: string;
    currency: string;
    language: string;
  };
  insiderTips: string[];
  packingList: string[];
  faq: Array<{ question: string; answer: string }>;
}

const DESTINATIONS_DIR = path.join(process.cwd(), 'src/data/generated/destinations');

function loadDestination(slug: string): DestinationGuide | null {
  try {
    const filePath = path.join(DESTINATIONS_DIR, `${slug}.json`);
    const raw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw) as DestinationGuide;
  } catch {
    return null;
  }
}

export async function generateStaticParams() {
  try {
    const files = fs.readdirSync(DESTINATIONS_DIR);
    return files
      .filter((f) => f.endsWith('.json'))
      .map((f) => ({ destination: f.replace('.json', '') }));
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ destination: string }>;
}): Promise<Metadata> {
  const { destination } = await params;
  const data = loadDestination(destination);
  if (!data) return { title: 'Destination Not Found' };

  return {
    title: data.metaTitle || `${data.name} Cruise Guide | CruiseCompare`,
    description: data.metaDescription,
  };
}

export default async function DestinationPage({
  params,
}: {
  params: Promise<{ destination: string }>;
}) {
  const { destination } = await params;
  const data = loadDestination(destination);
  if (!data) notFound();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero */}
      <div className="bg-gradient-to-r from-teal-600 to-emerald-600 text-white rounded-xl p-8 mb-8">
        <p className="text-teal-200 text-sm font-medium uppercase tracking-wide mb-2">
          Cruise Destination Guide
        </p>
        <h1 className="text-3xl font-bold mb-2">{data.name}</h1>
        <p className="text-teal-100 text-lg">{data.heroSubtitle}</p>
        {data.region && (
          <p className="text-teal-300 text-sm mt-1">{data.region}</p>
        )}
      </div>

      {/* Breadcrumb */}
      <div className="text-sm text-gray-500 mb-6">
        <a href="/destinations/" className="hover:text-blue-600">Destinations</a>
        {' > '}
        <span>{data.name}</span>
      </div>

      <div className="space-y-8">
        {/* Overview */}
        <section>
          <h2 className="text-2xl font-semibold mb-3">About {data.name}</h2>
          {data.overview.split('\n\n').map((p, i) => (
            <p key={i} className="text-gray-700 mb-3">{p}</p>
          ))}
        </section>

        {/* Best Time to Visit */}
        {data.bestTimeToVisit && (
          <section className="border rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 border-b">
              <h2 className="font-semibold text-lg">🌤️ Best Time to Visit</h2>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                {data.bestTimeToVisit.peak && (
                  <div className="bg-green-50 rounded-lg p-3">
                    <div className="text-green-800 font-medium text-sm">Peak Season</div>
                    <div className="text-gray-700 text-sm">{data.bestTimeToVisit.peak}</div>
                  </div>
                )}
                {data.bestTimeToVisit.shoulder && (
                  <div className="bg-amber-50 rounded-lg p-3">
                    <div className="text-amber-800 font-medium text-sm">Shoulder Season</div>
                    <div className="text-gray-700 text-sm">{data.bestTimeToVisit.shoulder}</div>
                  </div>
                )}
                {data.bestTimeToVisit.avoid && (
                  <div className="bg-red-50 rounded-lg p-3">
                    <div className="text-red-800 font-medium text-sm">Best Avoided</div>
                    <div className="text-gray-700 text-sm">{data.bestTimeToVisit.avoid}</div>
                  </div>
                )}
              </div>
              {data.bestTimeToVisit.tip && (
                <p className="text-gray-600 text-sm">
                  <span className="font-medium">💡 Tip:</span> {data.bestTimeToVisit.tip}
                </p>
              )}
            </div>
          </section>
        )}

        {/* Sub-regions */}
        {data.subRegions && data.subRegions.length > 0 && (
          <section>
            <h2 className="text-2xl font-semibold mb-3">🗺️ Regions & Sub-Areas</h2>
            <div className="flex flex-wrap gap-2">
              {data.subRegions.map((s) => (
                <span key={s} className="bg-teal-50 text-teal-700 px-3 py-1 rounded-full text-sm">
                  {s}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Top Ports */}
        {data.topPorts && data.topPorts.length > 0 && (
          <section>
            <h2 className="text-2xl font-semibold mb-3">🚢 Top Ports in {data.name}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.topPorts.map((port, i) => (
                <div key={i} className="border rounded-lg p-4">
                  <h3 className="font-semibold text-gray-800 mb-1">{port.name}</h3>
                  <p className="text-teal-600 text-sm font-medium mb-2">{port.highlight}</p>
                  <p className="text-gray-600 text-sm">{port.description}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Popular Itineraries */}
        {data.popularItineraries && data.popularItineraries.length > 0 && (
          <section>
            <h2 className="text-2xl font-semibold mb-3">🗓️ Popular Itineraries</h2>
            <div className="space-y-4">
              {data.popularItineraries.map((it, i) => (
                <div key={i} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-gray-800">{it.name}</h3>
                    <span className="text-green-600 font-bold">From €{it.priceFrom}</span>
                  </div>
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

        {/* What to Expect */}
        {data.whatToExpect && (
          <section className="border rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 border-b">
              <h2 className="font-semibold text-lg">🧳 What to Expect</h2>
            </div>
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.whatToExpect.weather && (
                <div>
                  <h3 className="font-medium text-gray-700 text-sm">☀️ Weather</h3>
                  <p className="text-gray-600 text-sm">{data.whatToExpect.weather}</p>
                </div>
              )}
              {data.whatToExpect.food && (
                <div>
                  <h3 className="font-medium text-gray-700 text-sm">🍽️ Local Cuisine</h3>
                  <p className="text-gray-600 text-sm">{data.whatToExpect.food}</p>
                </div>
              )}
              {data.whatToExpect.culture && (
                <div>
                  <h3 className="font-medium text-gray-700 text-sm">🏛️ Culture & Customs</h3>
                  <p className="text-gray-600 text-sm">{data.whatToExpect.culture}</p>
                </div>
              )}
              {data.whatToExpect.currency && (
                <div>
                  <h3 className="font-medium text-gray-700 text-sm">💰 Currency</h3>
                  <p className="text-gray-600 text-sm">{data.whatToExpect.currency}</p>
                </div>
              )}
              {data.whatToExpect.language && (
                <div>
                  <h3 className="font-medium text-gray-700 text-sm">🗣️ Language</h3>
                  <p className="text-gray-600 text-sm">{data.whatToExpect.language}</p>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Cruise Lines */}
        {data.cruiseLinesOperating && data.cruiseLinesOperating.length > 0 && (
          <section>
            <h2 className="text-2xl font-semibold mb-3">🚢 Cruise Lines Operating Here</h2>
            <div className="flex flex-wrap gap-2">
              {data.cruiseLinesOperating.map((cl) => (
                <span key={cl} className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-sm">
                  {cl}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Insider Tips */}
        {data.insiderTips && data.insiderTips.length > 0 && (
          <section className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <h2 className="text-xl font-semibold mb-3 text-amber-800">💡 Insider Tips</h2>
            <ul className="space-y-2">
              {data.insiderTips.map((tip, i) => (
                <li key={i} className="flex gap-2 text-amber-900">
                  <span className="text-amber-500">★</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Packing List */}
        {data.packingList && data.packingList.length > 0 && (
          <section>
            <h2 className="text-2xl font-semibold mb-3">🎒 Packing Tips</h2>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {data.packingList.map((item, i) => (
                <li key={i} className="flex gap-2 text-gray-700 text-sm">
                  <span className="text-teal-500">✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* FAQ */}
        {data.faq && data.faq.length > 0 && (
          <section>
            <h2 className="text-2xl font-semibold mb-3">Frequently Asked Questions</h2>
            <div className="space-y-3">
              {data.faq.map((item, i) => (
                <details key={i} className="group border rounded-lg">
                  <summary className="flex justify-between items-center cursor-pointer p-4 font-medium text-gray-800 hover:bg-gray-50">
                    {item.question}
                    <span className="text-gray-400 group-open:rotate-180 transition-transform">▼</span>
                  </summary>
                  <div className="px-4 pb-4 text-gray-600">
                    {item.answer}
                  </div>
                </details>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Related Content */}
      <RelatedContent {...getRelatedContentForDestination(data.slug)} />

      {/* Back link */}
      <div className="mt-8 pt-8 border-t">
        <a href="/destinations/" className="text-blue-600 hover:text-blue-800">
          ← Browse all cruise destinations
        </a>
      </div>
    </div>
  );
}
