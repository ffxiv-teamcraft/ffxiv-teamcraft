import { ItemSource } from './item-source';
import { LazyDataI18nKey } from '../../lazy-data-types';

export interface ExtractRow {
  id: number;
  sources: ItemSource[];
  contentType?: LazyDataI18nKey;
  xivapiIcon?: string;
}

export type Extracts = Record<number, ExtractRow>;

export function getExtract(extracts: Extracts, itemId: number): ExtractRow {
  return extracts[itemId] || { id: itemId, sources: [] };
}
