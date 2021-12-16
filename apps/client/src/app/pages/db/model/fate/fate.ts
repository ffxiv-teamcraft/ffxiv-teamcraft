import { I18nName } from '../../../../model/common/i18n-name';

export interface Fate {
  name: I18nName;
  description: I18nName;
  icon: string;
  level: number;
  position?: {
    map: number;
    zoneid: number;
    x: number;
    y: number;
    z: number;
  };
}
