import {Injectable} from '@angular/core';
import {I18nName} from '../model/list/i18n-name';
import {TranslateService} from '@ngx-translate/core';
import {I18nData} from '../model/list/i18n-data';

@Injectable()
export class I18nToolsService {

    constructor(private translator: TranslateService) {
    }

    public getName(i18nName: I18nName): string {
        return i18nName[this.translator.currentLang] || 'missing name';
    }

    public createI18nName(item: I18nData): I18nName {
        return {
            fr: item.fr.name,
            en: item.en.name,
            de: item.de.name,
            ja: item.ja.name,
        };
    }

}
