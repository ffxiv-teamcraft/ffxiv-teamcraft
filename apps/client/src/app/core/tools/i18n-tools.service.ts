import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { from, of } from 'rxjs';
import { Observable } from 'rxjs/Observable';
import { map, startWith, switchMap } from 'rxjs/operators';
import { I18nData } from '../../model/common/i18n-data';
import { I18nName } from '../../model/common/i18n-name';
import { I18nNameLazy } from '../../model/common/i18n-name-lazy';
import { CustomItem } from '../../modules/custom-items/model/custom-item';
import { Language } from '../data/language';

@Injectable()
export class I18nToolsService {
  public readonly currentLang$: Observable<Language> = from(this.translator.onLangChange as Observable<{ lang: Language }>).pipe(
    map((ev) => ev.lang),
    startWith((this.translator.currentLang as Language) ?? 'en')
  );

  constructor(private translator: TranslateService) {}

  public resolveName = (i18nName: I18nNameLazy): Observable<string | undefined> => {
    return this.currentLang$.pipe(switchMap((lang) => i18nName[lang] ?? of(undefined)));
  };

  public getName(i18nName: I18nName, item?: CustomItem): string {
    if (i18nName === undefined) {
      if (item !== undefined && item.name !== undefined) {
        return item.name;
      }
      return 'missing name';
    }
    return (i18nName[this.translator.currentLang] || i18nName.en || 'no name').replace('', '•');
  }

  public createFakeI18n(str: string): I18nName {
    return {
      fr: str,
      en: str,
      de: str,
      ja: str,
      zh: str,
      ko: str,
    };
  }

  public createI18nName(item: I18nData): I18nName {
    return {
      fr: item.fr.name,
      en: item.en.name,
      de: item.de.name,
      ja: item.ja.name,
      zh: item.zh.name,
      ko: item.ko.name,
    };
  }

  public getTranslation(key: string, language: string, interpolationParams?: Object): Observable<string> {
    return this.translator.getTranslation(language).pipe(
      map((translations) => {
        return this.translator.getParsedResult(translations, key, interpolationParams);
      })
    );
  }
}
