import { ListRow } from '../modules/list/model/list-row';
import { LazyData } from '@ffxiv-teamcraft/data/model/lazy-data';

export type LazyDataKey = keyof LazyData | 'extracts';

export type LazyDataWithExtracts = { [Property in keyof LazyData]: LazyData[Property] } & { extracts: Record<number, ListRow> };

export interface XivapiI18nName {
  Name_en: string,
  Name_de: string,
  Name_ja: string,
  Name_fr: string
}

type LazyDataEntryElement<K extends LazyDataKey> =
  LazyDataWithExtracts[K] extends readonly (infer ElementType)[] ? ElementType :
    LazyDataWithExtracts[K] extends Record<number, infer RecordType> ? RecordType : never;

export type LazyDataEntries = { [K in LazyDataKey]: LazyDataEntryElement<K> };

type LazyDataRecordEntries = { [K in LazyDataKey]: LazyDataWithExtracts[K] extends Array<any> ? never : K }[LazyDataKey];

export type LazyDataRecordKey = keyof Pick<LazyDataWithExtracts, LazyDataRecordEntries>;



