import { I18nName, XivapiI18nName } from '@ffxiv-teamcraft/types';

export function normalizeI18nName(row: I18nName | { name: I18nName } | XivapiI18nName): I18nName {
  if ((row as I18nName).en !== undefined || (row as I18nName).zh !== undefined || (row as I18nName).ko !== undefined) {
    return row as I18nName;
  }
  if ((row as { name: I18nName }).name) {
    return (row as { name: I18nName }).name;
  }
  if ((row as XivapiI18nName).Name_en) {
    return {
      en: (row as XivapiI18nName).Name_en,
      ja: (row as XivapiI18nName).Name_ja,
      de: (row as XivapiI18nName).Name_de,
      fr: (row as XivapiI18nName).Name_fr
    };
  }
  throw new Error(`Trying to normalize something that's not an i18n name: ${JSON.stringify(row)}`);
}
