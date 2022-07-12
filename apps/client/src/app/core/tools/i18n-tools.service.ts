import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, combineLatest, Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { I18nData } from '../../model/common/i18n-data';
import { I18nName } from '../../model/common/i18n-name';
import { I18nNameLazy } from '../../model/common/i18n-name-lazy';
import { CustomItem } from '../../modules/custom-items/model/custom-item';
import { Language } from '../data/language';
import { LazyDataFacade } from '../../lazy-data/+state/lazy-data.facade';
import { LazyDataI18nKey } from '../../lazy-data/lazy-data-types';
import { mapIds } from '../data/sources/map-ids';
import { withLazyData } from '../rxjs/with-lazy-data';

@Injectable({ providedIn: 'root' })
export class I18nToolsService {
  private readonly defaultLang = 'en' as const;

  public readonly currentLang$: BehaviorSubject<Language> = new BehaviorSubject<Language>(this.defaultLang);

  constructor(private translator: TranslateService, private lazyData: LazyDataFacade) {
    // I know, subscriptions are devil, but since we're inside a `providedIn: "root"` service, we know only one instance of this will run at a time, meaning
    // No memory leaks :)
    this.translator.onLangChange.subscribe(ev => this.currentLang$.next(ev.lang as Language));
  }

  public use(lang: Language): void {
    this.currentLang$.next(lang);
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
    if (!i18nName) {
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
    return this.getNameObservable('places', entry?.zone || 1);
  }

  public getActionName(id: number): Observable<string> {
    return this.lazyData.getI18nName('craftActions', id).pipe(
      switchMap(craftAction => {
        if (craftAction) {
          return of(craftAction);
        }
        return this.lazyData.getI18nName('actions', id);
      }),
      map(name => {
        if (!name) {
          throw new Error(`No action found for id ${id}`);
        }
        return this.getName(name);
      })
    );
  }

  public getCraftingActionIdByName(name: string, language: Language): Observable<number> {
    let name$ = of(name);
    if (language === 'ko') {
      name$ = this.getEnActionFromKoActionName(name).pipe(
        map(koName => {
          if (koName) {
            language = 'en';
            return koName.en;
          }
          return name;
        })
      );
    }
    return name$.pipe(
      withLazyData(this.lazyData, 'craftActions', 'actions'),
      map(([baseName, craftActions, actions]) => {
        let res = this.getIndexByName(craftActions, baseName, language, true);
        if (res === -1) {
          res = this.getIndexByName(actions, baseName, language, true);
        }
        if (res === -1) {
          throw new Error('Data row not found.');
        }
        return res;
      })
    );
  }

  public getIndexByName(array: any, name: string, language: string, flip = false): number {
    if (array === undefined) {
      return -1;
    }
    if (['en', 'fr', 'de', 'ja', 'ko', 'zh'].indexOf(language) === -1) {
      language = 'en';
    }
    let res = -1;
    let keys = Object.keys(array);
    if (flip) {
      keys = keys.reverse();
    }
    const cleanupRegexp = /[^a-z\s,\u3000-\u303F\u3040-\u309F\u30A0-\u30FF\uFF00-\uFFEF\u4E00-\u9FAF\u2605-\u2606\u2190-\u2195\u3041-\u3096\u2E80-\u2FD5]/;
    for (const key of keys) {
      if (!array[key]) {
        continue;
      }
      if (array[key].name && array[key].name[language].toString().toLowerCase().replace(cleanupRegexp, '-') === name.toLowerCase().replace(cleanupRegexp, '-')) {
        res = +key;
        break;
      }
      if (array[key][language] && array[key][language].toString().toLowerCase().replace(cleanupRegexp, '-') === name.toLowerCase().replace(cleanupRegexp, '-')) {
        res = +key;
        break;
      }
    }
    if (['ko', 'zh'].indexOf(language) > -1 && res === -1) {
      return this.getIndexByName(array, name, 'en');
    }
    return res;
  }

  private getEnActionFromKoActionName(name: string): Observable<I18nName | null> {
    return combineLatest([
      this.lazyData.getEntry('koCraftActions'),
      this.lazyData.getEntry('koActions'),
      this.lazyData.getEntry('craftActions'),
      this.lazyData.getEntry('actions')
    ]).pipe(
      map(([koCraftActions, koActions, craftActions, actions]) => {
        const craftActionId = Object.keys(koCraftActions).reverse().find(
          (key) => koCraftActions[key].ko.toLowerCase() === name.toLowerCase()
        );
        if (craftActionId) {
          return craftActions[craftActionId];
        }
        const actionId = Object.keys(koActions).find((key) => koActions[key].ko.toLowerCase() === name.toLowerCase());
        if (actionId) {
          return actions[actionId];
        }
        return null;
      })
    );
  }
}
