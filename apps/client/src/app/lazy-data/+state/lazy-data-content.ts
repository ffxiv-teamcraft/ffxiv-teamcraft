import { LazyDataKey, LazyDataWithExtracts } from '@ffxiv-teamcraft/types';

export interface LazyDataContent<K extends LazyDataKey> {
  status: 'full' | 'partial';
  content: Partial<LazyDataWithExtracts[K]>;
}
