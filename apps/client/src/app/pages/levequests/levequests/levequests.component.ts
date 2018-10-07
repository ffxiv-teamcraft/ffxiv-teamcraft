import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SearchIndex, XivapiEndpoint, XivapiService, XivapiList } from '@xivapi/angular-client';
import { NzNotificationService } from 'ng-zorro-antd';
import { BehaviorSubject, Observable, of, concat, pipe } from 'rxjs';
import { debounceTime, filter, map, switchMap, tap, mergeMap, first } from 'rxjs/operators';
import { LocalizedDataService } from '../../../core/data/localized-data.service';
import { I18nToolsService } from '../../../core/tools/i18n-tools.service';
import { ListPickerService } from '../../../modules/list-picker/list-picker.service';
import { ListsFacade } from '../../../modules/list/+state/lists.facade';
import { ListManagerService } from '../../../modules/list/list-manager.service';
import { List } from '../../../modules/list/model/list';
import { Levequest } from './../../../model/search/levequest';
import { ProgressPopupService } from '../../../modules/progress-popup/progress-popup.service';

@Component({
  selector: 'app-levequests',
  templateUrl: './levequests.component.html',
  styleUrls: ['./levequests.component.less']
})
export class LevequestsComponent implements OnInit {

  query$: BehaviorSubject<string> = new BehaviorSubject<string>('');

  results$: Observable<Levequest[]>;

  showIntro = true;

  loading = false;

  // Notification data
  itemsAdded = 0;

  modifiedList: List;

  allSelected = false;

  @ViewChild('notificationRef')
  notification: TemplateRef<any>;

  constructor(private xivapi: XivapiService, private listsFacade: ListsFacade,
    private router: Router, private route: ActivatedRoute, private listManager: ListManagerService,
    private notificationService: NzNotificationService,
    private l12n: LocalizedDataService, private i18n: I18nToolsService,
    private listPicker: ListPickerService, private progressService: ProgressPopupService) {
  }

  ngOnInit(): void {
    this.results$ = this.query$.pipe(
      filter(query => query.length > 3),
      debounceTime(500),
      tap(query => {
        this.showIntro = false;
        this.loading = true;
        this.router.navigate([], {
          queryParamsHandling: 'merge',
          queryParams: { query: query },
          relativeTo: this.route
        });
      }),
      switchMap(query => {
        return this.xivapi.search({ indexes: [SearchIndex.LEVE], string: query, columns: ['ID'],
          filters: [{ column: 'LeveAssignmentType.ID', operator: '>=', value: 5 },
                    { column: 'LeveAssignmentType.ID', operator: '<=', value: 12 }]
        })
      }),
      map(search => (search.Results || []).map(result => result.ID).filter(id => id !== undefined)),
      switchMap(ids => {
        if (ids.length > 0) {
          return this.xivapi.getList(XivapiEndpoint.Leve, { ids: ids, columns: ['CraftLeve.Item0TargetID',
            'CraftLeve.Item0.Icon', 'CraftLeve.ItemCount0', 'CraftLeve.Item0Recipes.*1.ID',
            'CraftLeve.Item0Recipes.*1.ClassJob', 'CraftLeve.Item0Recipes.*1.AmountResult',
            'CraftLeve.Repeats', 'Name', 'GilReward', 'ExpReward', 'ClassJobCategoryTargetID', 'ClassJobLevel',
            'LevelLevemete.X', 'LevelLevemete.Y', 'PlaceNameStartZone.ID'] })
        } else {
          return of({ Results: [] });
        }
      }),
      map(list => {
        const results: Levequest[] = [];
        (<any>list).Results.forEach(leve => {
          results.push({
            level: leve.ClassJobLevel,
            jobId: leve.ClassJobCategoryTargetID,
            itemId: leve.CraftLeve.Item0TargetID,
            itemIcon: leve.CraftLeve.Item0.Icon,
            recipes: leve.CraftLeve.Item0Recipes.filter(recipe => recipe.ID !== null)
              .map(recipe => ({ id: recipe.ID, job: recipe.ClassJob, amount: recipe.AmountResult })),
            exp: leve.ExpReward,
            gil: leve.GilReward,
            amount: 1,
            itemQuantity: leve.CraftLeve.ItemCount0,
            name: leve.Name,
            startCoordinates: { x: leve.LevelLevemete.X, y: leve.LevelLevemete.Y },
            startZoneId: leve.PlaceNameStartZone.ID,
            repeats: leve.CraftLeve.Repeats
          });
        });
        return results;
      }),
      tap(data => console.log(data)),
      tap(() => this.loading = false)
    );

    this.route.queryParams
      .pipe(filter(params => params.query !== undefined))
      .subscribe(params => this.query$.next(params.query)
    );
  }

  public addLevesToList(leves: Levequest[]): void {
    this.listPicker.pickList().pipe(
      mergeMap(list => {
        const operation$ = concat(
          ...leves.map(leve => {
            // TODO: Proper recipe selection for items craftable by multiple jobs
            const recipe = leve.recipes[0];
            return this.listManager.addToList(leve.itemId, list, recipe.id.toString(),
              this.craftAmount(leve, recipe)); 
          })
        );
        return this.progressService.showProgress(operation$,
          leves.length,
          'Adding_recipes',
          { amount: leves.length, listname: list.name });
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
      this.itemsAdded = leves.length;
      this.modifiedList = list;
      this.notificationService.template(this.notification);
    });
  }

  public createQuickList(leve: Levequest): void {
    const list = this.listsFacade.newEphemeralList(this.i18n.getName(this.l12n.getItem(leve.itemId)));
    const recipe = leve.recipes[0];
    const operation$ = this.listManager
      .addToList(leve.itemId, list, recipe.id.toString(), this.craftAmount(leve, recipe))
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

  private craftAmount(leve: Levequest, recipe: { amount: number }): number {
    return leve.amount * leve.itemQuantity * (leve.allDeliveries ? leve.repeats + 1 : 1);
  }

  public addSelectedLevesToList(leves: Levequest[]): void {
    this.addLevesToList(leves.filter(leve => leve.selected));
  }

  public selectAll(leves: Levequest[], selected: boolean): void {
    leves.forEach(leve => leve.selected = selected);
  }

  public updateAllSelected(leves: Levequest[]): void {
    this.allSelected = leves.reduce((res, item) => item.selected && res, true);
  }
}
