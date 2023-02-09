import { LazyData } from '@ffxiv-teamcraft/data/model/lazy-data';
import { I18nName } from './i18n-name';

export type LazyDataKey = keyof LazyData | 'extracts';

export interface XivapiI18nName {
  Name_en: string,
  Name_de: string,
  Name_ja: string,
  Name_fr: string
}

export type I18nElement = Record<number, (I18nName | { name: I18nName } | XivapiI18nName)>;

type LazyDataI18nEntries = { [K in keyof LazyData]: LazyData[K] extends I18nElement ? K : never }[keyof LazyData];

export type LazyDataI18nKey = keyof Pick<LazyData, LazyDataI18nEntries>;



