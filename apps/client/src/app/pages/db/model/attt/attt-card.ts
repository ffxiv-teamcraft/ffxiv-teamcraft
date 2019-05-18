import { CardStats } from './card-stats';

export interface ATTTCard {
  id: number;
  sort_id: number;
  name: string;
  description: string;
  stars: number;
  patch: string;
  sell_price: number;
  icon: string;
  image: string;
  stats: CardStats;
  type: {
    id: number;
    name: string;
    image?: any;
  };
  owned: string;
  sources: {
    npcs: any[];
    pack?: any;
    drops: string[];
    purchase?: any;
  };
}
