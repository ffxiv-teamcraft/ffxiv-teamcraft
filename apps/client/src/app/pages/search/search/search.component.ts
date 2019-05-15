import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { BehaviorSubject, combineLatest, concat, Observable, of } from 'rxjs';
import { GarlandToolsService } from '../../../core/api/garland-tools.service';
import { DataService } from '../../../core/api/data.service';
import { debounceTime, filter, first, map, mergeMap, tap } from 'rxjs/operators';
import { SearchResult } from '../../../model/search/search-result';
import { SettingsService } from '../../../modules/settings/settings.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ListsFacade } from '../../../modules/list/+state/lists.facade';
import { List } from '../../../modules/list/model/list';
import { ListManagerService } from '../../../modules/list/list-manager.service';
import { NzMessageService, NzNotificationService } from 'ng-zorro-antd';
import { LocalizedDataService } from '../../../core/data/localized-data.service';
import { I18nToolsService } from '../../../core/tools/i18n-tools.service';
import { ListPickerService } from '../../../modules/list-picker/list-picker.service';
import { ProgressPopupService } from '../../../modules/progress-popup/progress-popup.service';
import { AbstractControl, FormBuilder, FormGroup } from '@angular/forms';
import { SearchFilter } from '../../../model/search/search-filter.interface';
import { SearchIndex, XivapiEndpoint, XivapiService } from '@xivapi/angular-client';
import { I18nName } from '../../../model/common/i18n-name';
import { RotationPickerService } from '../../../modules/rotations/rotation-picker.service';
import { HtmlToolsService } from '../../../core/tools/html-tools.service';
import { TranslateService } from '@ngx-translate/core';
import { LazyDataService } from '../../../core/data/lazy-data.service';
import { SearchType } from '../search-type';
import { InstanceSearchResult } from '../../../model/search/instance-search-result';
import { QuestSearchResult } from '../../../model/search/quest-search-result';
import { NpcSearchResult } from '../../../model/search/npc-search-result';
import { LeveSearchResult } from '../../../model/search/leve-search-result';
import { MobSearchResult } from '../../../model/search/mob-search-result';
import * as monsters from '../../../core/data/sources/monsters.json';
import { FateSearchResult } from '../../../model/search/fate-search-result';
import { mapIds } from '../../../core/data/sources/map-ids';
import { MapSearchResult } from '../../../model/search/map-search-result';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.less']
})
export class SearchComponent implements OnInit {

  searchTypes = SearchType;

  query$: BehaviorSubject<string> = new BehaviorSubject<string>('');

  results$: Observable<any[]>;

  filters$: BehaviorSubject<SearchFilter[]> = new BehaviorSubject<any>([]);

  showIntro = true;

  loading = false;

  public searchType$: BehaviorSubject<SearchType> =
    new BehaviorSubject<SearchType>(<SearchType>localStorage.getItem('search:type') || SearchType.ITEM);

  @ViewChild('notificationRef')
  notification: TemplateRef<any>;

  // Notification data
  itemsAdded = 0;

  modifiedList: List;

  allSelected = false;

  itemFiltersform: FormGroup = this.fb.group({
    ilvlMin: [0],
    ilvlMax: [999],
    elvlMin: [0],
    elvlMax: [80],
    clvlMin: [0],
    clvlMax: [80],
    jobCategories: [[]],
    craftJob: [0],
    itemCategories: [[]]
  });

  instanceFiltersForm: FormGroup = this.fb.group({
    lvlMin: [0],
    lvlMax: [80],
    maxPlayers: [24]
  });

  leveFiltersForm: FormGroup = this.fb.group({
    lvlMin: [0],
    lvlMax: [80],
    jobCategory: [1]
  });

  availableJobCategories = [];

  availableLeveJobCategories = [9, 10, 11, 12, 13, 14, 15, 16, 1718, 19, 34];

  availableCraftJobs = [];

  uiCategories$: Observable<{ id: number, name: I18nName }[]>;

