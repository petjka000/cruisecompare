export interface PlaceholderDeal {
  slug: string;
  title: string;
  cruise_line: string;
  destination: string;
  departure_port: string;
  duration_nights: number;
  price_eur: number;
  original_price_eur: number;
  discount_pct: number;
  excerpt: string;
  isPlaceholder: true;
}

export const placeholderDeals: PlaceholderDeal[] = [
  {
    slug: 'msc-mediterranean-7-night-from-499',
    title: 'MSC Mediterranean 7-Night from €499',
    cruise_line: 'MSC Cruises',
    destination: 'Mediterranean',
    departure_port: 'Genoa',
    duration_nights: 7,
    price_eur: 499,
    original_price_eur: 749,
    discount_pct: 33,
    excerpt: 'Visit Barcelona, Marseille, Valencia, and Palermo on this classic Mediterranean round-trip.',
    isPlaceholder: true,
  },
  {
    slug: 'royal-caribbean-canary-islands-10-night-from-699',
    title: 'Royal Caribbean Canary Islands 10-Night from €699',
    cruise_line: 'Royal Caribbean',
    destination: 'Canary Islands',
    departure_port: 'Southampton',
    duration_nights: 10,
    price_eur: 699,
    original_price_eur: 999,
    discount_pct: 30,
    excerpt: 'Sun, sand, and volcanic landscapes across Tenerife, Gran Canaria, and Lanzarote.',
    isPlaceholder: true,
  },
  {
    slug: 'costa-adriatic-cruise-8-night-from-579',
    title: 'Costa Adriatic Cruise 8-Night from €579',
    cruise_line: 'Costa Cruises',
    destination: 'Adriatic',
    departure_port: 'Venice',
    duration_nights: 8,
    price_eur: 579,
    original_price_eur: 819,
    discount_pct: 29,
    excerpt: 'Explore Dubrovnik, Corfu, Kotor, and Bari on a scenic Adriatic voyage.',
    isPlaceholder: true,
  },
  {
    slug: 'norwegian-fjords-cruise-7-night-from-649',
    title: 'Norwegian Fjords 7-Night from €649',
    cruise_line: 'Norwegian Cruise Line',
    destination: 'Northern Europe',
    departure_port: 'Copenhagen',
    duration_nights: 7,
    price_eur: 649,
    original_price_eur: 899,
    discount_pct: 28,
    excerpt: 'Sail through the stunning Geirangerfjord and Hardangerfjord, with stops in Bergen and Flåm.',
    isPlaceholder: true,
  },
];
