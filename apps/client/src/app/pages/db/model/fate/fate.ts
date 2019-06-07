import { I18nName } from '../../../../model/common/i18n-name';

export interface Fate {
  name: I18nName;
  description: I18nName;
  icon: string;
  level: number;
  position?: {
    zoneid: number;
    x: number;
    y: number;
  }
}
