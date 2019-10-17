import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { MapData } from '../../modules/map/map-data';
import { XivapiService } from '@xivapi/angular-client';
import { I18nName } from '../../model/common/i18n-name';
import { Quest } from '../../pages/db/model/quest/quest';
import { Fate } from '../../pages/db/model/fate/fate';
import { isPlatformServer } from '@angular/common';
import { LazyRecipe } from './lazy-recipe';
import { PlatformService } from '../tools/platform.service';
import { environment } from '../../../environments/environment';
import { ListRow } from '../../modules/list/model/list-row';

@Injectable({
  providedIn: 'root'
})
export class LazyDataService {

  public loaded$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  public items: any = {};

  public npcs: any = {};

  public zhItems: any = {};
  public zhPlaces: any = {};
  public zhActions: any = {};
  public zhFates: any = {};
  public zhGatheringBonuses: any = {};
  public zhInstances: any = {};
  public zhLeves: any = {};
  public zhMaps: any = {};
  public zhStatuses: any = {};

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
  public koTripleTriadRules: any = {};
  public koInstances: any = {};
  public koShops: any = {};
  public koTraits: any = {};
  public koStatuses: any = {};

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
  public shops: any = {};
  public leves: any = {};
  public statuses: any = {};
  public traits: any = {};
  public patches: any[] = [];
  public patchContents: any = {};
  public recipes: LazyRecipe[] = [];
  public extracts: ListRow[] = [];

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

  constructor(private http: HttpClient, private xivapi: XivapiService, @Inject(PLATFORM_ID) private platform: Object,
              private platformService: PlatformService) {
    if (isPlatformServer(platform)) {
      this.loaded$.next(true);
    } else {
      this.load();
    }
  }

  private load(): void {
    combineLatest([
        this.getData('/assets/data/items.json'),
        this.getData('/assets/data/zh/zh-items.json'),
        this.getData('/assets/data/zh/zh-places.json'),
        this.getData('/assets/data/ko/ko-items.json'),
        this.getData('/assets/data/ko/ko-item-ui-categories.json'),
        this.getData('/assets/data/ko/ko-actions.json'),
        this.getData('/assets/data/ko/ko-action-descriptions.json'),
        this.getData('/assets/data/ko/ko-craft-actions.json'),
        this.getData('/assets/data/ko/ko-craft-descriptions.json'),
        this.getData('/assets/data/ko/ko-free-company-actions.json'),
        this.getData('/assets/data/ko/ko-leves.json'),
        this.getData('/assets/data/ko/ko-weathers.json'),
        this.getData('/assets/data/ko/ko-places.json'),
        this.getData('/assets/data/ko/ko-npcs.json'),
        this.getData('/assets/data/ko/ko-mobs.json'),
        this.getData('/assets/data/ko/ko-job-name.json'),
        this.getData('/assets/data/ko/ko-job-abbr.json'),
        this.getData('/assets/data/ko/ko-job-categories.json'),
        this.getData('/assets/data/actions.json'),
        this.getData('/assets/data/craft-actions.json'),
        this.getData('/assets/data/npcs.json'),
        this.getData('/assets/data/item-icons.json'),
        this.getData('/assets/data/maps.json'),
        this.xivapi.getDCList(),
        this.getData('/assets/data/mobs.json'),
        this.getData('/assets/data/places.json'),
        this.getData('/assets/data/quests.json'),
        this.getData('/assets/data/fates.json'),
        this.getData('/assets/data/ko/ko-fates.json'),
        this.getData('/assets/data/ko/ko-quests.json'),
        this.getData('/assets/data/ko/ko-triple-triad-rules.json'),
        this.getData('/assets/data/ko/ko-instances.json'),
        this.getData('/assets/data/ko/ko-shops.json'),
        this.getData('/assets/data/ko/ko-traits.json'),
        this.getData('/assets/data/ko/ko-statuses.json'),
        this.getData('/assets/data/instances.json'),
        this.getData('/assets/data/shops.json'),
        this.getData('/assets/data/leves.json'),
        this.getData('/assets/data/statuses.json'),
        this.getData('/assets/data/traits.json'),
        this.getData('https://xivapi.com/patchlist'),
        this.getData('/assets/data/recipes.json'),
        this.getData('/assets/data/patch-content.json'),
        this.getData('/assets/data/extracts.json'),
        this.getData('/assets/data/zh/zh-actions.json'),
        this.getData('/assets/data/zh/zh-fates.json'),
        this.getData('/assets/data/zh/zh-gathering-bonuses.json'),
        this.getData('/assets/data/zh/zh-instances.json'),
        this.getData('/assets/data/zh/zh-leves.json'),
        this.getData('/assets/data/zh/zh-maps.json'),
        this.getData('/assets/data/zh/zh-statuses.json')
      ]
    ).subscribe(([
                   items,
                   zhItems,
                   zhPlaces,
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
                   koFates,
                   koQuests,
                   koTripleTriadRules,
                   koInstances,
                   koShops,
                   koTraits,
                   koStatuses,
                   instances,
                   shops,
                   leves,
                   statuses,
                   traits,
                   patches,
                   recipes,
                   patchContents,
                   extracts,
                   zhActions,
                   zhFates,
                   zhGatheringBonuses,
                   zhInstances,
                   zhLeves,
                   zhMaps,
                   zhStatuses
                 ]) => {
      this.items = items;
      this.zhItems = zhItems;
      this.zhPlaces = zhPlaces;
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
      this.koFates = koFates as { [index: string]: Fate };
      this.koQuests = koQuests;
      this.koTripleTriadRules = koTripleTriadRules;
      this.koInstances = koInstances;
      this.koShops = koShops;
      this.koTraits = koTraits;
      this.koStatuses = koStatuses;
      this.instances = instances;
      this.shops = shops;
      this.leves = leves;
      this.statuses = statuses;
      this.traits = traits;
      this.patches = patches as any[];
      this.recipes = recipes as LazyRecipe[];
      this.patchContents = patchContents;
      this.extracts = extracts;
      this.zhActions = zhActions;
      this.zhFates = zhFates;
      this.zhGatheringBonuses = zhGatheringBonuses;
      this.zhInstances = zhInstances;
      this.zhLeves = zhLeves;
      this.zhMaps = zhMaps;
      this.zhStatuses = zhStatuses;
      this.loaded$.next(true);
      this.loaded$.complete();
    });
  }

  public merge(...dataEntries: any[]): any {
    return dataEntries.reduce((merged, entry) => {
      Object.keys(entry)
        .forEach(key => {
          if (merged[key] !== undefined) {
            Object.keys(entry[key])
              .forEach(lang => {
                merged[key][lang] = entry[key][lang];
              });
          } else {
            merged[key] = merged[key] || entry[key];
          }
        });
      return merged;
    }, {});
  }

  private getData(path: string): Observable<any> {
    let url: string;
    if (path.startsWith('http')) {
      url = path;
    } else {
      if (this.platformService.isDesktop() || !environment.production || isPlatformServer(this.platform)) {
        url = `.${path}`;
      } else {
        url = `https://cdn.ffxivteamcraft.com${path}`;
      }
    }
    return this.http.get(url);
  }
}
