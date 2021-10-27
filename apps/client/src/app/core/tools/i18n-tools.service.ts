import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { I18nData } from '../../model/common/i18n-data';
import { I18nName } from '../../model/common/i18n-name';
import { I18nNameLazy } from '../../model/common/i18n-name-lazy';
import { CustomItem } from '../../modules/custom-items/model/custom-item';
import { Language } from '../data/language';
import { LazyDataFacade } from '../../lazy-data/+state/lazy-data.facade';
import { LazyDataI18nKey } from '../../lazy-data/lazy-data-types';
import { mapIds } from '../data/sources/map-ids';

@Injectable({ providedIn: 'root' })
export class I18nToolsService {
  private readonly defaultLang = 'en' as const;
  public readonly currentLang$: BehaviorSubject<Language> = new BehaviorSubject<Language>(this.defaultLang);

  constructor(private translator: TranslateService, private lazyData: LazyDataFacade) {
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

  public getNameObservable(entry: LazyDataI18nKey, id: number): Observable<string> {
    return this.currentLang$.pipe(
      switchMap(() => {
        return this.lazyData.getI18nName(entry, id).pipe(
          map(name => this.getName(name))
        );
      })
    );
  }

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

  public i18nToXivapi(value: I18nName, fieldName = 'Name') {
    return {
      [`${fieldName}_en`]: value.en,
      [`${fieldName}_fr`]: value.fr,
      [`${fieldName}_de`]: value.de,
      [`${fieldName}_ja`]: value.ja,
      [`${fieldName}_ko`]: value.ko || value.en,
      [`${fieldName}_chs`]: value.zh || value.en
    };
  }

  public xivapiToI18n(value: any, fieldName = 'Name'): I18nName {
    return {
      en: value[`${fieldName}_en`],
      fr: value[`${fieldName}_fr`],
      de: value[`${fieldName}_de`],
      ja: value[`${fieldName}_ja`],
      ko: value[`${fieldName}_ko`],
      zh: value[`${fieldName}_chs`]
    };
  }

  public getMapName(mapId: number): Observable<string> {
    const entry = mapIds.find((m) => m.id === mapId);
    return this.getNameObservable('places', entry.zone ?? 1);
  }

  public getActionName(id: number): Observable<string> {
    return this.lazyData.getRow('craftActions', id).pipe(
      switchMap(craftAction => {
        if (craftAction) {
          return of(craftAction);
        }
        return this.lazyData.getRow('actions', id);
      }),
      map(name => {
        if (!name) {
          throw new Error(`No action found for id ${id}`);
        }
        return this.getName(name);
      })
    );
  }
}
