import { SearchResult } from "@ffxiv-teamcraft/types";

export interface DesynthSearchResult extends SearchResult {
  dlvl: number;
  score: number;
}
