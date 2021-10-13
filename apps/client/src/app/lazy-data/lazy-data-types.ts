import { ListRow } from '../modules/list/model/list-row';
import { LazyData } from './lazy-data';
import { I18nName } from '../model/common/i18n-name';

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
    LazyDataWithExtracts[K] extends Record<string, infer RecordType> ? RecordType : never;

export type LazyDataEntries = { [K in LazyDataKey]: LazyDataEntryElement<K> };

//TODO: Better typing to make it fail if the key doesn't match an i18n registry
export type LazyDataI18nEntries = { [K in keyof LazyData]: LazyData[K] extends Record<string, (I18nName | { name: I18nName } | XivapiI18nName)> ? K : never };

// Code to test the above (should trigger an error since craftingLog is a number[][])
// const test: keyof LazyDataI18nEntries = 'craftingLog';



