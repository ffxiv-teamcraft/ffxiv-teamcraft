import { Component, Inject, OnInit, PLATFORM_ID, TemplateRef, ViewChild } from '@angular/core';
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
import { AbstractControl, FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { SearchFilter } from '../../../model/search/search-filter.interface';
import { SearchAlgo, SearchIndex, XivapiEndpoint, XivapiService } from '@xivapi/angular-client';
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
import { ActionSearchResult } from '../../../model/search/action-search-result';
import { StatusSearchResult } from '../../../model/search/status-search-result';
import { isPlatformBrowser, isPlatformServer } from '@angular/common';
import * as _ from 'lodash';
import { stats } from '../../../core/data/sources/stats';

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
    new BehaviorSubject<SearchType>(<SearchType>localStorage.getItem('search:type') || SearchType.ANY);

  @ViewChild('notificationRef', { static: true })
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
    craftJob: [null],
    itemCategories: [[]],
    stats: this.fb.array([]),
    bonuses: this.fb.array([])
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

  actionFilterForm: FormGroup = this.fb.group({
    lvlMin: [0],
    lvlMax: [80],
    jobCategory: [1]
  });

  traitFilterForm: FormGroup = this.fb.group({
    lvlMin: [0],
    lvlMax: [80],
    jobCategory: [1]
  });

  availableStats = stats;

  availableLeveJobCategories = [9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 34];

  availableCraftJobs = [];

  availableJobs = [];

  uiCategories$: Observable<{ id: number, name: I18nName }[]>;

  autocomplete$: Observable<string[]> = combineLatest([this.query$, this.searchType$]).pipe(
    map(([query, type]) => {
      return (JSON.parse(localStorage.getItem('search:history') || '{}')[type] || [])
        .filter(entry => entry.toLowerCase().indexOf(query.toLowerCase()) > -1 && entry.length > 0)
        .reverse();
    })
  );

  sortBy$ = new BehaviorSubject<string>('');

  sortOrder$ = new BehaviorSubject<'asc' | 'desc'>('desc');

  sort$ = combineLatest([this.sortBy$, this.sortOrder$]);

  possibleSortEntries$: Observable<{ label: string, field: string }[]> = this.searchType$.pipe(
    map(type => {
      const sortEntries = [
        {
          label: 'ID',
          field: 'ID'
        },
        {
          label: 'Relevance',
          field: ''
        }
      ];
      switch (type) {
        case SearchType.ITEM:
          sortEntries.push(...[
            {
              label: 'Level',
              field: 'LevelEquip'
            },
            {
              label: 'Ilvl',
              field: 'LevelItem'
            }
          ]);
          break;
        case SearchType.RECIPE:
          sortEntries.push(...[
            {
              label: 'Level',
              field: 'LevelEquip'
            },
            {
              label: 'Ilvl',
              field: 'LevelItem'
            },
            {
              label: 'Rlvl',
              field: 'Recipes.Level'
            }
          ]);
          break;
        case SearchType.INSTANCE:
          sortEntries.push({
            label: 'Level',
            field: 'ContentFinderCondition.ClassJobLevelRequired'
          });
          break;
        case SearchType.QUEST:
          sortEntries.push({
            label: 'Level',
            field: 'ClassJobLevel0'
          });
          break;
        case SearchType.LEVE:
        case SearchType.ACTION:
        case SearchType.TRAIT:
          sortEntries.push({
            label: 'Level',
            field: 'ClassJobLevel'
          });
          break;
        default:
          break;
      }
      return sortEntries;
    })
  );

  patch$: Observable<number> = this.query$.pipe(
    map(query => {
      const matches = /patch:([\d.]+)/.exec(query);
      if (matches && matches[1]) {
        return this.lazyData.patches.find(p => {
          return p.Version === matches[1];
        });
      }
      return null;
    })
  );

  constructor(private gt: GarlandToolsService, private data: DataService, public settings: SettingsService,
              private router: Router, private route: ActivatedRoute, private listsFacade: ListsFacade,
              private listManager: ListManagerService, private notificationService: NzNotificationService,
              private l12n: LocalizedDataService, private i18n: I18nToolsService, private listPicker: ListPickerService,
              private progressService: ProgressPopupService, private fb: FormBuilder, private xivapi: XivapiService,
              private rotationPicker: RotationPickerService, private htmlTools: HtmlToolsService,
              private message: NzMessageService, public translate: TranslateService, private lazyData: LazyDataService,
              @Inject(PLATFORM_ID) private platform: Object) {
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
    if (isPlatformBrowser(this.platform)) {
      this.searchType$.subscribe(value => {
        localStorage.setItem('search:type', value);
      });
    }
  }

  ngOnInit(): void {
    this.gt.onceLoaded$.pipe(first()).subscribe(() => {
      this.availableCraftJobs = this.gt.getJobs().filter(job => job.category.indexOf('Hand') > -1);
      this.availableJobs = this.gt.getJobs().filter(job => job.id > 0).map(job => job.id);
    });
    this.results$ = combineLatest([this.query$, this.searchType$, this.filters$, this.sort$]).pipe(
      debounceTime(1200),
      filter(([query, , filters]) => {
        if (['ko', 'zh'].indexOf(this.translate.currentLang.toLowerCase()) > -1) {
          // Chinese and korean characters system use fewer chars for the same thing, filters have to be handled accordingly.
          return query.length > 0 || filters.length > 0;
        }
        return query.length > 3 || filters.length > 0;
      }),
      tap(([query, type, filters, [sortBy, sortOrder]]) => {
        this.allSelected = false;
        this.showIntro = false;
        this.loading = true;
        const queryParams: any = {
          query: query,
          type: type,
          filters: null
        };
        if (sortBy) {
          queryParams.sort = sortBy;
          queryParams.order = sortOrder;
        }
        if (filters.filter(f => f.name !== 'Patch').length > 0) {
          queryParams.filters = btoa(JSON.stringify(filters.filter(f => f.name !== 'Patch')));
        } else {
          queryParams.filters = null;
        }
        if (query.length > 0) {
          const searchHistory = JSON.parse(localStorage.getItem('search:history') || '{}');
          searchHistory[type] = _.uniq([...(searchHistory[type] || []), query]);
          localStorage.setItem('search:history', JSON.stringify(searchHistory));
        }
        this.router.navigate([], {
          queryParamsHandling: 'merge',
          queryParams: queryParams,
          relativeTo: this.route
        });
      }),
      mergeMap(([query, type, filters, sort]) => {
        let searchRequest$: Observable<any[]>;
        let processedQuery = query;
        const matches = /patch:([\d.]+)/.exec(query);
        if (matches && matches[1]) {
          processedQuery = query.replace(/patch:([\d.]+)/, '');
          const patch = this.lazyData.patches.find(p => {
            return p.Version === matches[1];
          });
          if (patch) {
            filters = filters.filter(f => f.name !== 'Patch');
            filters.push({
              name: 'Patch',
              value: patch.ID
            });
          }
        }
        switch (type) {
          case SearchType.ANY:
            searchRequest$ = this.searchAny(processedQuery, filters);
            break;
          case SearchType.ITEM:
            searchRequest$ = this.data.searchItem(processedQuery, filters, false, sort);
            break;
          case SearchType.RECIPE:
            searchRequest$ = this.data.searchItem(processedQuery, filters, true, sort);
            break;
          case SearchType.INSTANCE:
            searchRequest$ = this.searchInstance(processedQuery, filters);
            break;
          case SearchType.QUEST:
            searchRequest$ = this.searchQuest(processedQuery, filters);
            break;
          case SearchType.NPC:
            searchRequest$ = this.searchNpc(processedQuery, filters);
            break;
          case SearchType.LEVE:
            searchRequest$ = this.searchLeve(processedQuery, filters);
            break;
          case SearchType.MONSTER:
            searchRequest$ = this.searchMob(processedQuery, filters);
            break;
          case SearchType.LORE:
            searchRequest$ = this.searchLore(processedQuery, filters);
            break;
          case SearchType.FATE:
            searchRequest$ = this.searchFate(processedQuery, filters);
            break;
          case SearchType.MAP:
            searchRequest$ = this.searchMap(processedQuery, filters);
            break;
          case SearchType.ACTION:
            searchRequest$ = this.searchAction(processedQuery, filters);
            break;
          case SearchType.STATUS:
            searchRequest$ = this.searchStatus(processedQuery, filters);
            break;
          case SearchType.TRAIT:
            searchRequest$ = this.searchTrait(processedQuery, filters);
            break;
          case SearchType.ACHIEVEMENT:
            searchRequest$ = this.searchAchievement(processedQuery, filters);
            break;
          default:
            searchRequest$ = this.data.searchItem(processedQuery, filters, false, sort);
            break;
        }
        if (type === SearchType.ANY) {
          return searchRequest$;
        } else {
          return searchRequest$.pipe(
            map(results => {
              return results.map(row => {
                row.type = type;
                return row;
              });
            })
          );
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
        this.itemFiltersform.patchValue(this.filtersToForm(filters, this.itemFiltersform));
        this.leveFiltersForm.patchValue(this.filtersToForm(filters, this.leveFiltersForm));
        this.actionFilterForm.patchValue(this.filtersToForm(filters, this.actionFilterForm));
        this.instanceFiltersForm.patchValue(this.filtersToForm(filters, this.instanceFiltersForm));
        this.traitFilterForm.patchValue(this.filtersToForm(filters, this.traitFilterForm));
      }
      if (params.sort !== undefined) {
        this.sortBy$.next(params.sort);
        this.sortOrder$.next(params.order);
      }
    });
  }

  addFilter(type: 'stats' | 'bonuses'): void {
    (this.itemFiltersform.get(type) as FormArray).push(this.fb.group({
      name: '',
      min: 0,
      max: 9999
    }));
  }

  removeFilter(type: 'stats' | 'bonuses', i: number): void {
    (this.itemFiltersform.get(type) as FormArray).removeAt(i);
  }

  searchAny(query: string, filters: SearchFilter[]): Observable<any[]> {
    return combineLatest([
      this.data.searchItem(query, filters, false).pipe(map(res => res.map(row => {
        row.type = SearchType.ITEM;
        return row;
      }))),
      this.searchInstance(query, filters).pipe(map(res => res.map(row => {
        row.type = SearchType.INSTANCE;
        return row;
      }))),
      this.searchQuest(query, filters).pipe(map(res => res.map(row => {
        row.type = SearchType.QUEST;
        return row;
      }))),
      this.searchAction(query, filters).pipe(map(res => res.map(row => {
        row.type = SearchType.ACTION;
        return row;
      }))),
      this.searchTrait(query, filters).pipe(map(res => res.map(row => {
        row.type = SearchType.TRAIT;
        return row;
      }))),
      this.searchStatus(query, filters).pipe(map(res => res.map(row => {
        row.type = SearchType.STATUS;
        return row;
      }))),
      this.searchLeve(query, filters).pipe(map(res => res.map(row => {
        row.type = SearchType.LEVE;
        return row;
      }))),
      this.searchNpc(query, filters).pipe(map(res => res.map(row => {
        row.type = SearchType.NPC;
        return row;
      }))),
      this.searchMob(query, filters).pipe(map(res => res.map(row => {
        row.type = SearchType.MONSTER;
        return row;
      }))),
      this.searchFate(query, filters).pipe(map(res => res.map(row => {
        row.type = SearchType.FATE;
        return row;
      }))),
      this.searchMap(query, filters).pipe(map(res => res.map(row => {
        row.type = SearchType.MAP;
        return row;
      }))),
      this.searchAchievement(query, filters).pipe(map(res => res.map(row => {
        row.type = SearchType.ACHIEVEMENT;
        return row;
      })))
    ]).pipe(
      map(results => [].concat.apply([], results))
    );
  }

  searchInstance(query: string, filters: SearchFilter[]): Observable<InstanceSearchResult[]> {
    return this.xivapi.search({
      language: this.getSearchLang(),
      string_algo: SearchAlgo.WILDCARD_PLUS,
      indexes: [SearchIndex.INSTANCECONTENT],
      columns: ['ID', 'Banner', 'Icon', 'ContentFinderCondition.ClassJobLevelRequired'],
      // I know, it looks like it's the same, but it isn't
      string: query.split('-').join('–'),
      filters: [].concat.apply([], filters
        .filter(f => f.value !== null)
        .map(f => {
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
      string_algo: SearchAlgo.WILDCARD_PLUS,
      indexes: [SearchIndex.QUEST],
      columns: ['ID', 'Banner', 'Icon'],
      // I know, it looks like it's the same, but it isn't
      string: query.split('-').join('–'),
      filters: [].concat.apply([], filters
        .filter(f => f.value !== null)
        .map(f => {
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

  searchAction(query: string, filters: SearchFilter[]): Observable<ActionSearchResult[]> {
    return this.xivapi.search({
      language: this.getSearchLang(),
      string_algo: SearchAlgo.WILDCARD_PLUS,
      indexes: [SearchIndex.ACTION, <SearchIndex>'craftaction'],
      columns: ['ID', 'Icon', 'ClassJobLevel', 'ClassJob', 'ClassJobCategory'],
      // I know, it looks like it's the same, but it isn't
      string: query.split('-').join('–'),
      filters: [].concat.apply([], filters
        .filter(f => f.value !== null)
        .map(f => {
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
        return res.Results.map(action => {
          return {
            id: action.ID,
            icon: action.Icon,
            job: action.ClassJob || action.ClassJobCategory,
            level: action.ClassJobLevel
          };
        });
      })
    );
  }

  searchTrait(query: string, filters: SearchFilter[]): Observable<ActionSearchResult[]> {
    return this.xivapi.search({
      language: this.getSearchLang(),
      string_algo: SearchAlgo.WILDCARD_PLUS,
      indexes: [<SearchIndex>'trait'],
      columns: ['ID', 'Icon', 'Level', 'ClassJob', 'ClassJobCategory'],
      // I know, it looks like it's the same, but it isn't
      string: query.split('-').join('–'),
      filters: [].concat.apply([], filters
        .filter(f => f.value !== null)
        .map(f => {
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
        return res.Results.map(action => {
          return {
            id: action.ID,
            icon: action.Icon,
            job: action.ClassJob || action.ClassJobCategory,
            level: action.Level
          };
        });
      })
    );
  }

  searchStatus(query: string, filters: SearchFilter[]): Observable<StatusSearchResult[]> {
    return this.xivapi.search({
      language: this.getSearchLang(),
      string_algo: SearchAlgo.WILDCARD_PLUS,
      indexes: [SearchIndex.STATUS],
      columns: ['ID', 'Icon', 'Name_*', 'Description_*'],
      // I know, it looks like it's the same, but it isn't
      string: query.split('-').join('–'),
      filters: [].concat.apply([], filters
        .filter(f => f.value !== null)
        .map(f => {
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
        return res.Results.map(status => {
          return {
            id: status.ID,
            icon: status.Icon,
            data: status
          };
        });
      })
    );
  }

  searchAchievement(query: string, filters: SearchFilter[]): Observable<StatusSearchResult[]> {
    return this.xivapi.search({
      language: this.getSearchLang(),
      string_algo: SearchAlgo.WILDCARD_PLUS,
      indexes: [SearchIndex.ACHIEVEMENT],
      columns: ['ID', 'Icon', 'Name_*', 'Description_*'],
      // I know, it looks like it's the same, but it isn't
      string: query.split('-').join('–'),
      filters: [].concat.apply([], filters
        .filter(f => f.value !== null)
        .map(f => {
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
        return res.Results.map(achievement => {
          return {
            id: achievement.ID,
            icon: achievement.Icon,
            data: achievement
          };
        });
      })
    );
  }

  searchLeve(query: string, filters: SearchFilter[]): Observable<LeveSearchResult[]> {
    return this.xivapi.search({
      language: this.getSearchLang(),
      string_algo: SearchAlgo.WILDCARD_PLUS,
      indexes: [SearchIndex.LEVE],
      columns: ['ID', 'Banner', 'Icon', 'ClassJobCategory', 'IconIssuer', 'ClassJobLevel'],
      // I know, it looks like it's the same, but it isn't
      string: query.split('-').join('–'),
      filters: [].concat.apply([], filters
        .filter(f => f.value !== null)
        .map(f => {
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
      string_algo: SearchAlgo.WILDCARD_PLUS,
      indexes: [SearchIndex.ENPCRESIDENT],
      columns: ['ID', 'Title_*', 'Icon'],
      // I know, it looks like it's the same, but it isn't
      string: query.split('-').join('–'),
      filters: [].concat.apply([], filters
        .filter(f => f.value !== null)
        .map(f => {
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
      string_algo: SearchAlgo.WILDCARD_PLUS,
      indexes: [SearchIndex.BNPCNAME],
      columns: ['ID', 'Icon'],
      // I know, it looks like it's the same, but it isn't
      string: query.split('-').join('–'),
      filters: [].concat.apply([], filters
        .filter(f => f.value !== null)
        .map(f => {
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
      string_algo: SearchAlgo.WILDCARD_PLUS,
      indexes: [SearchIndex.FATE],
      columns: ['ID', 'IconMap', 'ClassJobLevel'],
      // I know, it looks like it's the same, but it isn't
      string: query.split('-').join('–'),
      filters: [].concat.apply([], filters
        .filter(f => f.value !== null)
        .map(f => {
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
      string_algo: SearchAlgo.WILDCARD_PLUS,
      indexes: [SearchIndex.PLACENAME],
      columns: ['ID', 'Name_*'],
      // I know, it looks like it's the same, but it isn't
      string: query.split('-').join('–'),
      filters: [].concat.apply([], filters
        .filter(f => f.value !== null)
        .map(f => {
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
    this.sortBy$.next('');
    this.sortOrder$.next('desc');

    this.itemFiltersform.reset({
      ilvlMin: 0,
      ilvlMax: 999,
      elvlMin: 0,
      elvlMax: 80,
      clvlMin: 0,
      clvlMax: 80,
      jobCategory: [],
      craftJob: null,
      itemCategories: [],
      stats: [],
      bonuses: []
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

    this.actionFilterForm.reset({
      lvlMin: 0,
      lvlMax: 80,
      jobCategory: 0
    });

    this.traitFilterForm.reset({
      lvlMin: 0,
      lvlMax: 80,
      jobCategory: 0
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
      case SearchType.ACTION:
        this.filters$.next(this.getActionFilters(this.actionFilterForm.controls));
        break;
      case SearchType.TRAIT:
        this.filters$.next(this.getTraitFilters(this.traitFilterForm.controls));
        break;
    }
  }

  private filtersToForm(filters: SearchFilter[], form: FormGroup): { [key: string]: any } {
    const formRawValue = {};
    (filters || []).forEach(f => {
      if (f.value !== null) {
        if (f.formArray) {
          if (form.get(f.formArray) === null) {
            form.setControl(f.formArray, this.fb.array([]));
          }
          if (!(form.get(f.formArray) as FormArray).controls.some(control => control.value.name === f.entryName)) {
            (form.get(f.formArray) as FormArray).push(
              this.fb.group({
                name: f.entryName,
                min: f.value.min,
                max: f.value.max
              })
            );
          }
          formRawValue[f.formArray] = [
            ...(formRawValue[f.formArray] || []),
            {
              name: f.entryName,
              min: f.value.min,
              max: f.value.max
            }
          ];
        } else if (f.value.min !== undefined) {
          formRawValue[`${f.name}Min`] = f.value.min;
          formRawValue[`${f.name}Max`] = f.value.max;
        } else {
          formRawValue[f.name] = f.value;
        }
      }
    });
    return formRawValue;
  }

  private getItemFilters(controls: { [key: string]: AbstractControl }): SearchFilter[] {
    const filters = [];
    if (controls.ilvlMax.value < 999 || controls.ilvlMin.value > 0) {
      filters.push({
        minMax: true,
        name: 'LevelItem',
        value: {
          min: controls.ilvlMin.value,
          max: controls.ilvlMax.value
        }
      });
    }
    if ((controls.stats as FormArray).controls.length > 0) {
      filters.push(...controls.stats.value.map(entry => {
        let fieldName: string;
        let valueMultiplier = 1;
        switch (entry.name) {
          case 'PhysicalDamage':
            fieldName = 'DamagePhys';
            break;
          case 'MagicalDamage':
            fieldName = 'DamageMag';
            break;
          case 'Defense':
            fieldName = 'DefensePhys';
            break;
          case 'MagicDefense':
            fieldName = 'DefenseMag';
            break;
          case 'Delay':
            fieldName = 'DelayMs';
            valueMultiplier = 1000;
            break;
          default:
            fieldName = `Stats.${entry.name}.NQ`;
            break;
        }
        return {
          minMax: true,
          formArray: 'stats',
          name: fieldName,
          entryName: entry.name,
          value: {
            min: (+entry.min * valueMultiplier),
            max: (+entry.max * valueMultiplier)
          }
        };
      }));
    }
    if (controls.bonuses) {
      filters.push(...controls.bonuses.value.map(entry => {
        return {
          minMax: true,
          formArray: 'bonuses',
          name: `Bonuses.${entry.name}.Max`,
          entryName: entry.name,
          value: {
            min: entry.min,
            max: entry.max
          }
        };
      }));
    }
    if (controls.elvlMax.value < 80 || controls.elvlMin.value > 0) {
      filters.push({
        minMax: true,
        name: 'LevelEquip',
        value: {
          min: controls.elvlMin.value,
          max: controls.elvlMax.value
        }
      });
    }
    if (controls.clvlMax.value < 80 || controls.clvlMin.value > 0) {
      filters.push({
        minMax: true,
        name: 'Recipes.Level',
        value: {
          min: controls.clvlMin.value,
          max: controls.clvlMax.value
        }
      });
    }
    if (controls.jobCategories.value && controls.jobCategories.value.length > 0) {
      filters.push(...controls.jobCategories.value.map(jobId => {
          return {
            name: `ClassJobCategory.${this.gt.getJob(jobId).abbreviation}`,
            value: 1
          };
        })
      );
    }
    if (controls.craftJob.value) {
      filters.push({
        name: 'Recipes.ClassJobID',
        value: controls.craftJob.value
      });
    }
    if (controls.itemCategories.value && controls.itemCategories.value.length > 0) {
      filters.push({
        array: true,
        name: 'ItemUICategoryTargetID',
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

  private getActionFilters(controls: { [key: string]: AbstractControl }): SearchFilter[] {
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
    if (controls.jobCategory.value !== 0) {
      filters.push({
        name: 'ClassJobTargetID',
        value: controls.jobCategory.value
      });
    }
    return filters;
  }

  private getTraitFilters(controls: { [key: string]: AbstractControl }): SearchFilter[] {
    const filters = [];
    if (controls.lvlMin.value > 0 || controls.lvlMax.value < 80) {
      filters.push({
        minMax: true,
        name: 'Level',
        value: {
          min: controls.lvlMin.value,
          max: controls.lvlMax.value
        }
      });
    }
    if (controls.jobCategory.value !== 0) {
      filters.push({
        name: 'ClassJobTargetID',
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
    if (isPlatformServer(this.platform)) {
      return 'https://ffxivteamcraft.com/search';
    }
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
    this.data.getItem(itemId).pipe(
      first(),
      map(item => item.getCraft(recipeId))
    ).subscribe((recipe) => {
      this.rotationPicker.openInSimulator(itemId, recipeId, recipe);
    });
  }

  public updateAllSelected(items: SearchResult[]): void {
    this.allSelected = items.reduce((res, item) => item.selected && res, true);
  }

  trackByItem(index: number, item: SearchResult): number {
    return +item.itemId;
  }
}
