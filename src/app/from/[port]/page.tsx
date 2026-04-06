import fs from 'fs';
import path from 'path';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { RelatedContent } from '@/components/RelatedContent';
import { getRelatedContentForPort } from '@/lib/internal-links';

interface PortGuide {
  slug: string;
  name: string;
  city: string;
  country: string;
  iata: string;
  region: string;
  metaTitle: string;
  metaDescription: string;
  heroSubtitle: string;
  overview: string;
  terminals: Array<{
    name: string;
    description: string;
    cruiseLines: string[];
    facilities: string[];
  }>;
  gettingThere: {
    fromAirport: string;
    fromCityCenter: string;
    parking: string;
    shuttles: string;
  };
  embarkationTips: string[];
  nearbyAttractions: Array<{
    name: string;
    description: string;
    walkingTime: string;
    cost: string;
  }>;
  localTransport: {
    metro: string;
    bus: string;
    taxi: string;
    walkability: string;
  };
  weather: {
    bestMonths: string;
    peakSeason: string;
    climate: string;
  };
  cruiseLinesFromHere: string[];
  isDeparture: boolean;
  isCallPort: boolean;
  insiderTips: string[];
  faq: Array<{ question: string; answer: string }>;
}

const PORTS_DIR = path.join(process.cwd(), 'src/data/generated/ports');

function loadPort(slug: string): PortGuide | null {
  try {
    const filePath = path.join(PORTS_DIR, `${slug}.json`);
    const raw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw) as PortGuide;
  } catch {
    return null;
  }
}

export async function generateStaticParams() {
  try {
    const files = fs.readdirSync(PORTS_DIR);
    return files
      .filter((f) => f.endsWith('.json'))
      .map((f) => ({ port: f.replace('.json', '') }));
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ port: string }>;
}): Promise<Metadata> {
  const { port } = await params;
  const data = loadPort(port);
  if (!data) return { title: 'Port Not Found' };

  return {
    title: data.metaTitle || `${data.name} Cruise Port Guide`,
    description: data.metaDescription,
  };
}

