import { ExplorationType } from "@ffxiv-teamcraft/types";


export interface ExplorationResult {
  voyageId: number;
  itemId: number;
  hq: boolean;
  quantity: number;
  surveillanceProc: number;
  retrievalProc: number;
  favorProc: number;
  surveillance: number;
  retrieval: number;
  favor: number;
  type: ExplorationType;
}
