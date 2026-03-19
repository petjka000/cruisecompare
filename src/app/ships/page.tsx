import fs from 'fs';
import path from 'path';
import type { Metadata } from 'next';

interface ShipSummary {
  slug: string;
  name: string;
  cruiseLine: string;
  cruiseLineSlug: string;
  rating?: number;
}

const SHIPS_DIR = path.join(process.cwd(), 'src/data/generated/ships');

function loadShips(): ShipSummary[] {
  try {
    const files = fs.readdirSync(SHIPS_DIR);
    return files
      .filter((f) => f.endsWith('.json'))
      .map((f) => {
        try {
          const raw = fs.readFileSync(path.join(SHIPS_DIR, f), 'utf-8');
          const data = JSON.parse(raw);
          return {
            slug: data.slug,
            name: data.name,
            cruiseLine: data.cruiseLine,
            cruiseLineSlug: data.cruiseLineSlug,
            rating: data.rating,
          };
        } catch {
          return null;
        }
      })
      .filter(Boolean) as ShipSummary[];
  } catch {
    return [];
  }
}

export const metadata: Metadata = {
  title: 'Ship Reviews | CruiseCompare',
  description: 'In-depth reviews of the world\'s best cruise ships. Cabins, dining, entertainment, pools, and more.',
};

export default async function ShipsPage() {
  const ships = loadShips();
  const byLine: Record<string, ShipSummary[]> = {};
  for (const ship of ships) {
    if (!byLine[ship.cruiseLine]) byLine[ship.cruiseLine] = [];
    byLine[ship.cruiseLine].push(ship);
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl p-8 mb-8">
        <h1 className="text-3xl font-bold mb-2">Cruise Ship Reviews</h1>
        <p className="text-indigo-100 text-lg">
          Honest reviews of the world&apos;s most popular cruise ships.
        </p>
      </div>

      {ships.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg mb-2">No ship reviews available yet.</p>
          <p className="text-sm">Check back soon — we&apos;re reviewing all the top cruise ships.</p>
        </div>
      )}

      {Object.entries(byLine).map(([line, lineShips]) => (
        <section key={line} className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">{line}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {lineShips.map((ship) => (
              <a
                key={ship.slug}
                href={`/ships/${ship.slug}/`}
                className="border rounded-lg p-4 hover:border-indigo-400 hover:shadow-md transition group"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-gray-800 group-hover:text-indigo-600">
                      {ship.name}
                    </h3>
                  </div>
                  {ship.rating && (
                    <span className="text-amber-500 text-sm font-medium">
                      ★ {ship.rating.toFixed(1)}
                    </span>
                  )}
                </div>
              </a>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
