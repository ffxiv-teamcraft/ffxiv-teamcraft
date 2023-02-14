import { LazyData } from '@ffxiv-teamcraft/data/model/lazy-data';
import { I18nName } from './i18n-name';
import { Extracts } from './list/extracts/extracts';

export type LazyDataKey = keyof LazyData | 'extracts';

export type LazyDataWithExtracts = { [Property in keyof LazyData]: LazyData[Property] } & { extracts: Extracts };

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

export type I18nElement = Record<number, (I18nName | { name: I18nName } | XivapiI18nName)>;

type LazyDataI18nEntries = { [K in keyof LazyData]: LazyData[K] extends I18nElement ? K : never }[keyof LazyData];

export type LazyDataI18nKey = keyof Pick<LazyData, LazyDataI18nEntries>;



