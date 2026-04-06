import fs from 'fs';
import path from 'path';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cruise Lines — All Major Cruise Lines Compared 2026',
  description:
    'Browse all major cruise lines. Compare ships, prices, destinations, and find the right cruise line for your next holiday.',
};

interface CruiseLine {
  slug: string;
  name: string;
  founded?: number;
  fleet_size?: number;
  description?: string;
  best_for?: string[];
}

function loadCruiseLines(): CruiseLine[] {
  try {
    const raw = fs.readFileSync(
      path.join(process.cwd(), 'src/data/taxonomy/cruise-lines.json'),
      'utf-8'
    );
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export default function CruiseLinesIndexPage() {
  const lines = loadCruiseLines();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl p-8 mb-8">
        <h1 className="text-3xl font-bold mb-2">All Cruise Lines</h1>
        <p className="text-blue-100 text-lg">
          {lines.length} cruise lines reviewed and compared. Find your perfect match.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {lines
          .sort((a, b) => a.name.localeCompare(b.name))
          .map((line) => (
            <a
              key={line.slug}
              href={`/cruises/${line.slug}/`}
              className="border rounded-lg p-4 hover:border-blue-300 hover:bg-blue-50 transition-colors group"
            >
              <h2 className="font-semibold text-gray-800 group-hover:text-blue-600 mb-1">
                {line.name}
              </h2>
              <div className="flex gap-3 text-xs text-gray-500 mb-2">
                {line.founded && <span>Est. {line.founded}</span>}
                {line.fleet_size && <span>{line.fleet_size} ships</span>}
              </div>
              {line.description && (
                <p className="text-gray-600 text-sm line-clamp-2">{line.description}</p>
              )}
              {line.best_for && line.best_for.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {line.best_for.slice(0, 3).map((tag) => (
                    <span key={tag} className="bg-blue-50 text-blue-600 text-xs px-2 py-0.5 rounded">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </a>
          ))}
      </div>
    </div>
  );
}
