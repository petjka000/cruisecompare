import fs from 'fs';
import path from 'path';
import type { Metadata } from 'next';

interface DestinationSummary {
  slug: string;
  name: string;
  region: string;
}

const DESTINATIONS_DIR = path.join(process.cwd(), 'src/data/generated/destinations');

function loadDestinations(): DestinationSummary[] {
  try {
    const files = fs.readdirSync(DESTINATIONS_DIR);
    return files
      .filter((f) => f.endsWith('.json'))
      .map((f) => {
        try {
          const raw = fs.readFileSync(path.join(DESTINATIONS_DIR, f), 'utf-8');
          const data = JSON.parse(raw);
          return {
            slug: data.slug,
            name: data.name,
            region: data.region || '',
          };
        } catch {
          return null;
        }
      })
      .filter(Boolean) as DestinationSummary[];
  } catch {
    return [];
  }
}

export const metadata: Metadata = {
  title: 'Cruise Destinations',
  description: 'Explore the world\'s best cruise destinations. Regional guides, best times to visit, top ports, and insider tips.',
};

export default async function DestinationsPage() {
  const destinations = loadDestinations();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-gradient-to-r from-teal-600 to-emerald-600 text-white rounded-xl p-8 mb-8">
        <h1 className="text-3xl font-bold mb-2">Cruise Destination Guides</h1>
        <p className="text-teal-100 text-lg">
          Everything you need to know about cruising to destinations worldwide.
        </p>
      </div>

      {destinations.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg mb-2">No destination guides available yet.</p>
          <p className="text-sm">Check back soon — we&apos;re generating guides for all top cruise destinations.</p>
        </div>
      )}

      {destinations.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {destinations.map((dest) => (
            <a
              key={dest.slug}
              href={`/destinations/${dest.slug}/`}
              className="border rounded-lg p-5 hover:border-teal-400 hover:shadow-md transition group"
            >
              <h2 className="font-semibold text-gray-800 group-hover:text-teal-600 text-lg mb-1">
                {dest.name}
              </h2>
              {dest.region && (
                <p className="text-gray-500 text-sm">{dest.region}</p>
              )}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
