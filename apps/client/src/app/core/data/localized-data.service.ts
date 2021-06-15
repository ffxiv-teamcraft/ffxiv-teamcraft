import { Injectable } from '@angular/core';
import { I18nName } from '../../model/common/i18n-name';
import { Fate } from '../../pages/db/model/fate/fate';
import { Npc } from '../../pages/db/model/npc/npc';
import { Quest } from '../../pages/db/model/quest/quest';
import { Trait } from '../../pages/db/model/trait/trait';
import { ExtendedLanguageKeys } from './extended-language-keys';
import { Language } from './language';
import { LazyData, LazyDataKey } from './lazy-data';
import { LazyDataProviderService } from './lazy-data-provider.service';
import { LazyDataService } from './lazy-data.service';
import { mapIds } from './sources/map-ids';
import { tripleTriadRules } from './sources/triple-triad-rules';
import { zhActions } from './sources/zh-actions';
import { zhWorlds } from './sources/zh-worlds';
import { koWorlds } from './sources/ko-worlds';

@Injectable({ providedIn: 'root' })
export class LocalizedDataService {
  indentRegexp = new RegExp('<Indent/>', 'i');

  constructor(private lazyDataProvider: LazyDataProviderService, private lazyData: LazyDataService) {
  }

  public getWorldName(world: string): I18nName {
    const i18nName: I18nName = {
      fr: world,
      en: world,
      de: world,
      ja: world,
      ko: koWorlds[world] ?? world,
      zh: zhWorlds[world] ?? world
    };

    return i18nName;
  }

  public getItem(id: number): I18nName {
    const row = this.getRowWithExtendedLanguage('items', id);

    if (row !== undefined) {
      row.fr = row.fr && row.fr.replace(this.indentRegexp, '');
    }
    return row;
  }

  public getInstanceName(id: number): any {
    return this.getRowWithExtendedLanguage('instances', id);
  }

  public getAchievementName(id: number): I18nName {
    return this.getRowWithExtendedLanguage('achievements', id);
  }

  public getMapName(id: number): any {
    const entry = mapIds.find((m) => m.id === id);
    return this.getPlace(entry ? entry.zone : 1);
  }

  public getPlace(id: number): I18nName {
    return this.getRowWithExtendedLanguage('places', id);
  }

  public getFate(id: number): Fate {
    const row = this.getRow<Fate>(this.lazyData.data.fates, id);

    if (row !== undefined) {
      const koRow = this.getRow<Fate>(this.lazyData.data.koFates, id);
      const zhRow = this.getRow<Fate>(this.lazyData.data.zhFates, id);

      row.name.ko = koRow !== undefined ? koRow.name.ko : row.name.en;
      row.description.ko = koRow !== undefined ? koRow.description.ko : row.description.en;
      row.name.zh = zhRow !== undefined ? zhRow.name.zh : row.name.en;
      row.description.zh = zhRow !== undefined ? zhRow.description.zh : row.description.en;
    }
    return row;
  }

  public getNpc(id: number): Npc {
    return this.getRowWithExtendedLanguage<Npc>('npcs', id);
  }

  public getLeve(id: number): I18nName {
    return this.getRowWithExtendedLanguage('leves', id);
  }

  public getShopName(englishName: string): I18nName {
    const id = +Object.keys(this.lazyData.data.shops).find((k) => this.lazyData.data.shops[k].en === englishName);
    return this.getRowWithExtendedLanguage('shops', id);
  }

  public getJobName(id: number): I18nName {
    const row = this.getRow(this.lazyData.data.jobName, id);
    this.tryFillExtendedLanguage(row, id, { zhKey: 'zhJobName', koKey: 'koJobName' });

    return row;
  }

  public getJobAbbr(id: number): I18nName {
    const row = this.getRow(this.lazyData.data.jobAbbr, id);
    this.tryFillExtendedLanguage(row, id, { zhKey: 'zhJobAbbr', koKey: 'koJobAbbr' });

    return row;
  }

  public getMob(id: number): I18nName {
    return this.getRowWithExtendedLanguage('mobs', id);
  }

  public getMobId(name: string): number {
    return +Object.keys(this.lazyData.data.mobs).find((k) => this.lazyData.data.mobs[k].en.toLowerCase() === name.toLowerCase());
  }

  public getVenture(id: number): I18nName {
    return this.getRow(this.lazyData.data.ventures, id);
  }

  public getQuest(id: number): Quest {
    const row = this.getRow<Quest>(this.lazyData.data.quests, id);
    this.tryFillExtendedLanguage(row.name, id, this.guessExtendedLanguageKeys('quests'));

    return row;
  }

