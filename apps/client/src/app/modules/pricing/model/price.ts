export interface Price {
  nq: number;
  nqServer?: string;
  hq: number;
  hqServer?: string;
  fromVendor: boolean;
  fromMB: boolean;
  updated?: number;
}
