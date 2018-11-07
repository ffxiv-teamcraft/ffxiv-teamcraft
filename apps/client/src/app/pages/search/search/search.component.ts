import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { BehaviorSubject, combineLatest, concat, Observable } from 'rxjs';
import { GarlandToolsService } from '../../../core/api/garland-tools.service';
import { DataService } from '../../../core/api/data.service';
import { debounceTime, filter, first, map, mergeMap, tap } from 'rxjs/operators';
import { SearchResult } from '../../../model/search/search-result';
import { SettingsService } from '../../../modules/settings/settings.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ListsFacade } from '../../../modules/list/+state/lists.facade';
import { List } from '../../../modules/list/model/list';
import { ListManagerService } from '../../../modules/list/list-manager.service';
import { NzNotificationService } from 'ng-zorro-antd';
import { LocalizedDataService } from '../../../core/data/localized-data.service';
import { I18nToolsService } from '../../../core/tools/i18n-tools.service';
import { ListPickerService } from '../../../modules/list-picker/list-picker.service';
import { ProgressPopupService } from '../../../modules/progress-popup/progress-popup.service';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { SearchFilter } from '../../../model/search/search-filter.interface';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.less']
})
export class SearchComponent implements OnInit {

  query$: BehaviorSubject<string> = new BehaviorSubject<string>('');

  onlyRecipes$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);

  results$: Observable<SearchResult[]>;

  filters$: BehaviorSubject<SearchFilter[]> = new BehaviorSubject<SearchFilter[]>([]);

  showIntro = true;

  loading = false;

  @ViewChild('notificationRef')
  notification: TemplateRef<any>;

  // Notification data
  itemsAdded = 0;

  modifiedList: List;

  allSelected = false;

  form: FormGroup = this.fb.group({
    ilvlMin: new FormControl(0),
    ilvlMax: new FormControl(999),
    elvlMin: new FormControl(0),
    elvlMax: new FormControl(70),
    clvlMin: new FormControl(0),
    clvlMax: new FormControl(70),
    jobCategories: new FormControl(null),
    craftJob: new FormControl(null),
    itemCategory: new FormControl(null)
  });

  availableJobCategories = [];

  availableCraftJobs = [];

  constructor(private gt: GarlandToolsService, private data: DataService, public settings: SettingsService,
              private router: Router, private route: ActivatedRoute, private listsFacade: ListsFacade,
              private listManager: ListManagerService, private notificationService: NzNotificationService,
              private l12n: LocalizedDataService, private i18n: I18nToolsService, private listPicker: ListPickerService,
              private progressService: ProgressPopupService, private fb: FormBuilder) {
  }

  ngOnInit(): void {
    this.gt.onceLoaded$.pipe(first()).subscribe(() => {
      this.availableJobCategories = this.gt.getJobs().filter(job => job.isJob !== undefined || job.category === 'Disciple of the Land');
      this.availableCraftJobs = this.gt.getJobs().filter(job => job.category.indexOf('Hand') > -1);
    });
    this.results$ = combineLatest(this.query$, this.onlyRecipes$).pipe(
      filter(([query]) => query.length > 3),
      debounceTime(500),
      tap(([query, onlyRecipes]) => {
        this.showIntro = false;
        this.loading = true;
        const queryParams = {
          query: query,
          onlyRecipes: onlyRecipes
        };
        this.router.navigate([], {
          queryParamsHandling: 'merge',
          queryParams: queryParams,
          relativeTo: this.route
        });
      }),
      mergeMap(([query, onlyRecipes]) => this.data.searchItem(query, [], onlyRecipes)),
      tap(() => {
        this.loading = false;
      })
    );

    this.route.queryParams.pipe(
      filter(params => {
        return params.query !== undefined && params.onlyRecipes !== undefined;
      })
    ).subscribe(params => {
      this.onlyRecipes$.next(params.onlyRecipes === 'true');
      this.query$.next(params.query);
    });
  }

  submitFilters(): void {
    // TODO
  }

  public createQuickList(item: SearchResult): void {
    const list = this.listsFacade.newEphemeralList(this.i18n.getName(this.l12n.getItem(item.itemId)));
    const operation$ = this.listManager.addToList(item.itemId, list, item.recipe ? item.recipe.recipeId : '', item.amount, item.addCrafts)
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
        const operation$ = concat(
          ...items.map(item => {
            return this.listManager.addToList(item.itemId, list,
              item.recipe ? item.recipe.recipeId : '', item.amount, item.addCrafts);
          })
        );
        return this.progressService.showProgress(operation$,
          items.length,
          'Adding_recipes',
          { amount: items.length, listname: list.name });
      }),
      tap(list => list.$key ? this.listsFacade.updateList(list) : this.listsFacade.addList(list)),
      mergeMap(list => {
        // We want to get the list created before calling it a success, let's be pessimistic !
        return this.listsFacade.myLists$.pipe(
          map(lists => lists.find(l => l.createdAt === list.createdAt && l.$key !== undefined)),
          filter(l => l !== undefined),
          first()
        );
      })
    ).subscribe((list) => {
      this.itemsAdded = items.length;
      this.modifiedList = list;
      this.notificationService.template(this.notification);
    });
  }

  public addSelectedItemsToList(items: SearchResult[]): void {
    this.addItemsToList(items.filter(item => item.selected));
  }

  public selectAll(items: SearchResult[], selected: boolean): void {
    items.forEach(item => item.selected = selected);
  }

  public updateAllSelected(items: SearchResult[]): void {
    this.allSelected = items.reduce((res, item) => item.selected && res, true);
  }
}
