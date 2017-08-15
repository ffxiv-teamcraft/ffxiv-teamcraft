import {Inject, Injectable, LOCALE_ID} from '@angular/core';
import {I18nName} from '../model/i18n-name';

@Injectable()
export class I18nTools {

    constructor(@Inject(LOCALE_ID) private locale: string) {
    }

    public getName(i18nName: I18nName): string {
        return i18nName[this.locale.split('-')[0]] || 'missing name';
    }

}
