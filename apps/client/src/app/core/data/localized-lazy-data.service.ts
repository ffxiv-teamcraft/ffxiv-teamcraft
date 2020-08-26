import { Injectable } from '@angular/core';
import { get } from 'lodash';
import { Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { I18nLazy, I18nNameLazy } from '../../model/common/i18n-name-lazy';
import { Fate } from '../../pages/db/model/fate/fate';
import { ExtendedLanguageKeys } from './extended-language-keys';
import { Language } from './language';
import { LazyDataKey } from './lazy-data';
import { LazyDataProviderService } from './lazy-data-provider.service';
import { lazyFilesList } from './lazy-files-list';
import { mapIds } from './sources/map-ids';
import { zhWorlds } from './sources/zh-worlds';

@Injectable({ providedIn: 'root' })
export class LocalizedLazyDataService {
  private readonly dataKeys = new Set(Object.keys(lazyFilesList));
  private readonly indentRegexp = new RegExp('<Indent/>', 'i');

  constructor(private lazyDataProvider: LazyDataProviderService) {}

  private getResolver(key: LazyDataKey, accessor: number | string, lang: Language): Observable<string | undefined> {
    return this.lazyDataProvider.getLazyData(key).pipe(
      map((data) => {
        if (!get(data, accessor)) console.warn(`Lazy data could not be resolved for key [${key}], accessor [${accessor}]`);
        const baseValue = get(data, `${accessor}.${lang}`, undefined);
        if (lang === 'fr') return baseValue?.replace(this.indentRegexp, '');
        return baseValue;
      })
    );
  }

  private getFallbackResolver(extKey: LazyDataKey | undefined, fallbackKey: LazyDataKey, accessor: number | string, lang: Language) {
    const fallbackResolver = this.getResolver(fallbackKey, accessor, lang).pipe(
      switchMap((val) => (val ? of(val) : this.getResolver(fallbackKey, accessor, 'en')))
    );
    return of(extKey).pipe(
      switchMap((key) => {
        if (!key) return fallbackResolver;
        return this.getResolver(extKey, accessor, lang).pipe(switchMap((val) => (val ? of(val) : fallbackResolver)));
      })
    );
  }

  private getRow(key: LazyDataKey, accessor: number | string): I18nNameLazy {
    const { koKey, ruKey, zhKey } = this.guessExtendedLanguageKeys(key);

    return {
      de: this.getResolver(key, accessor, 'de'),
      en: this.getResolver(key, accessor, 'en'),
      fr: this.getResolver(key, accessor, 'fr'),
      ja: this.getResolver(key, accessor, 'ja'),
      ko: this.getFallbackResolver(koKey, key, accessor, 'ko'),
      ru: this.getFallbackResolver(ruKey, key, accessor, 'ru'),
      zh: this.getFallbackResolver(zhKey, key, accessor, 'zh'),
    };
  }

  private guessExtendedLanguageKeys(key: LazyDataKey): ExtendedLanguageKeys {
    return {
      zhKey: this.guessExtendedLanguageKey('zh', key),
      koKey: this.guessExtendedLanguageKey('ko', key),
      ruKey: this.guessExtendedLanguageKey('ko', key),
    };
  }

  private guessExtendedLanguageKey(language: string, key: string): LazyDataKey | undefined {
    const guessKey = `${language}${key.charAt(0).toUpperCase()}${key.substr(1)}`;
    if (this.isLazyDataKey(guessKey)) {
      return guessKey;
    }

    return undefined;
  }

  public getWorldName(world: string): I18nNameLazy {
    const i18nName: I18nNameLazy = {
      fr: of(world),
      en: of(world),
      de: of(world),
      ja: of(world),
      zh: of(zhWorlds[world]),
      ko: of(undefined),
      ru: of(undefined),
    };

    return i18nName;
  }

  public getItem(id: number): I18nNameLazy {
    return this.getRow('items', id);
  }

  public getInstanceName(id: number): I18nNameLazy {
    return this.getRow('instances', id);
  }

  public getAchievementName(id: number): I18nNameLazy {
    return this.getRow('achievements', id);
  }

  public getMapByName(name: string): I18nNameLazy {
    const id = this.getMapId(name);
    return this.getMapName(id);
  }

  public getMapName(id: number): I18nNameLazy {
    const entry = mapIds.find((m) => m.id === id);
    return this.getPlace(entry ? entry.zone : 1);
  }

  public getPlace(id: number): I18nNameLazy {
    return this.getRow('places', id);
  }

  public getFate(id: number): Observable<I18nLazy<Fate>> {
    const name = this.getRow('fates', `${id}.name`);
    const description = this.getRow('fates', `${id}.description`);
    return this.lazyDataProvider.getLazyData('fates').pipe(
      map((fates) => {
        return { ...fates[id], name, description };
      })
    );
  }

  // TODO:
  // public getNpc(id: number): Npc {
  //   return this.getRowWithExtendedLanguage<Npc>('npcs', id);
  // }

  public getLeve(id: number): I18nNameLazy {
    return this.getRow('leves', id);
  }

  public getShopName(englishName: string): I18nNameLazy {
    const resolver = (lang: Language, extKey?: LazyDataKey) =>
      this.lazyDataProvider.getLazyData('shops').pipe(
        switchMap((shops) => {
          const id = +Object.keys(shops).find((k) => shops[k].en === englishName);
          if (extKey) return this.getFallbackResolver(extKey, 'shops', id, lang);
          return this.getResolver('shops', id, lang);
        })
      );
    return {
      en: resolver('en'),
      de: resolver('de'),
      ja: resolver('ja'),
      fr: resolver('fr'),
      ko: resolver('ko', 'koShops'),
      ru: resolver('ru', 'ruShops' as any),
      zh: resolver('zh', 'zhShops'),
    };
  }

  // TODO:
  // public getJobName(id: number): I18nName {
  //   const row = this.getRow(this.lazyData.data.jobName, id);
  //   this.tryFillExtendedLanguage(row, id, { zhKey: 'zhJobName', koKey: 'koJobName' });

  //   return row;
  // }

  // TODO:
  // public getJobAbbr(id: number): I18nName {
  //   const row = this.getRow(this.lazyData.data.jobAbbr, id);
  //   this.tryFillExtendedLanguage(row, id, { zhKey: 'zhJobAbbr', koKey: 'koJobAbbr' });

  //   return row;
  // }

  // TODO:
  // public getMob(id: number): I18nName {
  //   return this.getRowWithExtendedLanguage('mobs', id);
  // }

  // TODO:
  // public getMobId(name: string): number {
  //   return +Object.keys(this.lazyData.data.mobs).find((k) => this.lazyData.data.mobs[k].en.toLowerCase() === name.toLowerCase());
  // }

  // TODO:
  // public getVenture(id: number): I18nName {
  //   return this.getRow(this.lazyData.data.ventures, id);
  // }

  // TODO:
  // public getQuest(id: number): Quest {
  //   const row = this.getRow<Quest>(this.lazyData.data.quests, id);
  //   this.tryFillExtendedLanguage(row.name, id, this.guessExtendedLanguageKeys('quests'));

  //   return row;
  // }

  // TODO:
  // public getTrait(id: number): Trait {
  //   const row = this.getRowWithExtendedLanguage<Trait>('traits', id);
  //   if (row && row.description) {
  //     this.tryFillExtendedLanguage(row.description, id, { zhKey: 'zhTraitDescriptions', koKey: 'koTraitDescriptions' });
  //   }

  //   return row;
  // }

  public getRaceName(id: number): I18nNameLazy {
    return this.getRow('races', id);
  }

  // TODO:
  // public getTribeName(id: number): any {
  //   const lazyRow = this.getRow<any>(this.lazyData.data.tribes, id);
  //   const row = {
  //     en: lazyRow.Name_en,
  //     de: lazyRow.Name_de,
  //     ja: lazyRow.Name_ja,
  //     fr: lazyRow.Name_fr,
  //   };
  //   this.tryFillExtendedLanguage(row, id, { zhKey: 'zhTribes', koKey: 'koTribes' });
  //   return row;
  // }

  // TODO:
  // public getTTRule(id: number): I18nName {
  //   const row = this.getRow<{ name: I18nName }>(tripleTriadRules, id);
  //   this.tryFillExtendedLanguage(row.name, id, { zhKey: 'zhTripleTriadRules', koKey: 'koTripleTriadRules' });

  //   return row.name;
  // }

  // TODO:
  // public getBaseParamName(id: number): I18nName {
  //   const lazyRow = this.getRow<any>(this.lazyData.data.baseParams, id);
  //   const row = {
  //     en: lazyRow.Name_en,
  //     de: lazyRow.Name_de,
  //     ja: lazyRow.Name_ja,
  //     fr: lazyRow.Name_fr,
  //   };
  //   this.tryFillExtendedLanguage(row, id, { zhKey: 'zhBaseParams', koKey: 'koBaseParams' });

  //   return row;
  // }

  public getWeather(id: number): I18nNameLazy {
    return this.getRow('weathers', `${id}.name`);
  }

  // TODO:
  // public getWeatherId(name: string): number {
  //   return this.getIndexByName(this.lazyData.data.weathers, name, 'en');
  // }

  // TODO:
  // public getAreaIdByENName(name: string): number {
  //   return this.getIndexByName(this.lazyData.data.places, name, 'en');
  // }

  // TODO:
  // public getFreeCompanyAction(id: number): I18nName {
  //   const row = this.getRow(freeCompanyActions, id);
  //   this.tryFillExtendedLanguage(row, id, { zhKey: 'zhFreeCompanyActions', koKey: 'koFreeCompanyActions' });

  //   return row;
  // }

  private getMapId(name: string): number {
    const result = mapIds.find((m) => m.name === name);
    if (result === undefined) {
      if (name === 'Gridania') {
        return 2;
      }
      if (name.startsWith('Eulmore - ')) {
        return 498;
      }
      // Diadem
      if (name === 'The Diadem') {
        return 538;
      }
      return -1;
    }
    return result.id;
  }

  // TODO:
  // public getCraftingActionIdByName(name: string, language: Language): number {
  //   if (language === 'ko') {
  //     const enRow = this.getEnActionFromKoActionName(name);
  //     if (enRow) {
  //       name = enRow.en;
  //       language = 'en';
  //     }
  //   }
  //   let res = this.getIndexByName(this.lazyData.data.craftActions, name, language, true);
  //   if (res === -1) {
  //     res = this.getIndexByName(this.lazyData.data.actions, name, language, true);
  //   }
  //   if (res === -1) {
  //     throw new Error('Data row not found.');
  //   }
  //   return res;
  // }

  // TODO:
  // private getEnActionFromKoActionName(name: string): I18nName {
  //   const craftActionId = Object.keys(this.lazyData.data.koCraftActions).find(
  //     (key) => this.lazyData.data.koCraftActions[key].ko.toLowerCase() === name.toLowerCase()
  //   );
  //   if (craftActionId) {
  //     return this.lazyData.data.craftActions[craftActionId];
  //   }
  //   const actionId = Object.keys(this.lazyData.data.koActions).find((key) => this.lazyData.data.koActions[key].ko.toLowerCase() === name.toLowerCase());
  //   if (actionId) {
  //     return this.lazyData.data.actions[actionId];
  //   }
  //   return null;
  // }

  // TODO:
  // public getCraftingActionByName(name: string, language: Language): I18nName {
  //   const koData: any[] = Object.values({ ...this.lazyData.data.koActions, ...this.lazyData.data.koCraftActions });
  //   if (language === 'ko') {
  //     const enRow = this.getEnActionFromKoActionName(name);
  //     if (enRow) {
  //       name = enRow.en;
  //       language = 'en';
  //     }
  //   }
  //   if (language === 'zh') {
  //     const zhRow = zhActions.find((a) => a.zh === name);
  //     if (zhRow !== undefined) {
  //       name = zhRow.en;
  //       language = 'en';
  //     }
  //   }
  //   let resultIndex = this.getIndexByName(this.lazyData.data.craftActions, name, language);
  //   if (resultIndex === -1) {
  //     resultIndex = this.getIndexByName(this.lazyData.data.actions, name, language);
  //   }
  //   const result = this.lazyData.data.craftActions[resultIndex] || this.lazyData.data.actions[resultIndex];
  //   if (resultIndex === -1) {
  //     throw new Error(`Data row not found for crafting action ${name}`);
  //   }
  //   const koResultRow = koData[resultIndex];
  //   if (koResultRow !== undefined) {
  //     result.ko = koResultRow.ko;
  //   }
  //   const zhResultRow = zhActions.find((a) => a.en === result.en);
  //   if (zhResultRow !== undefined) {
  //     result.zh = zhResultRow.zh;
  //   }
  //   return result;
  // }

  public getAction(id: number): I18nNameLazy {
    const craftAction = this.getRow('craftActions', id);
    const action = this.getRow('actions', id);
    return Object.entries(craftAction).reduce((acc, [lang, val]: [Language, Observable<string | undefined>]) => {
      return { ...acc, [lang]: val.pipe(switchMap((v) => (v ? of(v) : action[lang]))) };
    }, {} as I18nNameLazy);
  }

  public getStatus(id: number): I18nNameLazy {
    return this.getRow('statuses', id);
  }

  // TODO:
  // public getNotebookDivision(id: number): { name: I18nName; pages: number[] } {
  //   const row = this.getRow<{ name: I18nName; pages: number[] }>(this.lazyData.data.notebookDivision, id);
  //   this.tryFillExtendedLanguage(row.name, id, { zhKey: 'zhNotebookDivision', koKey: 'koNotebookDivision' });
  //   return row;
  // }

  // TODO:
  // public getNotebookDivisionCategory(id: number): { name: I18nName; divisions: number[] } {
  //   const row = this.getRow<{ name: I18nName; divisions: number[] }>(this.lazyData.data.notebookDivisionCategory, id);
  //   this.tryFillExtendedLanguage(row.name, id, { zhKey: 'zhNotebookDivisionCategory', koKey: 'koNotebookDivisionCategory' });
  //   return row;
  // }

  // TODO:
  // public getExpansions(): { exVersion: number; majorVersion: number; name: I18nName }[] {
  //   return Object.entries(this.lazyData.data.exVersions).map(([exVersion, name]) => {
  //     this.tryFillExtendedLanguage(name as I18nName, exVersion, { zhKey: 'zhExVersions', koKey: 'koExVersions' });
  //     const exVersionNum = +exVersion;
  //     return {
  //       exVersion: exVersionNum,
  //       majorVersion: exVersionNum + 2, // Not sure if this is guaranteed
  //       name: name as I18nName,
  //     };
  //   });
  // }

  // TODO:
  // public i18nToXivapi(value: I18nName, fieldName = 'Name') {
  //   return {
  //     [`${fieldName}_en`]: value.en,
  //     [`${fieldName}_fr`]: value.fr,
  //     [`${fieldName}_de`]: value.de,
  //     [`${fieldName}_ja`]: value.ja,
  //     [`${fieldName}_ko`]: value.ko || value.en,
  //     [`${fieldName}_chs`]: value.zh || value.en,
  //   };
  // }

  // TODO:
  // public xivapiToI18n(value: any, key: any, fieldName = 'Name'): I18nName {
  //   const row = {
  //     en: value[`${fieldName}_en`],
  //     fr: value[`${fieldName}_fr`],
  //     de: value[`${fieldName}_de`],
  //     ja: value[`${fieldName}_ja`],
  //     ko: value[`${fieldName}_ko`],
  //     zh: value[`${fieldName}_chs`],
  //   };

  //   if (key !== null) {
  //     this.tryFillExtendedLanguage(row, value.ID, this.guessExtendedLanguageKeys(key));
  //   }
  //   return row;
  // }

  /**
   * Gets the id of a row by name.
   * @param  array
   * @param {string} name
   * @param language
   * @param flip
   * @returns {number}
   */
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
    for (const key of keys) {
      if (!array[key]) {
        continue;
      }
      if (array[key].name && array[key].name[language].toString().toLowerCase() === name.toLowerCase()) {
        res = +key;
        break;
      }
      if (array[key][language] && array[key][language].toString().toLowerCase() === name.toLowerCase()) {
        res = +key;
        break;
      }
    }
    if (['ko', 'zh'].indexOf(language) > -1 && res === -1) {
      return this.getIndexByName(array, name, 'en');
    }
    return res;
  }

  private isLazyDataKey(key: string): key is LazyDataKey {
    return this.dataKeys.has(key);
  }
}
