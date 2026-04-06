import fs from 'fs';
import path from 'path';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Compare Cruise Lines — Side-by-Side Comparisons 2026',
  description:
    'Compare cruise lines head-to-head. Prices, ships, dining, entertainment, and destinations. Find the best cruise line for your holiday.',
};

interface ComparisonSummary {
  slug: string;
  title: string;
  lineA: string;
  lineB: string;
}

function loadComparisons(): ComparisonSummary[] {
  const dir = path.join(process.cwd(), 'src/data/generated/comparisons');
  try {
    const files = fs.readdirSync(dir).filter((f) => f.endsWith('.json'));
    return files.map((f) => {
      const slug = f.replace('.json', '');
      const raw = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf-8'));
      const parts = slug.split('-vs-');
      return {
        slug,
        title: raw.title || slug.replace(/-/g, ' '),
        lineA: parts[0]?.replace(/-/g, ' ') || '',
        lineB: parts[1]?.replace(/-/g, ' ') || '',
      };
    });
  } catch {
    return [];
  }
}

export default function ComparePage() {
  const comparisons = loadComparisons();

  // Group by lineA
  const grouped: Record<string, ComparisonSummary[]> = {};
  for (const c of comparisons) {
    const key = c.lineA;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(c);
  }
  const sortedGroups = Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b));

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl p-8 mb-8">
        <h1 className="text-3xl font-bold mb-2">Compare Cruise Lines</h1>
        <p className="text-indigo-100 text-lg">
          {comparisons.length} detailed head-to-head comparisons to help you pick the right cruise line.
        </p>
      </div>

      <div className="space-y-8">
        {sortedGroups.map(([group, items]) => (
          <section key={group}>
            <h2 className="text-xl font-semibold mb-3 capitalize">{group} vs...</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {items
                .sort((a, b) => a.lineB.localeCompare(b.lineB))
                .map((c) => (
                  <a
                    key={c.slug}
                    href={`/compare/${c.slug}/`}
                    className="border rounded-lg p-4 hover:border-indigo-300 hover:bg-indigo-50 transition-colors group"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium capitalize">{c.lineA}</span>
                      <span className="text-gray-400 text-xs">vs</span>
                      <span className="text-sm font-medium capitalize">{c.lineB}</span>
                    </div>
                    <p className="text-xs text-gray-500 group-hover:text-indigo-600">
                      View full comparison &rarr;
                    </p>
                  </a>
                ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
