import fs from 'fs';
import path from 'path';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

const CRUISE_LINES_DIR = path.join(process.cwd(), 'src/data/taxonomy');

interface CruiseLine {
  slug: string;
  name: string;
  founded?: number;
  headquarters?: string;
  fleet_size?: number;
  description?: string;
  best_for?: string[];
}

const COMPARISONS_DIR = path.join(process.cwd(), 'src/data/generated/comparisons');

function loadCruiseLines(): CruiseLine[] {
  try {
    const raw = fs.readFileSync(path.join(CRUISE_LINES_DIR, 'cruise-lines.json'), 'utf-8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export async function generateStaticParams() {
  const lines = loadCruiseLines();
  return lines.map((l) => ({ line: l.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ line: string }>;
}): Promise<Metadata> {
  const { line } = await params;
  const lines = loadCruiseLines();
  const cruiseLine = lines.find((l) => l.slug === line);
  if (!cruiseLine) return { title: 'Cruise Line Not Found' };

  return {
    title: `${cruiseLine.name} Cruises 2026 | CruiseCompare`,
    description: `Explore ${cruiseLine.name} cruise deals, ships, and itineraries. Find the best ${cruiseLine.name} cruise for your next holiday.`,
  };
}

export default async function CruiseLinePage({
  params,
}: {
  params: Promise<{ line: string }>;
}) {
  const { line } = await params;
  const lines = loadCruiseLines();
  const cruiseLine = lines.find((l) => l.slug === line);
  if (!cruiseLine) notFound();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl p-8 mb-8">
        <h1 className="text-3xl font-bold mb-2">{cruiseLine.name} Cruises</h1>
        <p className="text-blue-100 text-lg">
          Explore {cruiseLine.name} ships, itineraries, and exclusive deals.
        </p>
      </div>

      {/* Breadcrumb */}
      <div className="text-sm text-gray-500 mb-6">
        <a href="/deals/" className="hover:text-blue-600">Deals</a>
        {' > '}
        <span>{cruiseLine.name}</span>
      </div>

      <div className="space-y-8">
        {/* Quick Facts */}
        <section className="border rounded-lg overflow-hidden">
          <div className="bg-gray-50 px-4 py-3 border-b">
            <h2 className="font-semibold text-lg">📋 About {cruiseLine.name}</h2>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {cruiseLine.founded && (
                <div className="text-center">
                  <div className="text-xl font-bold text-blue-600">{cruiseLine.founded}</div>
                  <div className="text-gray-500 text-xs">Founded</div>
                </div>
              )}
              {cruiseLine.headquarters && (
                <div className="text-center">
                  <div className="text-xl font-bold text-blue-600">{cruiseLine.headquarters}</div>
                  <div className="text-gray-500 text-xs">Headquarters</div>
                </div>
              )}
              {cruiseLine.fleet_size && (
                <div className="text-center">
                  <div className="text-xl font-bold text-blue-600">{cruiseLine.fleet_size}</div>
                  <div className="text-gray-500 text-xs">Ships in Fleet</div>
                </div>
              )}
            </div>
            {cruiseLine.description && (
              <p className="text-gray-700 mt-4">{cruiseLine.description}</p>
            )}
          </div>
        </section>

        {/* Best For */}
        {cruiseLine.best_for && cruiseLine.best_for.length > 0 && (
          <section>
            <h2 className="text-2xl font-semibold mb-3">✅ Best For</h2>
            <div className="flex flex-wrap gap-2">
              {cruiseLine.best_for.map((item) => (
                <span key={item} className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm">
                  {item}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Ship Links */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">🚢 Our Ships</h2>
          <p className="text-gray-500 text-sm mb-4">
            Browse our in-depth reviews of {cruiseLine.name} ships.
          </p>
          <a
            href="/ships/"
            className="inline-block bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition text-sm"
          >
            View all ship reviews →
          </a>
        </section>

        {/* Latest Deals */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">💰 Latest {cruiseLine.name} Deals</h2>
          <a
            href="/deals/"
            className="inline-block bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition text-sm"
          >
            Browse all cruise deals →
          </a>
        </section>
      </div>

      {/* Back link */}
      <div className="mt-8 pt-8 border-t">
        <a href="/deals/" className="text-blue-600 hover:text-blue-800">
          ← Browse all cruise deals
        </a>
      </div>
    </div>
  );
}
