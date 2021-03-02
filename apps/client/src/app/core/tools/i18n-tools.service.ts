import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, of } from 'rxjs';
import { Observable } from 'rxjs/Observable';
import { map, switchMap } from 'rxjs/operators';
import { I18nData } from '../../model/common/i18n-data';
import { I18nName } from '../../model/common/i18n-name';
import { I18nNameLazy } from '../../model/common/i18n-name-lazy';
import { CustomItem } from '../../modules/custom-items/model/custom-item';
import { Language } from '../data/language';

@Injectable({ providedIn: 'root' })
export class I18nToolsService {
  private readonly defaultLang = 'en' as const;
  public readonly currentLang$: BehaviorSubject<Language> = new BehaviorSubject<Language>(this.defaultLang);

  constructor(private translator: TranslateService) {
    // I know, subscriptions are devil, but since we're inside a `providedIn: "root"` service, we know only one instance of this will run at a time, meaning
    // No memory leaks :)
    this.translator.onLangChange.subscribe(ev => this.currentLang$.next(ev.lang as Language));
  }

  public resolveName = (i18nName: I18nNameLazy): Observable<string | undefined> => {
    return this.currentLang$.pipe(
      switchMap((lang) => {
        return i18nName[lang] ?? i18nName[this.defaultLang] ?? of(undefined);
      })
    );
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
      ko: str
    };
  }

  public createI18nName(item: I18nData): I18nName {
    return {
      fr: item.fr.name,
      en: item.en.name,
      de: item.de.name,
      ja: item.ja.name,
      zh: item.zh.name,
      ko: item.ko.name
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