  constructor(private gt: GarlandToolsService, private data: DataService, public settings: SettingsService,
              private router: Router, private route: ActivatedRoute, private listsFacade: ListsFacade,
              private listManager: ListManagerService, private notificationService: NzNotificationService,
              private l12n: LocalizedDataService, private i18n: I18nToolsService, private listPicker: ListPickerService,
              private progressService: ProgressPopupService, private fb: FormBuilder, private xivapi: XivapiService,
              private rotationPicker: RotationPickerService, private htmlTools: HtmlToolsService,
              private message: NzMessageService, public translate: TranslateService, private lazyData: LazyDataService) {
    this.uiCategories$ = this.xivapi.getList(XivapiEndpoint.ItemUICategory, {
      columns: ['ID', 'Name_de', 'Name_en', 'Name_fr', 'Name_ja'],
      max_items: 200
    }).pipe(
      map(contentList => {
        return contentList.Results.map(result => {
          return {
            id: result.ID,
            name: {
              en: result.Name_en,
              fr: result.Name_fr,
              de: result.Name_de,
              ja: result.Name_ja,
              ko: this.lazyData.koItemUiCategories[result.ID] !== undefined ? this.lazyData.koItemUiCategories[result.ID].ko : result.Name_en
            }
          };
        });
      })
    );
    this.searchType$.subscribe(value => {
      localStorage.setItem('search:type', value);
    });
  }

  ngOnInit(): void {
    this.gt.onceLoaded$.pipe(first()).subscribe(() => {
      this.availableJobCategories = this.gt.getJobs().filter(job => job.isJob !== undefined || job.category === 'Disciple of the Land');
      this.availableCraftJobs = this.gt.getJobs().filter(job => job.category.indexOf('Hand') > -1);
    });
    this.results$ = combineLatest([this.query$, this.searchType$, this.filters$]).pipe(
      filter(([query, , filters]) => {
        if (['ko', 'zh'].indexOf(this.translate.currentLang.toLowerCase()) > -1) {
          // Chinese and korean characters system use fewer chars for the same thing, filters have to be handled accordingly.
          return query.length > 0 || filters.length > 0;
        }
        return query.length > 3 || filters.length > 0;
      }),
      debounceTime(800),
      tap(([query, type, filters]) => {
        this.allSelected = false;
        this.showIntro = false;
        this.loading = true;
        const queryParams: any = {
          query: query,
          type: type,
          filters: null
        };
        if (filters.length > 0) {
          queryParams.filters = btoa(JSON.stringify(filters));
        }
        this.router.navigate([], {
          queryParamsHandling: 'merge',
          queryParams: queryParams,
          relativeTo: this.route
        });
      }),
      mergeMap(([query, type, filters]) => {
        switch (type) {
          case SearchType.ITEM:
            return this.data.searchItem(query, filters, false);
          case SearchType.RECIPE:
            return this.data.searchItem(query, filters, true);
          case SearchType.INSTANCE:
            return this.searchInstance(query, filters);
          case SearchType.QUEST:
            return this.searchQuest(query, filters);
          case SearchType.NPC:
            return this.searchNpc(query, filters);
          case SearchType.LEVE:
            return this.searchLeve(query, filters);
          case SearchType.MONSTER:
            return this.searchMob(query, filters);
          case SearchType.LORE:
            return this.searchLore(query, filters);
          case SearchType.FATE:
            return this.searchFate(query, filters);
          case SearchType.MAP:
            return this.searchMap(query, filters);
          default:
            return this.data.searchItem(query, filters, false);
        }
      }),
      tap(() => {
        this.loading = false;
      })
    );

    this.route.queryParams.pipe(
      filter(params => {
        return params.query !== undefined && params.type !== undefined;
      })
    ).subscribe(params => {
      this.searchType$.next(params.type);
      this.query$.next(params.query);
      if (params.filters !== undefined) {
        const filters = JSON.parse(atob(params.filters));
        this.filters$.next(filters);
        this.itemFiltersform.patchValue(this.filtersToForm(filters));
      }
    });
  }

