export interface CruiseLineData {
  name: string;
  slug: string;
  accentColor: string;
  shipCount: number;
  minPricePerNight: number;
  description: string;
  priceTier: 'budget' | 'mid' | 'premium' | 'luxury';
}

export const cruiseLines: CruiseLineData[] = [
  {
    name: 'Royal Caribbean',
    slug: 'royal-caribbean',
    accentColor: '#003087',
    shipCount: 28,
    minPricePerNight: 71,
    description: 'Adventure cruises with record-breaking ships and thrilling onboard experiences',
    priceTier: 'mid',
  },
  {
    name: 'MSC Cruises',
    slug: 'msc',
    accentColor: '#002855',
    shipCount: 22,
    minPricePerNight: 52,
    description: 'Mediterranean elegance with extensive European itineraries and value fares',
    priceTier: 'mid',
  },
  {
    name: 'Norwegian Cruise Line',
    slug: 'norwegian',
    accentColor: '#00205B',
    shipCount: 19,
    minPricePerNight: 79,
    description: 'Freestyle cruising with flexible dining and no set schedules',
    priceTier: 'mid',
  },
  {
    name: 'Carnival',
    slug: 'carnival',
    accentColor: '#C41230',
    shipCount: 24,
    minPricePerNight: 59,
    description: 'The Fun Ship experience — laid-back atmosphere with great value',
    priceTier: 'budget',
  },
  {
    name: 'Princess Cruises',
    slug: 'princess',
    accentColor: '#003F87',
    shipCount: 17,
    minPricePerNight: 89,
    description: 'Discovery cruising with enriching destination experiences worldwide',
    priceTier: 'mid',
  },
  {
    name: 'Costa Cruises',
    slug: 'costa',
    accentColor: '#003E78',
    shipCount: 12,
    minPricePerNight: 55,
    description: 'European-style cruising with Italian flair across the Mediterranean',
    priceTier: 'mid',
  },
  {
    name: 'Viking Ocean',
    slug: 'viking',
    accentColor: '#14284B',
    shipCount: 10,
    minPricePerNight: 199,
    description: 'Destination-focused cruises for curious travellers — adults only, all-inclusive',
    priceTier: 'luxury',
  },
  {
    name: 'Celebrity Cruises',
    slug: 'celebrity',
    accentColor: '#1E3366',
    shipCount: 15,
    minPricePerNight: 109,
    description: 'Modern luxury with award-winning cuisine and design-forward ships',
    priceTier: 'premium',
  },
];
