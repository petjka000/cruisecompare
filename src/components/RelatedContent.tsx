import Link from 'next/link';

interface RelatedShip {
  slug: string;
  name: string;
  cruiseLine: string;
}

interface RelatedPort {
  slug: string;
  name: string;
  country: string;
}

interface RelatedDestination {
  slug: string;
  name: string;
}

interface RelatedContentProps {
  ships?: RelatedShip[];
  ports?: RelatedPort[];
  destinations?: RelatedDestination[];
}

export function RelatedContent({ ships = [], ports = [], destinations = [] }: RelatedContentProps) {
  const hasContent = ships.length > 0 || ports.length > 0 || destinations.length > 0;

  if (!hasContent) return null;

  return (
    <div className="mt-8 pt-8 border-t">
      <h2 className="text-xl font-semibold mb-4">Related Content</h2>

      {ships.length > 0 && (
        <div className="mb-4">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">🚢 Ships</h3>
          <div className="flex flex-wrap gap-2">
            {ships.map((ship) => (
              <Link
                key={ship.slug}
                href={`/ships/${ship.slug}/`}
                className="bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-lg text-sm hover:bg-indigo-100 transition"
              >
                {ship.name}
              </Link>
            ))}
          </div>
        </div>
      )}

      {ports.length > 0 && (
        <div className="mb-4">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">🗺️ Ports</h3>
          <div className="flex flex-wrap gap-2">
            {ports.map((port) => (
              <Link
                key={port.slug}
                href={`/from/${port.slug}/`}
                className="bg-cyan-50 text-cyan-700 px-3 py-1.5 rounded-lg text-sm hover:bg-cyan-100 transition"
              >
                {port.name}
              </Link>
            ))}
          </div>
        </div>
      )}

      {destinations.length > 0 && (
        <div className="mb-4">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">🌍 Destinations</h3>
          <div className="flex flex-wrap gap-2">
            {destinations.map((dest) => (
              <Link
                key={dest.slug}
                href={`/destinations/${dest.slug}/`}
                className="bg-teal-50 text-teal-700 px-3 py-1.5 rounded-lg text-sm hover:bg-teal-100 transition"
              >
                {dest.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