  public getTrait(id: number): Trait {
    const row = this.getRowWithExtendedLanguage<Trait>('traits', id);
    if (row && row.description) {
      this.tryFillExtendedLanguage(row.description, id, { zhKey: 'zhTraitDescriptions', koKey: 'koTraitDescriptions' });
    }

    return row;
  }

  public getRaceName(id: number): any {
    return this.getRowWithExtendedLanguage('races', id);
  }

  public getTribeName(id: number): any {
    const lazyRow = this.getRow<any>(this.lazyData.data.tribes, id);
    const row = {
      en: lazyRow.Name_en,
      de: lazyRow.Name_de,
      ja: lazyRow.Name_ja,
      fr: lazyRow.Name_fr
    };
    this.tryFillExtendedLanguage(row, id, { zhKey: 'zhTribes', koKey: 'koTribes' });
    return row;
  }

  public getTTRule(id: number): I18nName {
    const row = this.getRow<{ name: I18nName }>(tripleTriadRules, id);
    this.tryFillExtendedLanguage(row.name, id, { zhKey: 'zhTripleTriadRules', koKey: 'koTripleTriadRules' });

    return row.name;
  }

  public getBaseParamName(id: number): I18nName {
    const lazyRow = this.getRow<any>(this.lazyData.data.baseParams, id);
    const row = {
      en: lazyRow.Name_en,
      de: lazyRow.Name_de,
      ja: lazyRow.Name_ja,
      fr: lazyRow.Name_fr
    };
    this.tryFillExtendedLanguage(row, id, { zhKey: 'zhBaseParams', koKey: 'koBaseParams' });

    return row;
  }

  public getWeather(id: number): I18nName {
    const row = this.getRow<{ name: I18nName }>(this.lazyData.data.weathers, id).name;
    this.tryFillExtendedLanguage(row, id, { zhKey: 'zhWeathers', koKey: 'koWeathers' });
    return row;
  }

  public getWeatherId(name: string): number {
    return this.getIndexByName(this.lazyData.data.weathers, name, 'en');
  }

  public getAreaIdByENName(name: string): number {
    return this.getIndexByName(this.lazyData.data.places, name, 'en');
  }

  public getFreeCompanyAction(id: number): I18nName {
    const row = this.getRow(this.lazyData.data.freeCompanyActions, id);
    this.tryFillExtendedLanguage(row, id, { zhKey: 'zhFreeCompanyActions', koKey: 'koFreeCompanyActions' });

    return row;
  }

