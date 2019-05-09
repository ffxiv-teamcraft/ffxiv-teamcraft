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

  public searchType$: BehaviorSubject<SearchType> = new BehaviorSubject<SearchType>(SearchType.ITEM);

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

  availableJobCategories = [];

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
          }]
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
          max: controls.lvlMin.value
        }
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
