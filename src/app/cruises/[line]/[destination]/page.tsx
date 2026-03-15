import { notFound } from 'next/navigation';
import cruiseData from '@/data/generated/cruises/royal-caribbean-caribbean.json';

// Static data for build time
const cruiseLines = [
  { slug: 'royal-caribbean', name: 'Royal Caribbean' },
  { slug: 'carnival', name: 'Carnival' },
  { slug: 'norwegian', name: 'Norwegian' },
  { slug: 'msc', name: 'MSC' },
  { slug: 'celebrity', name: 'Celebrity' },
  { slug: 'princess', name: 'Princess' },
];

const destinations = [
  { slug: 'caribbean', name: 'Caribbean' },
  { slug: 'mediterranean', name: 'Mediterranean' },
  { slug: 'norwegian-fjords', name: 'Norwegian Fjords' },
  { slug: 'alaska', name: 'Alaska' },
  { slug: 'baltic', name: 'Baltic' },
];

export async function generateStaticParams() {
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
}

export default async function CruisePage({
  params,
}: {
  params: Promise<{ line: string; destination: string }>;
}) {
  const { line, destination } = await params;
  
  // For now, use static data
  // In production, this would load from the generated JSON
  const data = cruiseData as any;
  
  if (!data) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-4">{data.title || `${line} ${destination} Cruises`}</h1>
      <p className="text-lg mb-6">{data.intro}</p>
      
      <div className="bg-gray-100 p-6 rounded-lg mb-8">
        <h2 className="text-xl font-semibold mb-4">Quick Facts</h2>
        <p><strong>Price from:</strong> €{data.quick_facts?.price_from_eur || 'N/A'}</p>
        <p><strong>Duration:</strong> {data.quick_facts?.duration_range || 'N/A'}</p>
      </div>
      
      <h2 className="text-2xl font-semibold mb-4">Frequently Asked Questions</h2>
      {data.faqs?.map((faq: any, i: number) => (
        <div key={i} className="mb-6 border-l-4 border-blue-500 pl-4">
          <h3 className="font-semibold text-lg mb-2">{faq.question}</h3>
          <p>{faq.answer}</p>
        </div>
      ))}
    </div>
  );
}
