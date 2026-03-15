import fs from 'fs';
import path from 'path';
import { notFound } from 'next/navigation';

interface CruiseLine {
  slug: string;
  name: string;
  known_for: string;
  strengths: string[];
  weaknesses: string[];
  avg_price_7night_inside: number;
  avg_price_7night_balcony: number;
  loyalty_program: string;
  key_ships: string[];
  booking_tip: string;
}

interface Destination {
  slug: string;
  name: string;
  best_months: string[];
  avoid_months: string[];
  avoid_reason: string;
  climate: string;
  typical_ports: Array<{port: string; highlight: string}>;
  excursion_budget_pp: string;
}

export async function generateStaticParams() {
  const taxonomyDir = path.join(process.cwd(), 'src/data/taxonomy');
  
  try {
    const cruiseLinesData = fs.readFileSync(path.join(taxonomyDir, 'cruise-lines.json'), 'utf-8');
    const destinationsData = fs.readFileSync(path.join(taxonomyDir, 'destinations.json'), 'utf-8');
    
    const cruiseLines = JSON.parse(cruiseLinesData);
    const destinations = JSON.parse(destinationsData);
    
    const params = [];
    for (const line of cruiseLines) {
      for (const dest of destinations) {
        params.push({
          line: line.slug,
          destination: dest.slug,
        });
      }
    }
    return params;
  } catch (e) {
    console.error('Error generating static params:', e);
    return [];
  }
}

