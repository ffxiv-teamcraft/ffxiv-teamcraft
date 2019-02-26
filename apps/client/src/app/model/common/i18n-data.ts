import { I18nDataRow } from './i18n-data-row';

export interface I18nData {
  fr: I18nDataRow;
  en: I18nDataRow;
  de: I18nDataRow;
  ja: I18nDataRow;
  ko?: I18nDataRow;
  zh?: I18nDataRow;
}