  searchInstance(query: string, filters: SearchFilter[]): Observable<InstanceSearchResult[]> {
    return this.xivapi.search({
      language: this.getSearchLang(),
      indexes: [SearchIndex.INSTANCECONTENT],
      columns: ['ID', 'Banner', 'Icon', 'ContentFinderCondition.ClassJobLevelRequired'],
      // I know, it looks like it's the same, but it isn't
      string: query.split('-').join('–'),
      filters: [].concat.apply([], filters.map(f => {
        if (f.minMax) {
          return [
            {
              column: f.name,
              operator: '>=',
              value: f.value.min
            },
            {
              column: f.name,
              operator: '<=',
              value: f.value.max
            }
          ];
        } else {
          return [{
            column: f.name,
            operator: '=',
            value: f.value
          }];
        }
      }))
    }).pipe(
      map(res => {
        return res.Results.map(instance => {
          return {
            id: instance.ID,
            icon: instance.Icon,
            banner: instance.Banner,
            level: instance.ContentFinderCondition.ClassJobLevelRequired
          };
        });
      })
    );
  }

  searchQuest(query: string, filters: SearchFilter[]): Observable<QuestSearchResult[]> {
    return this.xivapi.search({
      language: this.getSearchLang(),
      indexes: [SearchIndex.QUEST],
      columns: ['ID', 'Banner', 'Icon'],
      // I know, it looks like it's the same, but it isn't
      string: query.split('-').join('–'),
      filters: []
    }).pipe(
      map(res => {
        return res.Results.map(quest => {
          return {
            id: quest.ID,
            icon: quest.Icon,
            banner: quest.Banner
          };
        });
      })
    );
  }

  searchLeve(query: string, filters: SearchFilter[]): Observable<LeveSearchResult[]> {
    return this.xivapi.search({
      language: this.getSearchLang(),
      indexes: [SearchIndex.LEVE],
      columns: ['ID', 'Banner', 'Icon', 'ClassJobCategory', 'IconIssuer', 'ClassJobLevel'],
      // I know, it looks like it's the same, but it isn't
      string: query.split('-').join('–'),
      filters: [].concat.apply([], filters.map(f => {
        if (f.minMax) {
          return [
            {
              column: f.name,
              operator: '>=',
              value: f.value.min
            },
            {
              column: f.name,
              operator: '<=',
              value: f.value.max
            }
          ];
        } else {
          return [{
            column: f.name,
            operator: '=',
            value: f.value
          }];
        }
      }))
    }).pipe(
      map(res => {
        return res.Results.map(leve => {
          return {
            id: leve.ID,
            icon: leve.Icon,
            level: leve.ClassJobLevel,
            banner: leve.IconIssuer,
            job: {
              en: leve.ClassJobCategory.Name_en,
              de: leve.ClassJobCategory.Name_de,
              ja: leve.ClassJobCategory.Name_ja,
              fr: leve.ClassJobCategory.Name_fr
            }
          };
        });
      })
    );
  }

  searchNpc(query: string, filters: SearchFilter[]): Observable<NpcSearchResult[]> {
    return this.xivapi.search({
      language: this.getSearchLang(),
      indexes: [SearchIndex.ENPCRESIDENT],
      columns: ['ID', 'Title_*', 'Icon'],
      // I know, it looks like it's the same, but it isn't
      string: query.split('-').join('–'),
      filters: []
    }).pipe(
      map(res => {
        return res.Results.map(npc => {
          return {
            id: npc.ID,
            icon: npc.Icon,
            title: {
              en: npc.Title_en,
              de: npc.Title_de,
              ja: npc.Title_ja,
              fr: npc.Title_fr
            }
          };
        });
      })
    );
  }

  searchMob(query: string, filters: SearchFilter[]): Observable<MobSearchResult[]> {
    return this.xivapi.search({
      language: this.getSearchLang(),
      indexes: [SearchIndex.BNPCNAME],
      columns: ['ID', 'Icon'],
      // I know, it looks like it's the same, but it isn't
      string: query.split('-').join('–'),
      filters: []
    }).pipe(
      map(res => {
        return res.Results.map(mob => {
          return {
            id: mob.ID,
            icon: mob.Icon,
            zoneid: monsters[mob.ID] && monsters[mob.ID].positions[0] ? monsters[mob.ID].positions[0].zoneid : null
          };
        });
      })
    );
  }

