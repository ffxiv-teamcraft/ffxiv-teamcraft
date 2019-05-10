import { Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { MapData } from '../../modules/map/map-data';
import { XivapiService } from '@xivapi/angular-client';
import { I18nName } from '../../model/common/i18n-name';
import { Quest } from '../../pages/db/model/quest/quest';
import { Fate } from '../../pages/db/model/fate/fate';
import { IS_PRERENDER } from '../tools/platform.service';

@Injectable({
  providedIn: 'root'
})
export class LazyDataService {

  public loaded$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  public items: any = {};

  public npcs: any = {};

  public zhItems: any = {};

  public koItems: any = {};
  public koItemUiCategories: any = {};
  public koActions: any = {};
  public koActionDescriptions: any = {};
  public koCraftActions: any = {};
  public koCraftDescriptions: any = {};
  public koFCActions: any = {};
  public koLeves: any = {};
  public koWeathers: any = {};
  public koPlaces: any = {};
  public koNpcs: any = {};
  public koMobs: any = {};
  public koJobNames: any = {};
  public koJobAbbrs: any = {};
  public koJobCategories: any = {};
  public koQuests: any = {};
  public koFates: any = {};
  public koFateDescriptions: any = {};
  public koTripleTriadRules: any = {};

  public craftActions: any = {};

  public actions: any = {};

  public icons: any = {};

  public maps: { [index: number]: MapData } = {};

  public datacenters: { [index: string]: string[] } = {};

  public mobs: { [index: string]: I18nName } = {};
  public places: { [index: string]: I18nName } = {};
  public quests: { [index: string]: Quest } = {};
  public fates: { [index: string]: Fate } = {};
  public instances: any = {};

  public get allItems(): any {
    const res = { ...this.items };
    Object.keys(this.koItems).forEach(koKey => {
      if (res[koKey] !== undefined) {
        res[koKey].ko = this.koItems[koKey].ko;
      } else {
        res[koKey] = this.koItems[koKey];
      }
    });
    Object.keys(this.zhItems).forEach(zhKey => {
      if (res[zhKey] !== undefined) {
        res[zhKey].zh = this.zhItems[zhKey].zh;
      } else {
        res[zhKey] = this.zhItems[zhKey];
      }
    });
    return res;
  }

  constructor(private http: HttpClient, private xivapi: XivapiService) {
    if (IS_PRERENDER) {
      this.loaded$.next(true);
    } else {
      combineLatest([
          this.http.get('./assets/data/items.json'),
          this.http.get('./assets/data/zh-items.json'),
          this.http.get('./assets/data/ko/ko-items.json'),
          this.http.get('./assets/data/ko/ko-item-ui-categories.json'),
          this.http.get('./assets/data/ko/ko-actions.json'),
          this.http.get('./assets/data/ko/ko-action-descriptions.json'),
          this.http.get('./assets/data/ko/ko-craft-actions.json'),
          this.http.get('./assets/data/ko/ko-craft-descriptions.json'),
          this.http.get('./assets/data/ko/ko-free-company-actions.json'),
          this.http.get('./assets/data/ko/ko-leves.json'),
          this.http.get('./assets/data/ko/ko-weathers.json'),
          this.http.get('./assets/data/ko/ko-places.json'),
          this.http.get('./assets/data/ko/ko-npcs.json'),
          this.http.get('./assets/data/ko/ko-mobs.json'),
          this.http.get('./assets/data/ko/ko-job-name.json'),
          this.http.get('./assets/data/ko/ko-job-abbr.json'),
          this.http.get('./assets/data/ko/ko-job-categories.json'),
          this.http.get('./assets/data/actions.json'),
          this.http.get('./assets/data/craft-actions.json'),
          this.http.get('./assets/data/npcs.json'),
          this.http.get('./assets/data/item-icons.json'),
          this.http.get('./assets/data/maps.json'),
          this.xivapi.getDCList(),
          this.http.get('./assets/data/mobs.json'),
          this.http.get('./assets/data/places.json'),
          this.http.get('./assets/data/quests.json'),
          this.http.get('./assets/data/fates.json'),
          this.http.get('./assets/data/ko/ko-fate-descriptions.json'),
          this.http.get('./assets/data/ko/ko-fates.json'),
          this.http.get('./assets/data/ko/ko-quests.json'),
          this.http.get('./assets/data/ko/ko-triple-triad-rules.json'),
          this.http.get('./assets/data/instances.json')
        ]
      ).subscribe(([
                     items,
                     zhItems,
                     koItems,
                     koItemUiCategories,
                     koActions,
                     koActionDescriptions,
                     koCraftActions,
                     koCraftDescriptions,
                     koFCActions,
                     koLeves,
                     koWeathers,
                     koPlaces,
                     koNpcs,
                     koMobs,
                     koJobNames,
                     koJobAbbrs,
                     koJobCategories,
                     actions,
                     craftActions,
                     npcs,
                     icons,
                     maps,
                     dcList,
                     mobs,
                     places,
                     quests,
                     fates,
                     koFateDescriptions,
                     koFates,
                     koQuests,
                     koTripleTriadRules,
                     instances
                   ]) => {
        this.items = items;
        this.zhItems = zhItems;
        this.koItems = koItems;
        this.koItemUiCategories = koItemUiCategories;
        this.koActions = koActions;
        this.koActionDescriptions = koActionDescriptions;
        this.koCraftActions = koCraftActions;
        this.koCraftDescriptions = koCraftDescriptions;
        this.koFCActions = koFCActions;
        this.koLeves = koLeves;
        this.koWeathers = koWeathers;
        this.koPlaces = koPlaces;
        this.koNpcs = koNpcs;
        this.koMobs = koMobs;
        this.koJobNames = koJobNames;
        this.koJobAbbrs = koJobAbbrs;
        this.koJobCategories = koJobCategories;
        this.actions = actions;
        this.craftActions = craftActions;
        this.npcs = npcs;
        this.icons = icons;
        this.maps = maps as { [index: number]: MapData };
        this.datacenters = dcList as { [index: string]: string[] };
        this.mobs = mobs as { [index: string]: I18nName };
        this.places = places as { [index: string]: I18nName };
        this.quests = quests as { [index: string]: Quest };
        this.fates = fates as { [index: string]: Fate };
        this.koFateDescriptions = koFateDescriptions;
        this.koFates = koFates;
        this.koQuests = koQuests;
        this.koTripleTriadRules = koTripleTriadRules;
        this.instances = instances;
        this.loaded$.next(true);
      });
    }
  }
}