export default async function PortPage({
  params,
}: {
  params: Promise<{ port: string }>;
}) {
  const { port } = await params;
  const data = loadPort(port);
  if (!data) notFound();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero */}
      <div className="bg-gradient-to-r from-sky-600 to-teal-600 text-white rounded-xl p-8 mb-8">
        <p className="text-sky-200 text-sm font-medium uppercase tracking-wide mb-2">
          Cruise Port Guide
        </p>
        <h1 className="text-3xl font-bold mb-2">{data.name}</h1>
        <p className="text-sky-100 text-lg">{data.heroSubtitle}</p>
      </div>

      {/* Breadcrumb */}
      <div className="text-sm text-gray-500 mb-6">
        <a href="/from/" className="hover:text-blue-600">Ports</a>
        {' > '}
        <span>{data.name}</span>
      </div>

      <div className="space-y-8">
        {/* Overview */}
        <section>
          <h2 className="text-2xl font-semibold mb-3">About {data.name}</h2>
          <div className="prose max-w-none">
            {data.overview.split('\n\n').map((p, i) => (
              <p key={i} className="text-gray-700 mb-3">{p}</p>
            ))}
          </div>
        </section>

        {/* Quick Facts */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{data.country}</div>
            <div className="text-gray-500 text-sm">Country</div>
          </div>
          {data.iata && (
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{data.iata}</div>
              <div className="text-gray-500 text-sm">Nearest Airport</div>
            </div>
          )}
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{data.isDeparture ? 'Yes' : 'No'}</div>
            <div className="text-gray-500 text-sm">Departure Port</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{data.isCallPort ? 'Yes' : 'No'}</div>
            <div className="text-gray-500 text-sm">Call Port</div>
          </div>
        </div>

        {/* Getting There */}
        <section className="border rounded-lg overflow-hidden">
          <div className="bg-gray-50 px-4 py-3 border-b">
            <h2 className="font-semibold text-lg">🚗 Getting There & Away</h2>
          </div>
          <div className="p-4 space-y-3">
            {data.gettingThere.fromAirport && (
              <div>
                <h3 className="font-medium text-gray-800">From the Airport</h3>
                <p className="text-gray-600 text-sm">{data.gettingThere.fromAirport}</p>
              </div>
            )}
            {data.gettingThere.fromCityCenter && (
              <div>
                <h3 className="font-medium text-gray-800">From City Centre</h3>
                <p className="text-gray-600 text-sm">{data.gettingThere.fromCityCenter}</p>
              </div>
            )}
            {data.gettingThere.parking && (
              <div>
                <h3 className="font-medium text-gray-800">Parking</h3>
                <p className="text-gray-600 text-sm">{data.gettingThere.parking}</p>
              </div>
            )}
            {data.gettingThere.shuttles && (
              <div>
                <h3 className="font-medium text-gray-800">Shuttles</h3>
                <p className="text-gray-600 text-sm">{data.gettingThere.shuttles}</p>
              </div>
            )}
          </div>
        </section>

        {/* Terminals */}
        {data.terminals && data.terminals.length > 0 && (
          <section className="border rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 border-b">
              <h2 className="font-semibold text-lg">🏛️ Cruise Terminals</h2>
            </div>
            <div className="p-4 space-y-4">
              {data.terminals.map((t, i) => (
                <div key={i} className="border-b last:border-b-0 pb-3 last:pb-0">
                  <h3 className="font-medium text-gray-800">{t.name}</h3>
                  <p className="text-gray-600 text-sm mb-2">{t.description}</p>
                  {t.cruiseLines && t.cruiseLines.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {t.cruiseLines.map((cl) => (
                        <span key={cl} className="bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded">
                          {cl}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Local Transport */}
        {data.localTransport && (
          <section className="border rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 border-b">
              <h2 className="font-semibold text-lg">🚌 Local Transport</h2>
            </div>
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.localTransport.metro && (
                <div>
                  <h3 className="font-medium text-gray-800 text-sm">Metro</h3>
                  <p className="text-gray-600 text-sm">{data.localTransport.metro}</p>
                </div>
              )}
              {data.localTransport.bus && (
                <div>
                  <h3 className="font-medium text-gray-800 text-sm">Bus</h3>
                  <p className="text-gray-600 text-sm">{data.localTransport.bus}</p>
                </div>
              )}
              {data.localTransport.taxi && (
                <div>
                  <h3 className="font-medium text-gray-800 text-sm">Taxi</h3>
                  <p className="text-gray-600 text-sm">{data.localTransport.taxi}</p>
                </div>
              )}
              {data.localTransport.walkability && (
                <div>
                  <h3 className="font-medium text-gray-800 text-sm">Walkability</h3>
                  <p className="text-gray-600 text-sm">{data.localTransport.walkability}</p>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Nearby Attractions */}
        {data.nearbyAttractions && data.nearbyAttractions.length > 0 && (
          <section>
            <h2 className="text-2xl font-semibold mb-3">🎯 Nearby Attractions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.nearbyAttractions.map((a, i) => (
                <div key={i} className="border rounded-lg p-4">
                  <h3 className="font-medium text-gray-800 mb-1">{a.name}</h3>
                  <p className="text-gray-600 text-sm mb-2">{a.description}</p>
                  <div className="flex gap-3 text-xs text-gray-500">
                    {a.walkingTime && <span>🚶 {a.walkingTime}</span>}
                    {a.cost && <span>💰 {a.cost}</span>}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Weather */}
        {data.weather && (
          <section className="border rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 border-b">
              <h2 className="font-semibold text-lg">🌤️ Best Time to Visit</h2>
            </div>
            <div className="p-4 space-y-2">
              {data.weather.bestMonths && (
                <p><span className="font-medium text-gray-700">Best Months:</span> {data.weather.bestMonths}</p>
              )}
              {data.weather.peakSeason && (
                <p><span className="font-medium text-gray-700">Peak Season:</span> {data.weather.peakSeason}</p>
              )}
              {data.weather.climate && (
                <p><span className="font-medium text-gray-700">Climate:</span> {data.weather.climate}</p>
              )}
            </div>
          </section>
        )}

        {/* Embarkation Tips */}
        {data.embarkationTips && data.embarkationTips.length > 0 && (
          <section>
            <h2 className="text-2xl font-semibold mb-3">💡 Embarkation Tips</h2>
            <ul className="space-y-2">
              {data.embarkationTips.map((tip, i) => (
                <li key={i} className="flex gap-2 text-gray-700">
                  <span className="text-blue-500 font-bold">→</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Insider Tips */}
        {data.insiderTips && data.insiderTips.length > 0 && (
          <section className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <h2 className="text-xl font-semibold mb-3 text-amber-800">🧳 Insider Tips</h2>
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

        {/* Cruise Lines */}
        {data.cruiseLinesFromHere && data.cruiseLinesFromHere.length > 0 && (
          <section>
            <h2 className="text-2xl font-semibold mb-3">🚢 Cruise Lines from {data.name}</h2>
            <div className="flex flex-wrap gap-2">
              {data.cruiseLinesFromHere.map((cl) => (
                <span key={cl} className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-sm">
                  {cl}
                </span>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Related Content */}
      <RelatedContent {...getRelatedContentForPort(data.slug)} />

      {/* Back link */}
      <div className="mt-8 pt-8 border-t">
        <a href="/from/" className="text-blue-600 hover:text-blue-800">
          ← Browse all cruise ports
        </a>
      </div>
    </div>
  );
}
