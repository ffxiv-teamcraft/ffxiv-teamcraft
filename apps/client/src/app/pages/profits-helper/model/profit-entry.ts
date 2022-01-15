export interface ProfitEntry {
  id: string;
  crafting: boolean;
  gathering: boolean;
  complexity: number;
  cost: number;
  total: number;
  profit: {
    c: number;
    c10: number;
    c20: number;
  };
  v24: number;
  v48: number;
  levelReqs: number[];
  updated: number;
}