  searchFate(query: string, filters: SearchFilter[]): Observable<FateSearchResult[]> {
    return this.xivapi.search({
      language: this.getSearchLang(),
      indexes: [SearchIndex.FATE],
      columns: ['ID', 'IconMap', 'ClassJobLevel'],
      // I know, it looks like it's the same, but it isn't
      string: query.split('-').join('–'),
      filters: []
    }).pipe(
      map(res => {
        return res.Results.map(fate => {
          return {
            id: fate.ID,
            icon: fate.IconMap,
            level: fate.ClassJobLevel
          };
        });
      })
    );
  }

  searchMap(query: string, filters: SearchFilter[]): Observable<MapSearchResult[]> {
    return this.xivapi.search({
      language: this.getSearchLang(),
      indexes: [SearchIndex.PLACENAME],
      columns: ['ID', 'Name_*'],
      // I know, it looks like it's the same, but it isn't
      string: query.split('-').join('–'),
      filters: []
    }).pipe(
      map(res => {
        return res.Results.map(place => {
          const entry = mapIds.find(m => m.zone === place.ID);
          if (entry === undefined) {
            return null;
          }
          return {
            id: entry.id,
            zoneid: place.ID
          };
        }).filter(r => r !== null);
      })
    );
  }

  searchLore(query: string, filters: SearchFilter[]): Observable<any[]> {
    return this.xivapi.searchLore(query, this.getSearchLang(), true, ['Icon', 'Name_*', 'Banner']).pipe(
      map(searchResult => {
        return searchResult.Results.map(row => {
          switch (row.Source.toLowerCase()) {
            case 'item':
            case 'leve':
              row.Data.showButton = true;
              break;
            case 'quest': {
              const quest = this.l12n.getQuest(row.SourceID);
              row.Data.Icon = quest.icon;
              row.Data.Name_en = quest.name.en;
              row.Data.Name_ja = quest.name.ja;
              row.Data.Name_de = quest.name.de;
              row.Data.Name_fr = quest.name.fr;
              row.Data.Name_ko = quest.name.ko || quest.name.en;
              row.Data.showButton = true;
              break;
            }
            case 'defaulttalk': {
              const npcId = Object.keys(this.lazyData.npcs)
                .find(key => this.lazyData.npcs[key].defaultTalks.indexOf(row.SourceID) > -1);
              if (npcId === undefined) {
                break;
              }
              row.Source = 'npc';
              row.SourceID = +npcId;
              row.Data.Icon = '/c/ENpcResident.png';
              const npcEntry = this.l12n.getNpc(+npcId);
              row.Data.Name_en = npcEntry.en;
              row.Data.Name_ja = npcEntry.ja;
              row.Data.Name_de = npcEntry.de;
              row.Data.Name_fr = npcEntry.fr;
              row.Data.Name_ko = npcEntry.ko || npcEntry.en;
              row.Data.showButton = true;
              break;
            }
            case 'balloon': {
              const npcId = Object.keys(this.lazyData.npcs)
                .find(key => this.lazyData.npcs[key].balloon === row.SourceID);
              if (npcId === undefined) {
                break;
              }
              row.Source = 'npc';
              row.SourceID = +npcId;
              row.Data.Icon = '/c/ENpcResident.png';
              const npcEntry = this.l12n.getNpc(+npcId);
              row.Data.Name_en = npcEntry.en;
              row.Data.Name_ja = npcEntry.ja;
              row.Data.Name_de = npcEntry.de;
              row.Data.Name_fr = npcEntry.fr;
              row.Data.Name_ko = npcEntry.ko || npcEntry.en;
              row.Data.showButton = true;
              break;
            }
            case 'instancecontenttextdata': {
              const instanceId = Object.keys(this.lazyData.instances)
                .find(key => (this.lazyData.instances[key].contentText || []).indexOf(row.SourceID) > -1);
              if (instanceId === undefined) {
                break;
              }
              const instanceEntry = this.l12n.getInstanceName(+instanceId);
              row.Source = 'instance';
              row.SourceID = +instanceId;
              row.Data.Icon = instanceEntry.icon;
              row.Data.Name_en = instanceEntry.en;
              row.Data.Name_ja = instanceEntry.ja;
              row.Data.Name_de = instanceEntry.de;
              row.Data.Name_fr = instanceEntry.fr;
              row.Data.Name_ko = instanceEntry.ko || instanceEntry.en;
              row.Data.showButton = true;
              break;
            }
          }
          return row;
        });
      })
    );
  }

