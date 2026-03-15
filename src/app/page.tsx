import fs from 'fs';
import path from 'path';

interface CruiseLine {
  slug: string;
  name: string;
  known_for: string;
  price_tier: string;
}

interface Destination {
  slug: string;
  name: string;
  region: string;
}

export default async function Home() {
  const taxonomyDir = path.join(process.cwd(), 'src/data/taxonomy');
  
  let cruiseLines: CruiseLine[] = [];
  let destinations: Destination[] = [];
  
  try {
    const cruiseLinesData = fs.readFileSync(path.join(taxonomyDir, 'cruise-lines.json'), 'utf-8');
    cruiseLines = JSON.parse(cruiseLinesData);
  } catch (e) {
    console.error('Error loading cruise lines:', e);
  }
  
  try {
    const destinationsData = fs.readFileSync(path.join(taxonomyDir, 'destinations.json'), 'utf-8');
    destinations = JSON.parse(destinationsData);
  } catch (e) {
    console.error('Error loading destinations:', e);
  }
  
  return (
    <div className="space-y-12">
      <section className="text-center py-16 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
        <h1 className="text-5xl font-bold mb-4">Find Your Perfect Cruise</h1>
        <p className="text-xl text-gray-600 mb-8">Compare cruise lines, ships, and destinations for 2026</p>
        <div className="flex gap-4 justify-center">
          <a href="/destinations/" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">Browse Destinations</a>
          <a href="/compare/" className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700">Compare Cruise Lines</a>
        </div>
      </section>

      <section>
        <h2 className="text-3xl font-bold mb-6">Popular Cruise Lines</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cruiseLines.slice(0, 6).map((line) => (
            <a key={line.slug} href={`/cruises/${line.slug}/`} className="border rounded-lg p-6 hover:shadow-lg transition">
              <h3 className="text-xl font-semibold mb-2">{line.name}</h3>
              <p className="text-gray-600 mb-2">{line.known_for}</p>
              <p className="text-sm text-blue-600 capitalize">{line.price_tier} • From €{line.avg_price_7night_inside}</p>
            </a>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-3xl font-bold mb-6">Top Destinations</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {destinations.slice(0, 8).map((dest) => (
            <a key={dest.slug} href={`/destinations/${dest.slug}/`} className="border rounded-lg p-4 hover:shadow-lg transition">
              <h3 className="text-lg font-semibold mb-1">{dest.name}</h3>
              <p className="text-sm text-gray-600">{dest.region}</p>
            </a>
          ))}
        </div>
      </section>

      <section className="bg-gray-50 rounded-lg p-8">
        <h2 className="text-3xl font-bold mb-4">Why Use CruiseCompare?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h3 className="font-semibold mb-2">Unbiased Comparisons</h3>
            <p className="text-gray-600">Side-by-side comparisons of cruise lines, ships, and itineraries to help you choose wisely.</p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Expert Reviews</h3>
            <p className="text-gray-600">Detailed reviews of ships, destinations, and cruise lines based on real passenger experiences.</p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Best Price Tips</h3>
            <p className="text-gray-600">Insider tips on when to book, which cabins to choose, and how to save money.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
