import {Injectable} from '@angular/core';
import {I18nName} from '../model/i18n-name';
import {TranslateService} from '@ngx-translate/core';

@Injectable()
export class I18nTools {

    constructor(private translator: TranslateService) {
    }

    public getName(i18nName: I18nName): string {
        return i18nName[this.translator.currentLang] || 'missing name';
    }

}
