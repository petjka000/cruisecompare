import fs from 'fs';
import path from 'path';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

interface ComparisonData {
  title: string;
  intro: string;
  at_a_glance: Record<string, Record<string, string>>;
  comparison_table: Array<{
    category: string;
    [key: string]: string;
  }>;
  choose_a_if: string[];
  choose_b_if: string[];
  verdict_by_traveller: Array<{
    type: string;
    winner: string;
    reason: string;
  }>;
  faqs: Array<{ question: string; answer: string }>;
}

const COMPARISONS_DIR = path.join(process.cwd(), 'src/data/generated/comparisons');

function loadComparison(slug: string): ComparisonData | null {
  if (!/^[a-z0-9-]+$/.test(slug)) return null;
  try {
    const filePath = path.join(COMPARISONS_DIR, `${slug}.json`);
    const raw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw) as ComparisonData;
  } catch {
    return null;
  }
}

export async function generateStaticParams() {
  try {
    const files = fs.readdirSync(COMPARISONS_DIR);
    return files
      .filter((f) => f.endsWith('.json'))
      .map((f) => {
        const slug = f.replace('.json', '');
        return { slug };
      });
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const data = loadComparison(slug);
  if (!data) return { title: 'Comparison Not Found' };

  return {
    title: data.title,
    description: `Detailed comparison of ${data.title.replace(' 2026', '')}. Prices, ships, dining, entertainment, destinations and more.`,
  };
}

export default async function ComparisonPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = loadComparison(slug);
  if (!data) notFound();

  const parts = slug.split('-vs-');
  const lineASlug = parts[0];
  const lineBSlug = parts[1];
  const glanceKeys = Object.keys(data.at_a_glance || {});
  const lineAKey = glanceKeys[0] || lineASlug;
  const lineBKey = glanceKeys[1] || lineBSlug;
  const lineAGlance = data.at_a_glance?.[lineAKey] || {};
  const lineBGlance = data.at_a_glance?.[lineBKey] || {};
  const tableKeys = data.comparison_table?.[0]
    ? Object.keys(data.comparison_table[0]).filter((k) => k !== 'category')
    : [lineAKey, lineBKey];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl p-8 mb-8">
        <p className="text-indigo-200 text-sm font-medium uppercase tracking-wide mb-2">
          Cruise Line Comparison
        </p>
        <h1 className="text-3xl font-bold mb-2">{data.title}</h1>
        <p className="text-indigo-100 text-lg">An honest, detailed comparison to help you choose the right cruise line.</p>
      </div>

      {/* Breadcrumb */}
      <div className="text-sm text-gray-500 mb-6">
        <a href="/compare/" className="hover:text-blue-600">Compare</a>
        {' > '}
        <span>{data.title}</span>
      </div>

      {/* Intro */}
      {data.intro && (
        <section className="mb-8">
          {data.intro.split('\n\n').map((p, i) => (
            <p key={i} className="text-gray-700 mb-3 leading-relaxed">{p}</p>
          ))}
        </section>
      )}

      <div className="space-y-8">
        {/* At a Glance */}
        {glanceKeys.length === 2 && (
          <section>
            <h2 className="text-2xl font-semibold mb-4">At a Glance</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {glanceKeys.map((key) => {
                const info = data.at_a_glance[key];
                return (
                  <div key={key} className="border rounded-lg p-4">
                    <h3 className="font-bold text-lg mb-3 capitalize">{key.replace(/-/g, ' ')}</h3>
                    <dl className="space-y-2">
                      {Object.entries(info).map(([field, value]) => (
                        <div key={field} className="flex justify-between text-sm">
                          <dt className="text-gray-500 capitalize">{field.replace(/_/g, ' ')}</dt>
                          <dd className="text-gray-800 font-medium text-right max-w-[60%]">{value}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Comparison Table */}
        {data.comparison_table && data.comparison_table.length > 0 && (
          <section>
            <h2 className="text-2xl font-semibold mb-4">Head-to-Head Comparison</h2>
            <div className="overflow-x-auto border rounded-lg">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left p-3 font-semibold text-gray-700 w-1/4">Category</th>
                    {tableKeys.map((key) => (
                      <th key={key} className="text-left p-3 font-semibold text-gray-700 capitalize">
                        {key.replace(/-/g, ' ')}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {data.comparison_table.map((row, i) => (
                    <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="p-3 font-medium text-gray-800">{row.category}</td>
                      {tableKeys.map((key) => (
                        <td key={key} className="p-3 text-gray-600">{row[key] || '—'}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Choose A if / Choose B if */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.choose_a_if && data.choose_a_if.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h2 className="font-semibold text-blue-800 mb-3 capitalize">
                Choose {lineAKey.replace(/-/g, ' ')} if...
              </h2>
              <ul className="space-y-2">
                {data.choose_a_if.map((reason, i) => (
                  <li key={i} className="flex gap-2 text-blue-900 text-sm">
                    <span className="text-blue-500 shrink-0">✓</span>
                    <span>{reason}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {data.choose_b_if && data.choose_b_if.length > 0 && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h2 className="font-semibold text-purple-800 mb-3 capitalize">
                Choose {lineBKey.replace(/-/g, ' ')} if...
              </h2>
              <ul className="space-y-2">
                {data.choose_b_if.map((reason, i) => (
                  <li key={i} className="flex gap-2 text-purple-900 text-sm">
                    <span className="text-purple-500 shrink-0">✓</span>
                    <span>{reason}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>

        {/* Verdict by Traveller Type */}
        {data.verdict_by_traveller && data.verdict_by_traveller.length > 0 && (
          <section>
            <h2 className="text-2xl font-semibold mb-4">Verdict by Traveller Type</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.verdict_by_traveller.map((v, i) => (
                <div key={i} className="border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2 py-1 rounded">
                      {v.type}
                    </span>
                    <span className="text-green-700 font-semibold text-sm">{v.winner}</span>
                  </div>
                  <p className="text-gray-600 text-sm">{v.reason}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* FAQ */}
        {data.faqs && data.faqs.length > 0 && (
          <section>
            <h2 className="text-2xl font-semibold mb-3">Frequently Asked Questions</h2>
            <div className="space-y-3">
              {data.faqs.map((item, i) => (
                <details key={i} className="group border rounded-lg">
                  <summary className="flex justify-between items-center cursor-pointer p-4 font-medium text-gray-800 hover:bg-gray-50">
                    {item.question}
                    <span className="text-gray-400 group-open:rotate-180 transition-transform">&#x25BC;</span>
                  </summary>
                  <div className="px-4 pb-4 text-gray-600">{item.answer}</div>
                </details>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Back link */}
      <div className="mt-8 pt-8 border-t">
        <a href="/compare/" className="text-blue-600 hover:text-blue-800">
          &#x2190; Browse all cruise line comparisons
        </a>
      </div>
    </div>
  );
}
