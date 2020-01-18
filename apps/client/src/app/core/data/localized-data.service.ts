import { Injectable } from '@angular/core';
import { I18nName } from '../../model/common/i18n-name';
import * as weathers from './sources/weathers.json';
import * as freeCompanyActions from './sources/free-company-actions.json';
import * as jobNames from './sources/job-name.json';
import * as jobAbbrs from './sources/job-abbr.json';
import { Language } from './language';
import { koActions } from './sources/ko-actions';
import { mapIds } from './sources/map-ids';
import { LazyDataService } from './lazy-data.service';
import { Fate } from '../../pages/db/model/fate/fate';
import { Quest } from '../../pages/db/model/quest/quest';
import { tripleTriadRules } from './sources/triple-triad-rules';
import { zhActions } from './sources/zh-actions';
import { ExtendedLanguageKeys } from './extended-language-keys';
import { LazyData } from './lazy-data';

@Injectable()
export class LocalizedDataService {

  indentRegexp = new RegExp('<Indent/>', 'i');

  constructor(private lazyData: LazyDataService) {
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

  public getMapName(id: number): any {
    const entry = mapIds.find(m => m.id === id);
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

  public getNpc(id: number): I18nName {
    return this.getRowWithExtendedLanguage('npcs', id);
  }

  public getLeve(id: number): I18nName {
    return this.getRowWithExtendedLanguage('leves', id);
  }

  public getShopName(englishName: string): I18nName {
    const id = +Object.keys(this.lazyData.data.shops).find(k => this.lazyData.data.shops[k].en === englishName);
    return this.getRowWithExtendedLanguage('shops', id);
  }

  public getJobName(id: number): I18nName {
    const row = this.getRow(jobNames, id);
    this.tryFillExtendedLanguage(row, id, { zhKey: 'zhJobName', koKey: 'koJobName' });
    
    return row;
  }

  public getJobAbbr(id: number): I18nName {
    const row = this.getRow(jobAbbrs, id);
    this.tryFillExtendedLanguage(row, id, { zhKey: 'zhJobAbbr', koKey: 'koJobAbbr' });

    return row;
  }

  public getMob(id: number): I18nName {
    return this.getRowWithExtendedLanguage('mobs', id);
  }

  public getMobId(name: string): number {
    return +Object.keys(this.lazyData.data.mobs).find(k => this.lazyData.data.mobs[k].en.toLowerCase() === name.toLowerCase());
  }

  public getVenture(id: number): I18nName {
    return this.getRow(this.lazyData.data.ventures, id);
  }

  public getQuest(id: number): Quest {
    const row = this.getRow<Quest>(this.lazyData.data.quests, id);
    this.tryFillExtendedLanguage(row.name, id, this.guessExtendedLanguageKeys('quests'));

    return row;
  }

  public getTrait(id: number): any {
    return this.getRowWithExtendedLanguage('traits', id);
  }

  public getTTRule(id: number): I18nName {
    const row = this.getRow<{ name: I18nName }>(tripleTriadRules, id);
    this.tryFillExtendedLanguage(row.name, id, { zhKey: 'zhTripleTriadRules', koKey: 'koTripleTriadRules' });
    
    return row.name;
  }

  public getWeather(id: number): I18nName {
    const row = this.getRow(weathers, id);
    this.tryFillExtendedLanguage(row, id, { zhKey: 'zhWeathers', koKey: 'koWeathers' });
    
    return row;
  }

  public getWeatherId(name: string): number {
    return this.getIndexByName(weathers, name, 'en');
  }

  public getAreaIdByENName(name: string): number {
    return this.getIndexByName(this.lazyData.data.places, name, 'en');
  }

  public getFreeCompanyAction(id: number): I18nName {
    const row = this.getRow(freeCompanyActions, id);
    this.tryFillExtendedLanguage(row, id, { zhKey: 'zhFreeCompanyActions', koKey: 'koFreeCompanyActions' });

    return row;
  }

  public getMapId(name: string): number {
    const result = mapIds.find(map => map.name === name);
    if (result === undefined) {
      if (name === 'Gridania') {
        return 2;
      }
      if (name.startsWith('Eulmore - ')) {
        return 498;
      }
      return -1;
    }
    return result.id;
  }

  public getCraftingActionIdByName(name: string, language: Language): number {
    if (language === 'ko') {
      const koRow = koActions.find(a => a.ko === name);
      if (koRow !== undefined) {
        name = koRow.en;
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

  public getCraftingActionByName(name: string, language: Language): I18nName {
    const koData: any[] = Object.values({ ...this.lazyData.data.koActions, ...this.lazyData.data.koCraftActions });
    if (language === 'ko') {
      const koRow = koData.find(a => a.ko === name);
      if (koRow !== undefined) {
        name = koRow.en;
        language = 'en';
      }
    }
    if (language === 'zh') {
      const zhRow = zhActions.find(a => a.zh === name);
      if (zhRow !== undefined) {
        name = zhRow.en;
        language = 'en';
      }
    }
    let resultIndex = this.getIndexByName(this.lazyData.data.craftActions, name, language);
    if (resultIndex === -1) {
      resultIndex = this.getIndexByName(this.lazyData.data.actions, name, language);
    }
    const result = this.lazyData.data.craftActions[resultIndex] || this.lazyData.data.actions[resultIndex];
    if (resultIndex === -1) {
      throw new Error('Data row not found.');
    }
    const koResultRow = koData[resultIndex];
    if (koResultRow !== undefined) {
      result.ko = koResultRow.ko;
    }
    const zhResultRow = zhActions.find(a => a.en === result.en);
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

  private getRow<T = I18nName>(array: any, id: number | string): T {
    if (array === undefined) {
      return undefined;
    }
    return array[id];
  }

  private getRowWithExtendedLanguage(key: keyof LazyData, id: number | string): I18nName {
    let row = this.getRow<I18nName>(this.lazyData.data[key], id);
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
    let guessKey = `${language}${key.charAt(0).toUpperCase()}${key.substr(1)}`
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
      row.zh = zhRow !== undefined ? zhRow.zh : row.en;
    }

    if (koKey) {
      const koRow = this.getRow(this.lazyData.data[koKey], id);
      row.ko = koRow !== undefined ? koRow.ko : row.en;
    }
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
}