  public getMapId(name: string): number {
    const result = mapIds.find((map) => map.name === name);
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

  public getCraftingActionIdByName(name: string, language: Language): number {
    if (language === 'ko') {
      const enRow = this.getEnActionFromKoActionName(name);
      if (enRow) {
        name = enRow.en;
        language = 'en';
      }
    }
    let res = this.getIndexByName(this.lazyData.data.craftActions, name, language, true);
    if (res === -1) {
      res = this.getIndexByName(this.lazyData.data.actions, name, language, true);
    }
    if (res === -1) {
      throw new Error('Data row not found.');
    }
    return res;
  }

  private getEnActionFromKoActionName(name: string): I18nName {
    const craftActionId = Object.keys(this.lazyData.data.koCraftActions).find(
      (key) => this.lazyData.data.koCraftActions[key].ko.toLowerCase() === name.toLowerCase()
    );
    if (craftActionId) {
      return this.lazyData.data.craftActions[craftActionId];
    }
    const actionId = Object.keys(this.lazyData.data.koActions).find((key) => this.lazyData.data.koActions[key].ko.toLowerCase() === name.toLowerCase());
    if (actionId) {
      return this.lazyData.data.actions[actionId];
    }
    return null;
  }

  public getCraftingActionByName(name: string, language: Language): I18nName {
    const koData: any[] = Object.values({ ...this.lazyData.data.koActions, ...this.lazyData.data.koCraftActions });
    if (language === 'ko') {
      const enRow = this.getEnActionFromKoActionName(name);
      if (enRow) {
        name = enRow.en;
        language = 'en';
      }
    }
    if (language === 'zh') {
      const zhRow = zhActions.find((a) => a.zh === name);
      if (zhRow !== undefined) {
        name = zhRow.en;
        language = 'en';
      }
    }
    let resultIndex = this.getIndexByName(this.lazyData.data.craftActions, name, language, true);
    if (resultIndex === -1) {
      resultIndex = this.getIndexByName(this.lazyData.data.actions, name, language, true);
    }
    if (name === 'Scrutiny' && language === 'en') {
      resultIndex = 22185;
    }
    const result = this.lazyData.data.craftActions[resultIndex] || this.lazyData.data.actions[resultIndex];
    if (resultIndex === -1) {
      throw new Error(`Data row not found for crafting action ${name}`);
    }
    const koResultRow = koData[resultIndex];
    if (koResultRow !== undefined) {
      result.ko = koResultRow.ko;
    }
    const zhResultRow = zhActions.find((a) => a.en === result.en);
    if (zhResultRow !== undefined) {
      result.zh = zhResultRow.zh;
    }
    return result;
  }

  public getAction(id: number): I18nName {
    const craftAction = this.getRowWithExtendedLanguage('craftActions', id);
    if (craftAction) return craftAction;

    const action = this.getRowWithExtendedLanguage('actions', id);
    if (action) return action;

    throw new Error('Data row not found.');
  }

  public getStatus(id: number): I18nName {
    return this.getRowWithExtendedLanguage('statuses', id);
  }

  public getNotebookDivision(id: number): { name: I18nName; pages: number[] } {
    const row = this.getRow<{ name: I18nName; pages: number[] }>(this.lazyData.data.notebookDivision, id);
    this.tryFillExtendedLanguage(row.name, id, { zhKey: 'zhNotebookDivision', koKey: 'koNotebookDivision' });
    return row;
  }

  public getNotebookDivisionCategory(id: number): { name: I18nName; divisions: number[] } {
    const row = this.getRow<{ name: I18nName; divisions: number[] }>(this.lazyData.data.notebookDivisionCategory, id);
    this.tryFillExtendedLanguage(row.name, id, { zhKey: 'zhNotebookDivisionCategory', koKey: 'koNotebookDivisionCategory' });
    return row;
  }

  public getAirshipSectorName(id: number): I18nName {
    return this.getRowWithExtendedLanguage('airshipVoyages', id);
  }

  public getSubmarineSectorName(id: number): I18nName {
    return this.getRowWithExtendedLanguage('submarineVoyages', id);
  }

  public getExpansions(): { exVersion: number; majorVersion: number; name: I18nName }[] {
    return Object.entries(this.lazyData.data.exVersions).map(([exVersion, name]) => {
      this.tryFillExtendedLanguage(name as I18nName, exVersion, { zhKey: 'zhExVersions', koKey: 'koExVersions' });

      const exVersionNum = +exVersion;
      return {
        exVersion: exVersionNum,
        majorVersion: exVersionNum + 2, // Not sure if this is guaranteed
        name: name as I18nName
      };
    });
  }

  private getRow<T = I18nName>(array: any, id: number | string): T {
    if (array === undefined) {
      return undefined;
    }
    return array[id];
  }

  private getRowWithExtendedLanguage<T extends I18nName = I18nName>(key: LazyDataKey, id: number | string): T {
    const row = this.getRow<T>(this.lazyData.data[key], id);
    if (row === undefined) {
      return undefined;
    }

    this.tryFillExtendedLanguage(row, id, this.guessExtendedLanguageKeys(key));
    return row;
  }

  private guessExtendedLanguageKeys(key: keyof LazyData) {
    return {
      zhKey: this.guessExtendedLanguageKey('zh', key),
      koKey: this.guessExtendedLanguageKey('ko', key)
    };
  }

  private guessExtendedLanguageKey(language: 'zh' | 'ko', key: keyof LazyData): keyof LazyData {
    const guessKey = `${language}${key.charAt(0).toUpperCase()}${key.substr(1)}`;
    if (!this.lazyData.data.hasOwnProperty(guessKey)) {
      return undefined;
    }

    return guessKey as keyof LazyData;
  }

  private tryFillExtendedLanguage(row: I18nName, id: number | string, { zhKey, koKey }: ExtendedLanguageKeys = {}): void {
    if (row === undefined) return;

    // If an item doesn't exist yet inside zh and ko items, use english name instead.
    if (zhKey) {
      const zhRow = this.getRow(this.lazyData.data[zhKey], id);
      row.zh = zhRow !== undefined ? zhRow.zh : row.zh || row.en;
    }

    if (koKey) {
      const koRow = this.getRow(this.lazyData.data[koKey], id);
      row.ko = koRow !== undefined ? koRow.ko : row.ko || row.en;
    }
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

  public xivapiToI18n(value: any, key: any, fieldName = 'Name'): I18nName {
    const row = {
      en: value[`${fieldName}_en`],
      fr: value[`${fieldName}_fr`],
      de: value[`${fieldName}_de`],
      ja: value[`${fieldName}_ja`],
      ko: value[`${fieldName}_ko`],
      zh: value[`${fieldName}_chs`]
    };

    if (key !== null) {
      this.tryFillExtendedLanguage(row, value.ID, this.guessExtendedLanguageKeys(key));
    }
    return row;
  }

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
    const cleanupRegexp = /[^a-z\s,.]/;
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
}
