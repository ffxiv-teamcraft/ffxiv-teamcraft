export interface SatisfactionData {
  level: number;
  npc: number;
  probability: number;
  rating: number[];
  satisfaction: number[];
  gil: number[];
  items: { id: number, amount: number[] }[];
}
