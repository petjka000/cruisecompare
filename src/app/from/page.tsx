import fs from 'fs';
import path from 'path';
import type { Metadata } from 'next';

interface PortSummary {
  slug: string;
  name: string;
  country: string;
  region: string;
  isDeparture: boolean;
  isCallPort: boolean;
}

const PORTS_DIR = path.join(process.cwd(), 'src/data/generated/ports');

function loadPorts(): PortSummary[] {
  try {
    const files = fs.readdirSync(PORTS_DIR);
    return files
      .filter((f) => f.endsWith('.json'))
      .map((f) => {
        try {
          const raw = fs.readFileSync(path.join(PORTS_DIR, f), 'utf-8');
          const data = JSON.parse(raw);
          return {
            slug: data.slug,
            name: data.name,
            country: data.country,
            region: data.region || '',
            isDeparture: data.isDeparture ?? false,
            isCallPort: data.isCallPort ?? false,
          };
        } catch {
          return null;
        }
      })
      .filter(Boolean) as PortSummary[];
  } catch {
    return [];
  }
}

export const metadata: Metadata = {
  title: 'Cruise Ports Guide',
  description: 'Complete guide to major cruise ports worldwide. Terminals, getting there, things to do, and insider tips for every port.',
};

export default async function PortsPage() {
  const ports = loadPorts();
  const departurePorts = ports.filter((p) => p.isDeparture);
  const callPorts = ports.filter((p) => p.isCallPort && !p.isDeparture);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-xl p-8 mb-8">
        <h1 className="text-3xl font-bold mb-2">Cruise Port Guides</h1>
        <p className="text-cyan-100 text-lg">
          Everything you need to know before you cruise — terminals, transport, attractions, and local tips.
        </p>
      </div>

      {departurePorts.length > 0 && (
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">🚢 Departure Ports</h2>
          <p className="text-gray-600 mb-4">Ports where you can start or end your cruise.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {departurePorts.map((port) => (
              <a
                key={port.slug}
                href={`/from/${port.slug}/`}
                className="border rounded-lg p-4 hover:border-blue-400 hover:shadow-md transition group"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-800 group-hover:text-blue-600">
                      {port.name}
                    </h3>
                    <p className="text-gray-500 text-sm">{port.country}</p>
                  </div>
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                    Departure
                  </span>
                </div>
                {port.region && (
                  <p className="text-gray-400 text-xs mt-1">{port.region}</p>
                )}
              </a>
            ))}
          </div>
        </section>
      )}

      {callPorts.length > 0 && (
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">🗺️ Call Ports</h2>
          <p className="text-gray-600 mb-4">Ports visited during cruises as destinations.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {callPorts.map((port) => (
              <a
                key={port.slug}
                href={`/from/${port.slug}/`}
                className="border rounded-lg p-4 hover:border-blue-400 hover:shadow-md transition group"
              >
                <h3 className="font-semibold text-gray-800 group-hover:text-blue-600">
                  {port.name}
                </h3>
                <p className="text-gray-500 text-sm">{port.country}</p>
                {port.region && (
                  <p className="text-gray-400 text-xs mt-1">{port.region}</p>
                )}
              </a>
            ))}
          </div>
        </section>
      )}

      {ports.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg mb-2">No port guides available yet.</p>
          <p className="text-sm">Check back soon — we&apos;re generating guides for all major cruise ports.</p>
        </div>
      )}
    </div>
  );
}