  getSearchLang(): string {
    let lang = this.translate.currentLang;
    if (['fr', 'en', 'ja', 'de'].indexOf(lang) === -1) {
      lang = 'en';
    }
    return lang;
  }

  resetFilters(): void {
    this.itemFiltersform.reset({
      ilvlMin: 0,
      ilvlMax: 999,
      elvlMin: 0,
      elvlMax: 70,
      clvlMin: 0,
      clvlMax: 70,
      jobCategories: [],
      craftJob: 0,
      itemCategories: []
    });

    this.instanceFiltersForm.reset({
      lvlMin: 0,
      lvlMax: 80
    });

    this.leveFiltersForm.reset({
      lvlMin: 0,
      lvlMax: 80,
      jobCategory: 1
    });
    this.submitFilters();
  }

  submitFilters(): void {
    switch (this.searchType$.value) {
      case SearchType.ITEM:
      case SearchType.RECIPE:
        this.filters$.next(this.getItemFilters(this.itemFiltersform.controls));
        break;
      case SearchType.INSTANCE:
        this.filters$.next(this.getInstanceFilters(this.instanceFiltersForm.controls));
        break;
      case SearchType.LEVE:
        this.filters$.next(this.getLeveFilters(this.leveFiltersForm.controls));
        break;
    }
  }

  private filtersToForm(filters: SearchFilter[]): { [key: string]: any } {
    const formRawValue = {};
    (filters || []).forEach(f => {
      if (f.value !== null && f.value.min !== undefined) {
        formRawValue[`${f.name}Min`] = f.value.min;
        formRawValue[`${f.name}Max`] = f.value.max;
      } else if (f.value !== null) {
        formRawValue[f.name] = f.value;
      }
    });
    return formRawValue;
  }

  private getItemFilters(controls: { [key: string]: AbstractControl }): SearchFilter[] {
    const filters = [];
    if (controls.ilvlMax.value < 999 || controls.ilvlMin.value > 0) {
      filters.push({
        minMax: true,
        name: 'ilvl',
        value: {
          min: controls.ilvlMin.value,
          max: controls.ilvlMax.value
        }
      });
    }
    if (controls.elvlMax.value < 80 || controls.elvlMin.value > 0) {
      filters.push({
        minMax: true,
        name: 'elvl',
        value: {
          min: controls.elvlMin.value,
          max: controls.elvlMax.value
        }
      });
    }
    if (controls.clvlMax.value < 80 || controls.clvlMin.value > 0) {
      filters.push({
        minMax: true,
        name: 'clvl',
        value: {
          min: controls.clvlMin.value,
          max: controls.clvlMax.value
        }
      });
    }
    if (controls.jobCategories.value.length > 0) {
      filters.push({
        minMax: false,
        name: 'jobCategories',
        value: controls.jobCategories.value
      });
    }
    if (controls.craftJob.value !== 0) {
      filters.push({
        minMax: false,
        name: 'craftJob',
        value: controls.craftJob.value
      });
    }
    if (controls.itemCategories.value.length > 0) {
      filters.push({
        minMax: false,
        name: 'itemCategories',
        value: controls.itemCategories.value
      });
    }
    return filters;
  }

