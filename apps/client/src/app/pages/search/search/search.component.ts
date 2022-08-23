import { Component, Inject, OnInit, PLATFORM_ID, TemplateRef, ViewChild } from '@angular/core';
import { BehaviorSubject, combineLatest, concat, Observable, of } from 'rxjs';
import { GarlandToolsService } from '../../../core/api/garland-tools.service';
import { DataService } from '../../../core/api/data.service';
import { debounceTime, filter, first, map, mergeMap, pairwise, startWith, switchMap, takeUntil, tap } from 'rxjs/operators';
import { SearchResult } from '../../../model/search/search-result';
import { SettingsService } from '../../../modules/settings/settings.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ListsFacade } from '../../../modules/list/+state/lists.facade';
import { List } from '../../../modules/list/model/list';
import { ListManagerService } from '../../../modules/list/list-manager.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { I18nToolsService } from '../../../core/tools/i18n-tools.service';
import { ListPickerService } from '../../../modules/list-picker/list-picker.service';
import { ProgressPopupService } from '../../../modules/progress-popup/progress-popup.service';
import { AbstractControl, FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { SearchFilter } from '../../../model/search/search-filter.interface';
import { XivapiEndpoint, XivapiService } from '@xivapi/angular-client';
import { I18nName } from '../../../model/common/i18n-name';
import { RotationPickerService } from '../../../modules/rotations/rotation-picker.service';
import { HtmlToolsService } from '../../../core/tools/html-tools.service';
import { TranslateService } from '@ngx-translate/core';
import { SearchType } from '../search-type';
import { isPlatformBrowser, isPlatformServer } from '@angular/common';
import * as _ from 'lodash';
import { stats } from '../../../core/data/sources/stats';
import { KeysOfType } from '../../../core/tools/key-of-type';
import { XivapiPatch } from '../../../core/data/model/xivapi-patch';
import { Language } from '../../../core/data/language';
import { TeamcraftComponent } from '../../../core/component/teamcraft-component';
import { PlatformService } from '../../../core/tools/platform.service';
import { GaActionEnum, GoogleAnalyticsService } from 'ngx-google-analytics';
import { LazyDataFacade } from '../../../lazy-data/+state/lazy-data.facade';
import { safeCombineLatest } from '../../../core/rxjs/safe-combine-latest';
import { IS_HEADLESS } from 'apps/client/src/environments/is-headless';
import { EnvironmentService } from '../../../core/environment.service';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.less']
})
export class SearchComponent extends TeamcraftComponent implements OnInit {

  //Minimum and Maximum values for various nz-input-number elements
  curMaxLevel = this.environment.maxLevel; //max player level
  maxilvlFilter = 999;

  maxStatFilter = 99999;

  searchTypes = SearchType;

  query$: BehaviorSubject<string> = new BehaviorSubject<string>('');

  queryChangeValue?: string | null;

  results$: Observable<SearchResult[]>;

  selection$: BehaviorSubject<SearchResult[]> = new BehaviorSubject<SearchResult[]>([]);

  filters$: BehaviorSubject<SearchFilter[]> = new BehaviorSubject<any>([]);

  showIntro = true;

  loading = false;

  public searchType$: BehaviorSubject<SearchType> =
    new BehaviorSubject<SearchType>(<SearchType>localStorage.getItem('search:type') || SearchType.ITEM);

  public availableLanguages = ['en', 'de', 'fr', 'ja', 'ko', 'zh'];

  public searchLang$: BehaviorSubject<Language> = new BehaviorSubject<Language>(this.settings.searchLanguage);

  @ViewChild('notificationRef', { static: true })
  notification: TemplateRef<any>;

  // Notification data
  itemsAdded = 0;

  modifiedList: List;

  allSelected = false;

  filtersForm: FormGroup = this.fb.group({
    Patch: [-1],
    ilvlMin: [0],
    ilvlMax: [999],
    elvlMin: [0],
    elvlMax: [this.curMaxLevel],
    clvlMin: [0],
    clvlMax: [this.curMaxLevel],
    jobCategories: [[]],
    craftJob: [null],
    itemCategories: [[]],
    stats: this.fb.array([]),
    bonuses: this.fb.array([]),
    collectable: [false],
    // Instances, leves and actions
    lvlMin: [0],
    lvlMax: [this.curMaxLevel]
  });

  availableStats = stats;

  availableLeveJobCategories = [9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 34];

  availableCraftJobs = [];

  availableJobs = [];

  availableJobCategories = [30, 31, 32, 33];

  uiCategories$: Observable<{ id: number, name: I18nName }[]>;

