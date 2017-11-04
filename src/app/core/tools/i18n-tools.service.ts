import {Injectable} from '@angular/core';
import {I18nName} from '../../model/list/i18n-name';
import {TranslateService} from '@ngx-translate/core';
import {I18nData} from '../../model/list/i18n-data';
import {Partial} from '../../model/garland-tools/partial';

@Injectable()
export class I18nToolsService {

    constructor(private translator: TranslateService) {
    }

    public getName(i18nName: I18nName): string {
        if (i18nName === undefined) {
            return 'missing name';
        }
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

    public createI18nNameFromPartial(item: Partial): I18nName {
        return {
            fr: item.obj.fr.n,
            en: item.obj.en.n,
            de: item.obj.de.n,
            ja: item.obj.ja.n,
        };
    }

}