  private getInstanceFilters(controls: { [key: string]: AbstractControl }): SearchFilter[] {
    const filters = [];
    if (controls.lvlMin.value > 0 || controls.lvlMax.value < 80) {
      filters.push({
        minMax: true,
        name: 'ContentFinderCondition.ClassJobLevelRequired',
        value: {
          min: controls.lvlMin.value,
          max: controls.lvlMax.value
        }
      });
    }
    return filters;
  }

  private getLeveFilters(controls: { [key: string]: AbstractControl }): SearchFilter[] {
    const filters = [];
    if (controls.lvlMin.value > 0 || controls.lvlMax.value < 80) {
      filters.push({
        minMax: true,
        name: 'ClassJobLevel',
        value: {
          min: controls.lvlMin.value,
          max: controls.lvlMax.value
        }
      });
    }
    if (controls.jobCategory.value !== 1) {
      filters.push({
        name: 'ClassJobCategoryTargetID',
        value: controls.jobCategory.value
      });
    }
    return filters;
  }

  public getStars(amount: number): string {
    return this.htmlTools.generateStars(amount);
  }

  public createQuickList(item: SearchResult): void {
    const list = this.listsFacade.newEphemeralList(this.i18n.getName(this.l12n.getItem(+item.itemId)));
    const operation$ = this.listManager.addToList(+item.itemId, list, item.recipe ? item.recipe.recipeId : '', item.amount, item.addCrafts)
      .pipe(
        tap(resultList => this.listsFacade.addList(resultList)),
        mergeMap(resultList => {
          return this.listsFacade.myLists$.pipe(
            map(lists => lists.find(l => l.createdAt === resultList.createdAt && l.$key !== undefined)),
            filter(l => l !== undefined),
            first()
          );
        })
      );

    this.progressService.showProgress(operation$, 1)
      .subscribe((newList) => {
        this.router.navigate(['list', newList.$key]);
      });
  }

  public addItemsToList(items: SearchResult[]): void {
    this.listPicker.pickList().pipe(
      mergeMap(list => {
        const operations = items.map(item => {
          return this.listManager.addToList(+item.itemId, list,
            item.recipe ? item.recipe.recipeId : '', item.amount, item.addCrafts);
        });
        let operation$: Observable<any>;
        if (operations.length > 0) {
          operation$ = concat(
            ...operations
          );
        } else {
          operation$ = of(list);
        }
        return this.progressService.showProgress(operation$,
          items.length,
          'Adding_recipes',
          { amount: items.length, listname: list.name });
      }),
      tap(list => list.$key ? this.listsFacade.updateList(list) : this.listsFacade.addList(list)),
      mergeMap(list => {
        // We want to get the list created before calling it a success, let's be pessimistic !
        return this.progressService.showProgress(
          combineLatest([this.listsFacade.myLists$, this.listsFacade.listsWithWriteAccess$]).pipe(
            map(([myLists, listsICanWrite]) => [...myLists, ...listsICanWrite]),
            map(lists => lists.find(l => l.createdAt === list.createdAt && l.$key === list.$key && l.$key !== undefined)),
            filter(l => l !== undefined),
            first()
          ), 1, 'Saving_in_database');
      })
    ).subscribe((list) => {
      this.itemsAdded = items.length;
      this.modifiedList = list;
      this.notificationService.template(this.notification);
    });
  }

  public getShareUrl(): string {
    return `https://ffxivteamcraft.com/${(location.pathname + location.search).substr(1)}`;
  }

  public afterShareLinkCopied(): void {
    this.message.success(this.translate.instant('ITEMS.Share_url_copied'));
  }

  public addSelectedItemsToList(items: SearchResult[]): void {
    this.addItemsToList(items.filter(item => item.selected));
  }

  public selectAll(items: SearchResult[], selected: boolean): void {
    (items || []).forEach(item => item.selected = selected);
  }

  public openInSimulator(itemId: number, recipeId: string): void {
    this.rotationPicker.openInSimulator(itemId, recipeId);
  }

  public updateAllSelected(items: SearchResult[]): void {
    this.allSelected = items.reduce((res, item) => item.selected && res, true);
  }

  trackByItem(index: number, item: SearchResult): number {
    return +item.itemId;
  }
}
