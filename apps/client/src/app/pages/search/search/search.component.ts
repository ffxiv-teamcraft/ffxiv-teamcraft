import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { BehaviorSubject, combineLatest, Observable, of } from 'rxjs';
import { DataService } from '../../../core/api/data.service';
import { debounceTime, distinctUntilChanged, filter, first, map, mergeMap, pairwise, startWith, switchMap, takeUntil, tap } from 'rxjs/operators';
import { SettingsService } from '../../../modules/settings/settings.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ListsFacade } from '../../../modules/list/+state/lists.facade';
import { ListManagerService } from '../../../modules/list/list-manager.service';
import { I18nToolsService } from '../../../core/tools/i18n-tools.service';
import { ListPickerService } from '../../../modules/list-picker/list-picker.service';
import { ProgressPopupService } from '../../../modules/progress-popup/progress-popup.service';
import { AbstractControl, FormsModule, ReactiveFormsModule, UntypedFormArray, UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { I18nName, SearchFilter, SearchResult, SearchType } from '@ffxiv-teamcraft/types';
import { RotationPickerService } from '../../../modules/rotations/rotation-picker.service';
import { HtmlToolsService } from '../../../core/tools/html-tools.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import {
  AsyncPipe,
  DecimalPipe,
  isPlatformBrowser,
  isPlatformServer,
  NgFor,
  NgIf,
  NgSwitch,
  NgSwitchCase,
  NgTemplateOutlet,
  UpperCasePipe
} from '@angular/common';
import { isEqual, uniq } from 'lodash';
import { stats } from '../../../core/data/sources/stats';
import { KeysOfType } from '../../../core/tools/key-of-type';
import { Language } from '../../../core/data/language';
import { TeamcraftComponent } from '../../../core/component/teamcraft-component';
import { PlatformService } from '../../../core/tools/platform.service';
import { LazyDataFacade } from '../../../lazy-data/+state/lazy-data.facade';
import { IS_HEADLESS } from '../../../../environments/is-headless';
import { EnvironmentService } from '../../../core/environment.service';
import { toIndex } from '../../../core/rxjs/to-index';
import { jobAbbrs } from '@ffxiv-teamcraft/data/handmade/job-abbr-en';
import { LocalStorageBehaviorSubject } from '../../../core/rxjs/local-storage-behavior-subject';
import { JobUnicodePipe } from '../../../pipes/pipes/job-unicode.pipe';
import { XivapiL12nPipe } from '../../../pipes/pipes/xivapi-l12n.pipe';
import { IfMobilePipe } from '../../../pipes/pipes/if-mobile.pipe';
import { I18nRowPipe } from '../../../core/i18n/i18n-row.pipe';
import { I18nPipe } from '../../../core/i18n.pipe';
import { FullpageMessageComponent } from '../../../modules/fullpage-message/fullpage-message/fullpage-message.component';
import { SearchResultComponent } from '../search-result/search-result.component';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { PageLoaderComponent } from '../../../modules/page-loader/page-loader/page-loader.component';
import { ItemDetailsBoxComponent } from '../item-details-box/item-details-box.component';
import { I18nNameComponent } from '../../../core/i18n/i18n-name/i18n-name.component';
import { ItemIconComponent } from '../../../modules/item-icon/item-icon/item-icon.component';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { SearchIntroComponent } from '../search-intro/search-intro.component';
import { SimpleTabComponent } from '../../../modules/simple-tabset/simple-tab/simple-tab.component';
import { SimpleTabsetComponent } from '../../../modules/simple-tabset/simple-tabset/simple-tabset.component';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { SearchJobPickerComponent } from '../search-job-picker/search-job-picker.component';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { MouseWheelDirective } from '../../../core/event/mouse-wheel/mouse-wheel.directive';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzAutocompleteModule } from 'ng-zorro-antd/auto-complete';
import { ClipboardDirective } from '../../../core/clipboard.directive';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzWaveModule } from 'ng-zorro-antd/core/wave';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { TutorialStepDirective } from '../../../core/tutorial/tutorial-step.directive';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { FlexModule } from '@angular/flex-layout/flex';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.less'],
  standalone: true,
  imports: [FlexModule, NzSelectModule, TutorialStepDirective, FormsModule, NgFor, NzSpinModule, NgIf, ReactiveFormsModule, NzButtonModule, NzIconModule, NzInputModule, NgTemplateOutlet, NzWaveModule, NzToolTipModule, ClipboardDirective, NzAutocompleteModule, NzInputNumberModule, MouseWheelDirective, NzCheckboxModule, NzCardModule, NgSwitch, NgSwitchCase, SearchJobPickerComponent, NzGridModule, SimpleTabsetComponent, SimpleTabComponent, SearchIntroComponent, NzRadioModule, NzPopconfirmModule, ItemIconComponent, I18nNameComponent, ItemDetailsBoxComponent, RouterLink, PageLoaderComponent, NzPaginationModule, SearchResultComponent, FullpageMessageComponent, AsyncPipe, UpperCasePipe, DecimalPipe, I18nPipe, TranslateModule, I18nRowPipe, IfMobilePipe, XivapiL12nPipe, JobUnicodePipe]
})
export class SearchComponent extends TeamcraftComponent implements OnInit {

