import { ItemSource } from './item-source';

export interface ExtractRow {
  id: number,
  sources: ItemSource[]
}

export type Extracts = Record<number, ExtractRow>;

export function getExtract(extracts: Extracts, itemId: number): ExtractRow {
  return extracts[itemId] || { id: itemId, sources: [] };
}
