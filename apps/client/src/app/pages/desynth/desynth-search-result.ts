import { SearchResult } from "@ffxiv-teamcraft/trpc-api";

export interface DesynthSearchResult extends SearchResult {
  dlvl: number;
  score: number;
}
