import { ListRow } from '../modules/list/model/list-row';
import { LazyData } from './lazy-data';

export type LazyDataKey = keyof LazyData | 'extracts';

export type LazyDataWithExtracts = { [Property in keyof LazyData]: LazyData[Property] } & { extracts: Record<number, ListRow> };

export type LazyDataEntryElement<K extends LazyDataKey> =
  LazyDataWithExtracts[K] extends readonly (infer ElementType)[] ? ElementType :
    LazyDataWithExtracts[K] extends Record<string, infer RecordType> ? RecordType : never;
