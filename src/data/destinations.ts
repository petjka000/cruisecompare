export interface DestinationData {
  name: string;
  slug: string;
  gradient: string;
  cruiseCount: number;
  fromPrice: number;
  tagline: string;
}

export const destinations: DestinationData[] = [
  {
    name: 'Mediterranean',
    slug: 'mediterranean',
    gradient: 'linear-gradient(135deg, #2E86C1 0%, #0A1B3D 100%)',
    cruiseCount: 340,
    fromPrice: 499,
    tagline: 'Ancient ruins, sun-drenched coastlines, world-class cuisine',
  },
  {
    name: 'Caribbean',
    slug: 'caribbean',
    gradient: 'linear-gradient(135deg, #1A8A7D 0%, #0A4F44 100%)',
    cruiseCount: 285,
    fromPrice: 389,
    tagline: 'Crystal waters, white sands, vibrant island culture',
  },
  {
    name: 'Alaska',
    slug: 'alaska',
    gradient: 'linear-gradient(135deg, #5DADE2 0%, #1B4F72 100%)',
    cruiseCount: 89,
    fromPrice: 549,
    tagline: 'Glaciers, wildlife, wilderness at the edge of the world',
  },
  {
    name: 'Northern Europe',
    slug: 'northern-europe',
    gradient: 'linear-gradient(135deg, #34698A 0%, #0A1B3D 100%)',
    cruiseCount: 142,
    fromPrice: 599,
    tagline: 'Fjords, historic capitals, midnight sun magic',
  },
  {
    name: 'Asia',
    slug: 'asia',
    gradient: 'linear-gradient(135deg, #D4A853 0%, #8B6914 100%)',
    cruiseCount: 98,
    fromPrice: 699,
    tagline: 'Ancient temples, bustling ports, extraordinary cuisine',
  },
  {
    name: 'South Pacific',
    slug: 'south-pacific',
    gradient: 'linear-gradient(135deg, #48D1CC 0%, #1A6B5F 100%)',
    cruiseCount: 76,
    fromPrice: 799,
    tagline: 'Remote islands, coral reefs, pristine waters',
  },
];