  patches$: Observable<XivapiPatch[]> = this.lazyData.patches$.pipe(
    map(patches => patches.reverse())
  );

  autocomplete$: Observable<string[]> = combineLatest([this.query$, this.searchType$]).pipe(
    map(([query, type]) => {
      return (JSON.parse(localStorage.getItem('search:history') || '{}')[type] || [])
        .filter(entry => entry.toLowerCase().indexOf(query.toLowerCase()) > -1 && entry.length > 0 && entry !== query)
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

  patch$: Observable<XivapiPatch> = this.filters$.pipe(
    switchMap(filters => {
      const patchFilter = filters.find(f => f.name === 'Patch');
      if (patchFilter) {
        return this.lazyData.patches$.pipe(
          map(patches => patches.find(p => {
            return p.ID === patchFilter.value;
          }))
        );
      }
      return of(null);
    })
  );

  showFilters = this.settings.showSearchFilters;

  constructor(private gt: GarlandToolsService, private data: DataService, public settings: SettingsService,
              private router: Router, private route: ActivatedRoute, private listsFacade: ListsFacade,
              private listManager: ListManagerService, private notificationService: NzNotificationService,
              private i18n: I18nToolsService, private listPicker: ListPickerService,
              private progressService: ProgressPopupService, private fb: FormBuilder, private xivapi: XivapiService,
              private rotationPicker: RotationPickerService, private htmlTools: HtmlToolsService,
              private message: NzMessageService, public translate: TranslateService, private lazyData: LazyDataFacade,
              private analytics: GoogleAnalyticsService, private environment: EnvironmentService,
              private platformService: PlatformService, @Inject(PLATFORM_ID) private platform: Object) {
    super();
    this.uiCategories$ = this.xivapi.getList(XivapiEndpoint.ItemUICategory, {
      columns: ['ID', 'Name_de', 'Name_en', 'Name_fr', 'Name_ja'],
      max_items: 200
    }).pipe(
      switchMap(contentList => {
        return safeCombineLatest(contentList.Results.map(result => {
          const res: any = {
            id: result.ID,
            name: {
              en: result.Name_en,
              fr: result.Name_fr,
              de: result.Name_de,
              ja: result.Name_ja
            }
          };
          if (this.settings.searchLanguage === 'zh') {
            return this.lazyData.getRow('zhItemUiCategories', result.ID).pipe(
              map(zhRow => {
                res.name.zh = zhRow?.zh || result.Name_en;
                return res;
              })
            );
          } else if (this.settings.searchLanguage === 'ko') {
            return this.lazyData.getRow('koItemUiCategories', result.ID).pipe(
              map(koRow => {
                res.name.ko = koRow?.ko || result.Name_en;
                return res;
              })
            );
          } else {
            return of(res);
          }
        }));
      })
    );
    if (isPlatformBrowser(this.platform) && !IS_HEADLESS) {
      this.searchType$.subscribe(value => {
        localStorage.setItem('search:type', value);
      });
    }
    if (this.searchLang$.value === null) {
      this.searchLang$.next(this.translate.currentLang as Language);
    }
  }

  queryChange(value: string, fromEnter: boolean): void {
    if (!this.settings.disableSearchDebounce || fromEnter) {
      this.query$.next(value);
      this.submitFilters();
      this.queryChangeValue = null;
    } else {
      this.queryChangeValue = value;
    }
  }

  ngOnInit(): void {
    this.translate.onLangChange.pipe(
      startWith({ lang: this.translate.currentLang }),
      pairwise(),
      takeUntil(this.onDestroy$)
    ).subscribe(([before, after]) => {
      if (before.lang === this.searchLang$.value) {
        this.searchLang$.next(after.lang as Language);
      }
    });
    this.gt.onceLoaded$.pipe(first()).subscribe(() => {
      this.availableCraftJobs = this.gt.getJobs().filter(job => job.category.indexOf('Hand') > -1);
      this.availableJobs = this.gt.getJobs().filter(job => job.id > 0).map(job => job.id);
    });
    this.results$ = combineLatest([this.query$, this.searchType$, this.filters$, this.sort$, this.searchLang$]).pipe(
      debounceTime(400),
      filter(([query, , filters, , lang]) => {
        if (['ko', 'zh'].indexOf(lang.toLowerCase()) > -1) {
          // Chinese and korean characters system use fewer chars for the same thing, filters have to be handled accordingly.
          return query.length > 0 || filters.length > 0;
        }
        return query.length > 2 || (lang === 'ja' && query.length > 0) || filters.length > 0;
      }),
      tap(([query, type, filters, [sortBy, sortOrder], lang]) => {
        this.allSelected = false;
        this.showIntro = false;
        this.loading = true;
        const queryParams: any = {
          query: query,
          type: type,
          filters: null
        };
        this.analytics.event(GaActionEnum.SEARCH, SearchType[type], query);
        if (sortBy) {
          queryParams.sort = sortBy;
          queryParams.order = sortOrder;
        }
        if (filters.length > 0) {
          queryParams.filters = btoa(JSON.stringify(filters));
        } else {
          queryParams.filters = null;
        }
        if (query.length > 0) {
          const searchHistory = JSON.parse(localStorage.getItem('search:history') || '{}');
          searchHistory[type] = _.uniq([...(searchHistory[type] || []), query]);
          localStorage.setItem('search:history', JSON.stringify(searchHistory));
        }
        this.data.setSearchLang(lang);
        this.router.navigate([], {
          queryParamsHandling: 'merge',
          queryParams: queryParams,
          relativeTo: this.route
        });
      }),
      switchMap(([query, type, filters, sort]) => {
        return this.data.search(query.trim(), type, filters, sort);
      }),
      tap(() => {
        this.loading = false;
      })
    );

    this.route.queryParams.pipe(
      filter(params => {
        return params.query !== undefined && params.type !== undefined;
      }),
      debounceTime(100),
      first(),
      switchMap(params => {
        this.searchType$.next(params.type);
        this.query$.next(params.query);
        if (params.filters !== undefined) {
          const filters = JSON.parse(atob(params.filters));
          this.filters$.next(filters);
          return this.filtersToForm(filters, this.filtersForm);
        }
        if (params.sort !== undefined) {
          this.sortBy$.next(params.sort);
          this.sortOrder$.next(params.order);
        }
        return of(null);
      })
    ).subscribe(patch => {
      if (patch) {
        this.filtersForm.patchValue(patch);
      }
    });
  }

  shouldShowJobPicker(searchType: SearchType): boolean {
    return [SearchType.RECIPE, SearchType.ITEM, SearchType.ACTION, SearchType.LEVE, SearchType.TRAIT].includes(searchType);
  }

  shouldShowLvlFilter(searchType: SearchType): boolean {
    return [SearchType.INSTANCE, SearchType.ACTION, SearchType.LEVE, SearchType.TRAIT].includes(searchType);
  }

  hasAdditionalFilters(searchType: SearchType): boolean {
    return [SearchType.RECIPE, SearchType.ITEM, SearchType.INSTANCE, SearchType.ACTION, SearchType.LEVE, SearchType.TRAIT].includes(searchType);
  }

  addFilter(type: 'stats' | 'bonuses'): void {
    (this.filtersForm.get(type) as FormArray).push(this.fb.group({
      name: ['Strength'],
      min: [0],
      max: [9999],
      exclude: [false]
    }));
  }

  removeFilter(type: 'stats' | 'bonuses', i: number): void {
    (this.filtersForm.get(type) as FormArray).removeAt(i);
  }

  setSearchType(type: SearchType): void {
    this.searchType$.next(type);
    this.router.navigate([], {
      queryParams: {
        type: SearchType[type]
      },
      queryParamsHandling: 'merge'
    });
    this.resetFilters();
  }

  resetFilters(): void {
    this.sortBy$.next('');
    this.sortOrder$.next('desc');
    this.filters$.next([]);
    this.filtersForm.reset({
      Patch: -1,
      ilvlMin: 0,
      ilvlMax: 999,
      elvlMin: 0,
      elvlMax: this.curMaxLevel,
      clvlMin: 0,
      clvlMax: this.curMaxLevel,
      jobCategories: [],
      craftJob: null,
      itemCategories: [],
      stats: [],
      bonuses: [],
      // Instances, leves and actions
      lvlMin: 0,
      lvlMax: this.curMaxLevel
    });

    (this.filtersForm.get('bonuses') as FormArray).clear();
    (this.filtersForm.get('stats') as FormArray).clear();

    const params = this.route.snapshot.queryParams;

    this.router.navigate([], {
      queryParamsHandling: 'merge',
      queryParams: {
        query: params.query,
        type: params.type,
        filters: null
      }
    });
  }

  submitFilters(): void {
    if (this.queryChangeValue) {
      this.query$.next(this.queryChangeValue);
      this.queryChangeValue = null;
    }
    switch (this.searchType$.value) {
      case SearchType.ITEM:
      case SearchType.RECIPE:
        this.filters$.next(this.getItemFilters(this.filtersForm.controls));
        break;
      case SearchType.INSTANCE:
        this.filters$.next(this.getInstanceFilters(this.filtersForm.controls));
        break;
      case SearchType.LEVE:
        this.filters$.next(this.getLeveFilters(this.filtersForm.controls));
        break;
      case SearchType.ACTION:
        this.filters$.next(this.getActionFilters(this.filtersForm.controls));
        break;
      case SearchType.TRAIT:
        this.filters$.next(this.getTraitFilters(this.filtersForm.controls));
        break;
    }
  }

  public getStars(amount: number): string {
    return this.htmlTools.generateStars(amount);
  }

  public createQuickList(item: SearchResult): void {
    this.i18n.getNameObservable('items', +item.itemId).pipe(
      first(),
      switchMap(itemName => {
        const list = this.listsFacade.newEphemeralList(itemName);
        const operation$ = this.listManager.addToList({
          itemId: +item.itemId,
          list: list,
          recipeId: item.recipe ? item.recipe.recipeId : '',
          amount: item.amount,
          collectable: item.addCrafts
        })
          .pipe(
            tap(resultList => this.listsFacade.addList(resultList)),
            mergeMap(resultList => {
              return this.listsFacade.myLists$.pipe(
                map(lists => lists.find(l => l.createdAt.seconds === resultList.createdAt.seconds && l.$key !== undefined)),
                filter(l => l !== undefined),
                first()
              );
            })
          );

        return this.progressService.showProgress(operation$, 1);
      })
    ).subscribe((newList) => {
      this.router.navigate(['list', newList.$key]);
    });
  }

  public addItemsToList(items: SearchResult[]): void {
    this.listPicker.pickList().pipe(
      mergeMap(list => {
        const operations = items.map(item => {
          return this.listManager.addToList({
            itemId: +item.itemId,
            list: list,
            recipeId: item.recipe ? item.recipe.recipeId : '',
            amount: item.amount,
            collectable: item.addCrafts
          });
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
            map(lists => lists.find(l => l.createdAt.seconds === list.createdAt.seconds)),
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

  public getShareUrl = () => {
    if (isPlatformServer(this.platform) || IS_HEADLESS) {
      return 'https://ffxivteamcraft.com/search';
    }
    if (this.platformService.isDesktop()) {
      return `https://ffxivteamcraft.com${location.hash.substr(1)}`;
    }
    return `https://ffxivteamcraft.com/${(location.pathname + location.search).substr(1)}`;
  };

  public addSelectedItemsToList(items: SearchResult[]): void {
    this.addItemsToList(items);
  }

  public removeSelection(row: SearchResult, items: SearchResult[]): void {
    row.selected = false;
    this.rowSelectionChange(row);
    items.forEach(i => i.itemId === row.itemId ? i.selected = false : null);
  }

  public selectAll(items: SearchResult[], selected: boolean): void {
    if (selected) {
      this.selection$.next([...this.selection$.value, ...items]);
    } else {
      this.selection$.next(this.selection$.value.filter(i => !items.some(item => item.itemId === i.itemId)));
    }
    (items || []).forEach(item => item.selected = selected);
    this.allSelected = selected;
  }

  public rowSelectionChange(row: SearchResult): void {
    if (row.selected) {
      this.selection$.next([...this.selection$.value, row]);
    } else {
      this.selection$.next(this.selection$.value.filter(i => i.itemId !== row.itemId));
    }
  }

  public afterAmountChanged(row: SearchResult): void {
    if (row.selected) {
      this.selection$.next(this.selection$.value.map(item => item.itemId === row.itemId ? row : item));
    }
  }

  public openInSimulator(itemId: number, recipeId: string): void {
    this.rotationPicker.openInSimulator(itemId, recipeId);
  }

  trackByItem(index: number, item: SearchResult): number {
    return +item.itemId;
  }

  public adjust(form: KeysOfType<SearchComponent, FormGroup>, prop: string, amount: number, min: number, max: number, arrayName?: string, arrayIndex?: number): void {
    //The arrayName and arrayIndex is for things such as the stat filters, where there can be multiple input rows
    //If we aren't given an arrayIndex, (we assume) it isn't necessary
    if (arrayName === undefined || arrayIndex === undefined) {
      const newValue: number = Math.min(Math.max(this[form].value[prop] + amount, min), max);
      this[form].patchValue({ [prop]: newValue });
    } else {
      const newValue: number = Math.min(Math.max(this[form].value[arrayName][arrayIndex][prop] + amount, min), max);
      const newArray: any = this[form].value[arrayName].slice();
      newArray[arrayIndex][prop] = newValue;
      this[form].patchValue({ [arrayName]: newArray });
    }
  }

  private filtersToForm(filters: SearchFilter[], form: FormGroup): Observable<{ [key: string]: any }> {
    return this.lazyData.getEntry('jobAbbr').pipe(
      map(jobAbbr => {
        const formRawValue: any = {};
        (filters || []).forEach(f => {
          const formFieldName = this.getFormFieldName(f.name);
          if (!!f.value) {
            if (f.formArray) {
              if (form.get(f.formArray) === null) {
                form.setControl(f.formArray, this.fb.array([]));
              }
              if (!(form.get(f.formArray) as FormArray).controls.some(control => control.value.name === f.entryName)) {
                (form.get(f.formArray) as FormArray).push(
                  this.fb.group({
                    name: f.entryName,
                    min: f.value.min,
                    max: f.value.max,
                    exclude: f.value.exclude
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
              formRawValue[`${formFieldName}Min`] = f.value.min;
              formRawValue[`${formFieldName}Max`] = f.value.max;
            } else {
              formRawValue[formFieldName] = f.value;
            }
          }
        });
        formRawValue.jobCategories = filters
          .filter(f => f.name.startsWith('ClassJobCategory'))
          .map(f => {
            if (f.name.endsWith('.ID')) {
              return f.value + 1000;
            } else {
              return +Object.keys(jobAbbr).find(k => jobAbbr[k].en === f.name.split('.')[1]);
            }
          });
        return formRawValue;
      })
    );
  }

  private getFormFieldName(filterName: string): string {
    switch (filterName) {
      case 'LevelEquip':
        return 'elvl';
      case 'LevelItem':
        return 'ilvl';
      case 'Recipes.Level':
        return 'clvl';
      case 'Recipes.ClassJobID':
        return 'craftJob';
      case 'ItemUICategoryTargetID':
        return 'itemCategories';
      case 'ContentFinderCondition.ClassJobLevelRequired':
        return 'lvl';
      default:
        return filterName;
    }
  }

  private getItemFilters(controls: { [key: string]: AbstractControl }): SearchFilter[] {
    const filters = this.getCommonFilters(controls);
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
            max: (+entry.max * valueMultiplier),
            exclude: entry.exclude
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
            max: entry.max,
            exclude: entry.exclude
          }
        };
      }));
    }
    if (controls.elvlMax.value < this.curMaxLevel || controls.elvlMin.value > 0) {
      filters.push({
        minMax: true,
        name: 'LevelEquip',
        value: {
          min: controls.elvlMin.value,
          max: controls.elvlMax.value
        }
      });
    }
    if (controls.clvlMax.value < this.curMaxLevel || controls.clvlMin.value > 0) {
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
    if (controls.collectable.value) {
      filters.push({
        name: 'AlwaysCollectable',
        value: 1
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

  private getCommonFilters(controls: { [key: string]: AbstractControl }): SearchFilter[] {
    const filters = [];
    if (controls.Patch.value > -1) {
      filters.push({
        name: 'Patch',
        value: controls.Patch.value
      });
    }
    return filters;
  }

  private getInstanceFilters(controls: { [key: string]: AbstractControl }): SearchFilter[] {
    const filters = this.getCommonFilters(controls);
    if (controls.lvlMin.value > 0 || controls.lvlMax.value < this.curMaxLevel) {
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
    const filters = this.getCommonFilters(controls);
    if (controls.lvlMin.value > 0 || controls.lvlMax.value < this.curMaxLevel) {
      filters.push({
        minMax: true,
        name: 'ClassJobLevel',
        value: {
          min: controls.lvlMin.value,
          max: controls.lvlMax.value
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
    return filters;
  }

  private getActionFilters(controls: { [key: string]: AbstractControl }): SearchFilter[] {
    const filters = this.getCommonFilters(controls);
    if (controls.lvlMin.value > 0 || controls.lvlMax.value < this.curMaxLevel) {
      filters.push({
        minMax: true,
        name: 'ClassJobLevel',
        value: {
          min: controls.lvlMin.value,
          max: controls.lvlMax.value
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
    return filters;
  }

  private getTraitFilters(controls: { [key: string]: AbstractControl }): SearchFilter[] {
    const filters = this.getCommonFilters(controls);
    if (controls.lvlMin.value > 0 || controls.lvlMax.value < this.curMaxLevel) {
      filters.push({
        minMax: true,
        name: 'Level',
        value: {
          min: controls.lvlMin.value,
          max: controls.lvlMax.value
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
    return filters;
  }
}