  //Minimum and Maximum values for various nz-input-number elements
  curMaxLevel = this.environment.maxLevel; //max player level
  maxilvlFilter = 999;

  maxStatFilter = 99999;

  searchTypes = SearchType;

  query$: BehaviorSubject<string> = new BehaviorSubject<string>('');

  queryChangeValue?: string | null;

  selection$: BehaviorSubject<SearchResult[]> = new BehaviorSubject<SearchResult[]>([]);

  filters$: BehaviorSubject<SearchFilter[]> = new BehaviorSubject<any>([]);

  showIntro = true;

  loading = false;

  public searchType$: BehaviorSubject<SearchType> =
    new BehaviorSubject<SearchType>(<SearchType>localStorage.getItem('search:type') || SearchType.ITEM);

  public showComparisonTip$ = this.searchType$.pipe(
    map(type => {
      return [SearchType.ITEM, SearchType.RECIPE, SearchType.ANY].includes(type);
    })
  );

  public selectionMode$ = new LocalStorageBehaviorSubject<'list' | 'compare'>('search:selection-mode', 'list');

  public availableLanguages = this.data.availableLanguages;

  public searchLang$: BehaviorSubject<Language> = new BehaviorSubject<Language>(this.settings.searchLanguage);

  allSelected = false;

  filtersForm: UntypedFormGroup = this.fb.group({
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

  availableCraftJobs = [8, 9, 10, 11, 12, 13, 14, 15];

  uiCategories$: Observable<{ id: number, data: I18nName }[]>;

  patches$: Observable<Array<I18nName & { id: number }>> = this.lazyData.patches$.pipe(
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
          field: 'id'
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
              field: 'elvl'
            },
            {
              label: 'Ilvl',
              field: 'ilvl'
            }
          ]);
          break;
        case SearchType.RECIPE:
          sortEntries.push(...[
            {
              label: 'Level',
              field: 'elvl'
            },
            {
              label: 'Ilvl',
              field: 'ilvl'
            },
            {
              label: 'Rlvl',
              field: 'clvl'
            }
          ]);
          break;
        case SearchType.INSTANCE:
        case SearchType.LEVE:
        case SearchType.ACTION:
        case SearchType.TRAIT:
          sortEntries.push({
            label: 'Level',
            field: 'level'
          });
          break;
        default:
          break;
      }
      return sortEntries;
    })
  );

  patch$ = this.filters$.pipe(
    switchMap(filters => {
      const patchFilter = filters.find(f => f.name === 'Patch');
      if (patchFilter) {
        return this.lazyData.patches$.pipe(
          map(patches => patches.find(p => {
            return p.id === patchFilter.value;
          }))
        );
      }
      return of(null);
    })
  );

  showFilters = this.settings.showSearchFilters;

  showSort$ = this.searchType$.pipe(
    map(type => [SearchType.ITEM, SearchType.RECIPE].includes(type))
  );

  page$ = new BehaviorSubject(1);

  pageSize = 50;

  results$: Observable<{
    paginated: SearchResult[],
    total: number
  }> = combineLatest([this.query$.pipe(distinctUntilChanged()), this.searchType$, this.filters$, this.sort$, this.searchLang$]).pipe(
    filter(([query, , filters, , lang]) => {
      if (['ko', 'zh'].indexOf(lang.toLowerCase()) > -1) {
        // Chinese and korean characters system use fewer chars for the same thing, filters have to be handled accordingly.
        return query.length > 0 || filters.length > 0;
      }
      return query.length > 2 || (lang === 'ja' && query.length > 0) || filters.length > 0;
    }),
    debounceTime(500),
    tap(([query, type, filters, [sortBy, sortOrder], lang]) => {
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
      if (filters.length > 0) {
        queryParams.filters = btoa(JSON.stringify(filters));
      } else {
        queryParams.filters = null;
      }
      if (query.length > 0) {
        const searchHistory = JSON.parse(localStorage.getItem('search:history') || '{}');
        searchHistory[type] = uniq([...(searchHistory[type] || []), query]);
        localStorage.setItem('search:history', JSON.stringify(searchHistory));
      }
      this.data.setSearchLang(lang);
      if (!isEqual(this.route.snapshot.queryParams, queryParams)) {
        this.router.navigate([], {
          queryParamsHandling: 'merge',
          queryParams: queryParams,
          relativeTo: this.route
        });
      }
    }),
    switchMap(([query, type, filters, sort]) => {
      return this.data.search(query.trim(), type, filters, sort);
    }),
    switchMap((results) => {
      this.page$.next(1);
      return this.page$.pipe(
        map(page => {
          return {
            total: results.length,
            paginated: results.slice(this.pageSize * (page - 1), this.pageSize * page)
          };
        })
      );
    }),
    tap(() => {
      this.loading = false;
    })
  );

  public ingesting$ = this.data.ingesting$;

  constructor(private data: DataService, public settings: SettingsService,
              private router: Router, private route: ActivatedRoute, private listsFacade: ListsFacade,
              private listManager: ListManagerService,
              private i18n: I18nToolsService, private listPicker: ListPickerService,
              private progressService: ProgressPopupService, private fb: UntypedFormBuilder,
              private rotationPicker: RotationPickerService, private htmlTools: HtmlToolsService,
              public translate: TranslateService, private lazyData: LazyDataFacade,
              private environment: EnvironmentService,
              private platformService: PlatformService, @Inject(PLATFORM_ID) private platform: any) {
    super();
    this.uiCategories$ = this.settings.watchSetting('search:language', 'en').pipe(
      switchMap(lang => {
        switch (lang) {
          case 'zh':
            return this.lazyData.getEntry('zhItemUiCategories');
          case 'ko':
            return this.lazyData.getEntry('koItemUiCategories');
          default:
            return this.lazyData.getEntry('itemCategory');
        }
      }),
      toIndex()
    );
    if (isPlatformBrowser(this.platform) && !IS_HEADLESS) {
      this.searchType$.subscribe(value => {
        localStorage.setItem('search:type', value);
      });
    }
    if (this.searchLang$.value === null || !this.availableLanguages.includes(this.searchLang$.value)) {
      const defaultSearchLang: Language = this.settings.searchLanguage || this.translate.currentLang as Language;
      if (this.availableLanguages.includes(defaultSearchLang)) {
        this.searchLang$.next(defaultSearchLang);
      } else {
        this.searchLang$.next('en');
      }
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

    this.route.queryParams.pipe(
      first(),
      switchMap(params => {
        if (!params.query || !params.type) {
          return of(null);
        }
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

  toggleFiltersDisplay(): void {
    this.showFilters = !this.showFilters;
    this.settings.showSearchFilters = this.showFilters;
  }

  addFilter(type: 'stats' | 'bonuses'): void {
    (this.filtersForm.get(type) as UntypedFormArray).push(this.fb.group({
      name: ['Strength'],
      min: [0],
      max: [9999],
      exclude: [false]
    }));
  }

  removeFilter(type: 'stats' | 'bonuses', i: number): void {
    (this.filtersForm.get(type) as UntypedFormArray).removeAt(i);
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

    (this.filtersForm.get('bonuses') as UntypedFormArray).clear();
    (this.filtersForm.get('stats') as UntypedFormArray).clear();

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
      default:
        this.filters$.next(this.getCommonFilters(this.filtersForm.controls));
    }
  }

  public getStars(amount: number): string {
    return this.htmlTools.generateStars(amount);
  }

  public createQuickList(item: SearchResult): void {
    this.i18n.getNameObservable(item.contentType || 'items', +item.itemId).pipe(
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
    this.listPicker.addToList(...items.map(item => {
      return {
        id: +item.itemId,
        recipeId: item.recipe?.recipeId || '',
        amount: item.amount,
        collectable: item.addCrafts
      };
    }));
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
    this.rowSelectionChange(items, row);
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

  public rowSelectionChange(items: SearchResult[], row: SearchResult): void {
    (items || []).forEach(item => {
      if (item.itemId === row.itemId) {
        item.selected = row.selected;
      }
    });
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

  public adjust(form: KeysOfType<SearchComponent, UntypedFormGroup>, prop: string, amount: number, min: number, max: number, arrayName?: string, arrayIndex?: number): void {
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

  private filtersToForm(filters: SearchFilter[], form: UntypedFormGroup): Observable<{ [key: string]: any }> {
    return this.lazyData.getEntry('jobAbbr').pipe(
      map(jobAbbr => {
        const formRawValue: any = {};
        (filters || []).forEach(f => {
          const formFieldName = this.getFormFieldName(f.name);
          if (f.value) {
            if (f.formArray) {
              if (form.get(f.formArray) === null) {
                form.setControl(f.formArray, this.fb.array([]));
              }
              if (!(form.get(f.formArray) as UntypedFormArray).controls.some(control => control.value.name === f.entryName)) {
                (form.get(f.formArray) as UntypedFormArray).push(
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
        name: 'ilvl',
        value: {
          min: controls.ilvlMin.value,
          max: controls.ilvlMax.value
        }
      });
    }
    if ((controls.stats as UntypedFormArray).controls.length > 0) {
      filters.push(...controls.stats.value.map(entry => {
        let fieldName: string;
        let valueMultiplier = 1;
        switch (entry.name) {
          case 'PhysicalDamage':
            fieldName = 'pDmg';
            break;
          case 'MagicalDamage':
            fieldName = 'mDmg';
            break;
          case 'Defense':
            fieldName = 'pDef';
            break;
          case 'MagicDefense':
            fieldName = 'mDef';
            break;
          case 'Delay':
            fieldName = 'delay';
            valueMultiplier = 1000;
            break;
          default:
            fieldName = `stats.${entry.name}`;
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
          name: `bonuses.${entry.name}.Max`,
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
        name: 'elvl',
        value: {
          min: controls.elvlMin.value,
          max: controls.elvlMax.value
        }
      });
    }
    if (controls.clvlMax.value < this.curMaxLevel || controls.clvlMin.value > 0) {
      filters.push({
        minMax: true,
        name: 'clvl',
        value: {
          min: controls.clvlMin.value,
          max: controls.clvlMax.value
        }
      });
    }
    if (controls.jobCategories.value && controls.jobCategories.value.length > 0) {
      filters.push(...controls.jobCategories.value.map(jobId => {
          return {
            name: `cjc.${jobAbbrs[jobId]}`,
            value: 1
          };
        })
      );
    }
    if (controls.craftJob.value) {
      filters.push({
        name: 'craftJob',
        value: controls.craftJob.value
      });
    }
    if (controls.collectable.value) {
      filters.push({
        name: 'collectible',
        value: 1
      });
    }
    if (controls.itemCategories.value && controls.itemCategories.value.length > 0) {
      filters.push({
        array: true,
        name: 'category',
        value: controls.itemCategories.value
      });
    }
    return filters;
  }

  private getCommonFilters(controls: { [key: string]: AbstractControl }): SearchFilter[] {
    const filters = [];
    if (controls.Patch.value > -1) {
      filters.push({
        name: 'patch',
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
        name: 'lvl',
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
        name: 'lvl',
        value: {
          min: controls.lvlMin.value,
          max: controls.lvlMax.value
        }
      });
    }
    if (controls.jobCategories.value && controls.jobCategories.value.length > 0) {
      filters.push(...controls.jobCategories.value.map(jobId => {
          return {
            name: `job`,
            value: jobId
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
        name: 'lvl',
        value: {
          min: controls.lvlMin.value,
          max: controls.lvlMax.value
        }
      });
    }
    if (controls.jobCategories.value && controls.jobCategories.value.length > 0) {
      filters.push(...controls.jobCategories.value.map(jobId => {
          return {
            name: `job`,
            value: jobId
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
        name: 'lvl',
        value: {
          min: controls.lvlMin.value,
          max: controls.lvlMax.value
        }
      });
    }
    if (controls.jobCategories.value && controls.jobCategories.value.length > 0) {
      filters.push(...controls.jobCategories.value.map(jobId => {
          return {
            name: `job`,
            value: jobId
          };
        })
      );
    }
    return filters;
  }

  updateSearchLang(lang: Language): void {
    this.searchLang$.next(lang);
    this.settings.searchLanguage = lang;
    this.data.setSearchLang(lang);
  }
}
