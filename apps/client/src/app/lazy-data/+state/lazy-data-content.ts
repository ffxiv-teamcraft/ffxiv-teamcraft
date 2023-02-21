import { LazyDataKey, LazyDataWithExtracts } from '@ffxiv-teamcraft/types';

export interface LazyDataContent<K extends LazyDataKey> {
  status: 'full' | 'partial';
  ids: Array<string | number | symbol>;
  content: Partial<LazyDataWithExtracts[K]>;
}
