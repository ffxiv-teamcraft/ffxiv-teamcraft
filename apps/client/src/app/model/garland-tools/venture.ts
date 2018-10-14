export interface Venture {
  id: number;
  job: number;
  jobs: number;
  lvl: number;
  cost: number;
  minutes: number;
  gathering?: number[];
  ilvl?: number[];
  amounts: number[];
  amountsDetails?: any[];
  name?: string;
}
