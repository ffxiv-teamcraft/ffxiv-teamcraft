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

type I18nElement = Record<number, (I18nName | { name: I18nName } | XivapiI18nName)>;

type LazyDataEntryElement<K extends LazyDataKey> =
  LazyDataWithExtracts[K] extends readonly (infer ElementType)[] ? ElementType :
    LazyDataWithExtracts[K] extends Record<number, infer RecordType> ? RecordType : never;

export type LazyDataEntries = { [K in LazyDataKey]: LazyDataEntryElement<K> };

type LazyDataI18nEntries = { [K in keyof LazyData]: LazyData[K] extends I18nElement ? K : never }[keyof LazyData];

export type LazyDataI18nKey = keyof Pick<LazyData, LazyDataI18nEntries>;



