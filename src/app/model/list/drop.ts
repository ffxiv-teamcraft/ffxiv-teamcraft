import {I18nName} from './i18n-name';
export interface Drop {
    id: number;
    name: string;
    zoneId: number;
    lvl: string;
    drops: I18nName[];
}
