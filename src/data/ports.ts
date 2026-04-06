export interface PortData {
  name: string;
  slug: string;
  country: string;
  flag: string;
  cruiseCount: number;
}

export const ports: PortData[] = [
  { name: 'Barcelona',           slug: 'barcelona',   country: 'Spain',   flag: '🇪🇸', cruiseCount: 142 },
  { name: 'Southampton',         slug: 'southampton', country: 'UK',      flag: '🇬🇧', cruiseCount: 98  },
  { name: 'Miami',               slug: 'miami',       country: 'USA',     flag: '🇺🇸', cruiseCount: 189 },
  { name: 'Rome (Civitavecchia)',slug: 'rome-civitavecchia', country: 'Italy', flag: '🇮🇹', cruiseCount: 87  },
  { name: 'Copenhagen',          slug: 'copenhagen',  country: 'Denmark', flag: '🇩🇰', cruiseCount: 64  },
  { name: 'Venice',              slug: 'venice',      country: 'Italy',   flag: '🇮🇹', cruiseCount: 71  },
  { name: 'New York',            slug: 'new-york',    country: 'USA',     flag: '🇺🇸', cruiseCount: 103 },
  { name: 'Marseille',           slug: 'marseille',   country: 'France',  flag: '🇫🇷', cruiseCount: 58  },
];