export default async function CruiseLineDestinationPage({
  params,
}: {
  params: Promise<{ line: string; destination: string }>;
}) {
  const { line: lineSlug, destination: destSlug } = await params;
  const taxonomyDir = path.join(process.cwd(), 'src/data/taxonomy');
  
  let cruiseLine: CruiseLine | null = null;
  let destination: Destination | null = null;
  
  try {
    const cruiseLinesData = fs.readFileSync(path.join(taxonomyDir, 'cruise-lines.json'), 'utf-8');
    const cruiseLines = JSON.parse(cruiseLinesData);
    cruiseLine = cruiseLines.find((cl: CruiseLine) => cl.slug === lineSlug) || null;
  } catch (e) {
    console.error('Error loading cruise line:', e);
  }
  
  try {
    const destinationsData = fs.readFileSync(path.join(taxonomyDir, 'destinations.json'), 'utf-8');
    const destinations = JSON.parse(destinationsData);
    destination = destinations.find((d: Destination) => d.slug === destSlug) || null;
  } catch (e) {
    console.error('Error loading destination:', e);
  }
  
  if (!cruiseLine || !destination) {
    notFound();
  }
  
  const pageTitle = `${cruiseLine.name} ${destination.name} Cruises 2026 — Itineraries, Prices & Ships`;
  
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-4">{pageTitle}</h1>
        <p className="text-xl text-gray-600">Complete guide to sailing with {cruiseLine.name} to the {destination.name}</p>
      </div>
      
      <section className="bg-blue-50 rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-4">Quick Facts</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-gray-600">Price from</p>
            <p className="text-2xl font-bold">€{cruiseLine.avg_price_7night_inside}</p>
            <p className="text-xs text-gray-500">7-night inside cabin</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Balcony from</p>
            <p className="text-2xl font-bold">€{cruiseLine.avg_price_7night_balcony}</p>
            <p className="text-xs text-gray-500">7-night balcony cabin</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Best months</p>
            <p className="font-semibold">{destination.best_months.slice(0, 3).join(', ')}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Climate</p>
            <p className="font-semibold">{destination.climate}</p>
          </div>
        </div>
      </section>
      
      <section>
        <h2 className="text-2xl font-bold mb-4">Why Choose {cruiseLine.name} for {destination.name}?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold mb-2 text-green-700">Strengths</h3>
            <ul className="list-disc list-inside space-y-1">
              {cruiseLine.strengths.map((s, i) => (
                <li key={i} className="text-gray-700">{s}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-2 text-red-700">Considerations</h3>
            <ul className="list-disc list-inside space-y-1">
              {cruiseLine.weaknesses.map((w, i) => (
                <li key={i} className="text-gray-700">{w}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>
      
      <section>
        <h2 className="text-2xl font-bold mb-4">Top Ports in {destination.name}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {destination.typical_ports.map((port, i) => (
            <div key={i} className="border rounded-lg p-4">
              <h3 className="font-semibold mb-1">{port.port}</h3>
              <p className="text-gray-600">{port.highlight}</p>
            </div>
          ))}
        </div>
      </section>
      
      <section className="bg-yellow-50 rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-4">When to Cruise {destination.name}</h2>
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-green-700">Best months: {destination.best_months.join(', ')}</h3>
            <p className="text-gray-700">Ideal weather, calm seas, and peak activities.</p>
          </div>
          <div>
            <h3 className="font-semibold text-red-700">Avoid: {destination.avoid_months.join(', ')} — {destination.avoid_reason}</h3>
          </div>
          <div>
            <p className="text-gray-700"><strong>Excursion budget:</strong> {destination.excursion_budget_pp} per port</p>
          </div>
        </div>
      </section>
      
      <section>
        <h2 className="text-2xl font-bold mb-4">Key Ships on This Route</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {cruiseLine.key_ships.map((ship, i) => (
            <div key={i} className="border rounded-lg p-4">
              <h3 className="font-semibold">{ship}</h3>
              <a href={`/ships/${ship.toLowerCase().replace(/\s+/g, '-')}/`} className="text-blue-600 hover:underline text-sm">View ship details →</a>
            </div>
          ))}
        </div>
      </section>
      
      <section className="bg-indigo-50 rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-4">Booking Tips</h2>
        <p className="text-lg text-gray-700 mb-4">{cruiseLine.booking_tip}</p>
        <p className="text-gray-600"><strong>Loyalty Program:</strong> {cruiseLine.loyalty_program}</p>
      </section>
      
      <section>
        <h2 className="text-2xl font-bold mb-4">Frequently Asked Questions</h2>
        <div className="space-y-6">
          <div>
            <h3 className="font-semibold text-lg mb-2">What is the best time to book {cruiseLine.name} {destination.name} cruises?</h3>
            <p className="text-gray-700">Book 6-12 months in advance for best cabin selection and pricing. Last-minute deals (within 60 days) can offer savings but cabin choice is limited. For peak season sailings (December-March for Caribbean, June-August for Mediterranean), book as early as possible.</p>
          </div>
          <div>
            <h3 className="font-semibold text-lg mb-2">Which {cruiseLine.name} ship is best for {destination.name}?</h3>
            <p className="text-gray-700">The newest ships typically offer the best amenities and dining options. For {destination.name}, consider {cruiseLine.key_ships[0]} or {cruiseLine.key_ships[1]} which are specifically designed for this region with enhanced features.</p>
          </div>
          <div>
            <h3 className="font-semibold text-lg mb-2">What is included in the fare?</h3>
            <p className="text-gray-700">{cruiseLine.name} includes all meals in main dining rooms and buffet, entertainment, pools, and kids clubs. Specialty dining, alcoholic beverages, shore excursions, spa treatments, and gratuities are typically extra. Consider beverage packages if you plan to drink alcohol regularly.</p>
          </div>
          <div>
            <h3 className="font-semibold text-lg mb-2">Do I need travel insurance for {destination.name}?</h3>
            <p className="text-gray-700">Yes, travel insurance is highly recommended for all cruises. It covers trip cancellation, medical emergencies, and missed connections. For {destination.name}, ensure your policy covers the specific activities you plan to do ashore.</p>
          </div>
          <div>
            <h3 className="font-semibold text-lg mb-2">What should I pack for {cruiseLine.name} {destination.name}?</h3>
            <p className="text-gray-700">Pack light, breathable clothing for {destination.name}. Include formal wear for elegant nights (check {cruiseLine.name}'s dress code), comfortable walking shoes for excursions, swimwear, and a light jacket for evenings. Don't forget sunscreen and motion sickness remedies if prone to seasickness.</p>
          </div>
          <div>
            <h3 className="font-semibold text-lg mb-2">Are {cruiseLine.name} cruises good for families?</h3>
            <p className="text-gray-700">{cruiseLine.name} is {cruiseLine.slug.includes('royal') || cruiseLine.slug.includes('disney') || cruiseLine.slug.includes('carnival') ? 'excellent' : 'good'} for families, with dedicated kids clubs, family-friendly entertainment, and cabins designed for families. Check the specific ship's amenities for water slides, kids pools, and age-appropriate activities.</p>
          </div>
          <div>
            <h3 className="font-semibold text-lg mb-2">How do I get to the departure port?</h3>
            <p className="text-gray-700">Most {cruiseLine.name} ships depart from major ports with good transport links. Check your specific sailing's departure port and book transfers through the cruise line or arrange independently. Arrive at least one day early to avoid travel delays affecting your embarkation.</p>
          </div>
          <div>
            <h3 className="font-semibold text-lg mb-2">Can I pre-book shore excursions?</h3>
            <p className="text-gray-700">Yes, {cruiseLine.name} allows pre-booking shore excursions online before your cruise, often at a discount. Popular excursions can sell out, so book early. Alternatively, you can book independently through local operators for potential savings, but ensure you allow enough time to return before all-aboard.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
