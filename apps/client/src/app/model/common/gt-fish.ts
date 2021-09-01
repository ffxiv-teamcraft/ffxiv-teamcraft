export interface GtFish {
  name: string;
  patch: number;
  bait: string[];
  id: number;
  icon: number;
  func: string;
  rarity: number;
  title: string;
  category: string;
  lvl: number;
  coords: [
    number,
    number
  ];
  radius: number;
  zone: string;
  spot: number;
  during?: {
    start: number;
    end: number
  };
  weather?: string[];
  transition?: string[];
  predator?: {
    name: string;
    predatorAmount: number;
    bait: string[];
    id: number;
    icon: number;
  }[];
  snagging?: 1;
  hookset?: 'Powerful Hookset' | 'Precision Hookset';
  tug?: 'Medium' | 'Light' | 'Heavy';
}
