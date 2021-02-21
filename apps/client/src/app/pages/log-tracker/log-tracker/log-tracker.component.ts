import { ChangeDetectionStrategy, Component, TemplateRef, ViewChild } from '@angular/core';
import { AuthFacade } from '../../../+state/auth.facade';
import { GarlandToolsService } from '../../../core/api/garland-tools.service';
import { TranslateService } from '@ngx-translate/core';
import { filter, first, map, mergeMap, switchMap, takeUntil, tap } from 'rxjs/operators';
import { ListsFacade } from '../../../modules/list/+state/lists.facade';
import { ListManagerService } from '../../../modules/list/list-manager.service';
import { combineLatest, concat, interval, Observable, of } from 'rxjs';
import { ListPickerService } from '../../../modules/list-picker/list-picker.service';
import { ProgressPopupService } from '../../../modules/progress-popup/progress-popup.service';
import { ActivatedRoute, Router } from '@angular/router';
import { LocalizedDataService } from '../../../core/data/localized-data.service';
import { AlarmsFacade } from '../../../core/alarms/+state/alarms.facade';
import { LazyDataService } from '../../../core/data/lazy-data.service';
import { TrackerComponent } from '../tracker-component';
import { NavigationObjective } from '../../../modules/map/navigation-objective';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { WorldNavigationMapComponent } from '../../../modules/map/world-navigation-map/world-navigation-map.component';
import { List } from '../../../modules/list/model/list';
import { Memoized } from '../../../core/decorators/memoized';
import { GatheringNodesService } from '../../../core/data/gathering-nodes.service';
import { GatheringNode } from '../../../core/data/model/gathering-node';
import { Alarm } from '../../../core/alarms/alarm';
import { SettingsService } from '../../../modules/settings/settings.service';

@Component({
  selector: 'app-log-tracker',
  templateUrl: './log-tracker.component.html',
  styleUrls: ['./log-tracker.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LogTrackerComponent extends TrackerComponent {

  private static PAGE_TABS = ['DoH', 'MIN-BTN', 'FSH'];

  public dohTabs: any[];
  public dolTabs: any[];

  public userCompletion: { [index: number]: boolean } = {};
  public userGatheringCompletion: { [index: number]: boolean } = {};

  public nodeDataCache: { gatheringNode: GatheringNode, alarms: Alarm[] }[][][] = [];

  private _dohSelectedPage = 0;
  public get dohSelectedPage(): number {
    return this._dohSelectedPage;
  }

  public set dohSelectedPage(index: number) {
    this._dohSelectedPage = index;
    this.selectedRecipes = [];
  }

  private _dolSelectedPage = 0;
  public get dolSelectedPage(): number {
    return this._dolSelectedPage;
  }

  public set dolSelectedPage(index: number) {
    this._dolSelectedPage = index;
    this.selectedRecipes = [];
  }

  public type$: Observable<number>;

  public hideCompleted = this.settings.hideCompletedLogEntries;

  public selectedRecipes: { itemId: number, recipeId: number }[] = [];

  @ViewChild('notificationRef', { static: true })
  notification: TemplateRef<any>;

  // Notification data
  itemsAdded = 0;

  modifiedList: List;

  constructor(private authFacade: AuthFacade, private gt: GarlandToolsService, private translate: TranslateService,
              private listsFacade: ListsFacade, private listManager: ListManagerService, private listPicker: ListPickerService,
              private progressService: ProgressPopupService, private router: Router, private route: ActivatedRoute,
              private l12n: LocalizedDataService, protected alarmsFacade: AlarmsFacade, private gatheringNodesService: GatheringNodesService,
              private lazyData: LazyDataService, private dialog: NzModalService, private notificationService: NzNotificationService,
              public settings: SettingsService) {
    super(alarmsFacade);
    this.dohTabs = [...this.lazyData.data.craftingLogPages].map(page => {
      return page.map(tab => {
        tab.recipes = tab.recipes.map(entry => {
          entry.leves = this.lazyData.getItemLeveIds(entry.itemId);
          return entry;
        });
        return tab;
      });
    });
    this.dolTabs = [...this.lazyData.data.gatheringLogPages];
    this.authFacade.logTracking$.subscribe(logTracking => {
      this.userCompletion = {};
      this.userGatheringCompletion = {};
      logTracking.crafting.forEach(recipeId => {
        this.userCompletion[recipeId] = true;
      });
      logTracking.gathering.forEach(itemId => {
        this.userGatheringCompletion[itemId] = true;
      });
    });
    this.type$ = this.route.paramMap.pipe(
      map(params => {
        const type = params.get('type');
        // We have to +1 it because javascript evaluates 0 as false and we use it inside a *ngIf
        return LogTrackerComponent.PAGE_TABS.indexOf(type) + 1;
      })
    );
  }

  public setType(index: number): void {
    this.router.navigate(['../', LogTrackerComponent.PAGE_TABS[index]], {
      relativeTo: this.route
    });
  }

  public setSelection(recipe: any, selected: boolean): void {
    if (selected) {
      this.selectedRecipes.push(recipe);
    } else {
      this.selectedRecipes = this.selectedRecipes.filter(r => r.recipeId !== recipe.recipeId);
    }
  }

  public createListForPage(page: any, limit?: number): void {
    let recipesToAdd = page.recipes.filter(recipe => !this.userCompletion[recipe.recipeId]);
    if (limit) {
      recipesToAdd = recipesToAdd.slice(0, limit);
    }
    this.createList(recipesToAdd);
  }

  public createList(recipesToAdd: { itemId: number, recipeId: number }[]): void {
    this.listPicker.pickList().pipe(
      mergeMap(list => {
        const operations = recipesToAdd.map(recipe => {
          return this.listManager.addToList({ itemId: recipe.itemId, list: list, recipeId: recipe.recipeId, amount: 1 });
        });
        let operation$: Observable<any>;
        if (operations.length > 0) {
          operation$ = interval(250)
            .pipe(
              first(),
              switchMap(() => {
                return concat(
                  ...operations
                );
              })
            );
        } else {
          operation$ = of(list);
        }
        return this.progressService.showProgress(operation$,
          recipesToAdd.length,
          'Adding_recipes',
          { amount: recipesToAdd.length, listname: list.name });
      }),
      filter(list => list !== null),
      tap(list => list.$key ? this.listsFacade.updateList(list) : this.listsFacade.addList(list)),
      mergeMap(list => {
        // We want to get the list created before calling it a success, let's be pessimistic !
        return this.progressService.showProgress(
          combineLatest([this.listsFacade.myLists$, this.listsFacade.listsWithWriteAccess$]).pipe(
            map(([myLists, listsICanWrite]) => [...myLists, ...listsICanWrite]),
            map(lists => lists.find(l => l.createdAt.toMillis() === list.createdAt.toMillis() && l.$key !== undefined)),
            filter(l => l !== undefined),
            first()
          ), 1, 'Saving_in_database');
      })
    ).subscribe((list) => {
      this.itemsAdded = recipesToAdd.length;
      this.modifiedList = list;
      this.notificationService.template(this.notification);
    });
  }

  public getDohPageCompletion(page: any): string {
    return `${page.recipes.filter(recipe => this.userCompletion[recipe.recipeId]).length}/${page.recipes.length}`;
  }

  public getDolPageCompletion(page: any): string {
    return `${page.items.filter(item => this.userGatheringCompletion[item.itemId]).length}/${page.items.length}`;
  }

  public isDoLPageDone(page: any): boolean {
    return page.items.filter(item => this.userGatheringCompletion[item.itemId]).length >= page.items.length;
  }

  public isDoHPageDone(page: any): boolean {
    return page.recipes.filter(r => this.userCompletion[r.recipeId]).length >= page.recipes.length;
  }

  public getDohIcon(index: number): string {
    return `./assets/icons/classjob/${this.gt.getJob(index + 8).name.toLowerCase()}.png`;
  }

  public getDolIcon(index: number): string {
    return [
      './assets/icons/Mineral_Deposit.png',
      './assets/icons/MIN.png',
      './assets/icons/Mature_Tree.png',
      './assets/icons/BTN.png'
    ][index];
  }

  public markDohAsDone(recipeId: number, done: boolean): void {
    this.authFacade.markAsDoneInLog('crafting', recipeId, done);
    this.userCompletion[recipeId] = done;
  }

  public markDolAsDone(itemId: number, done: boolean): void {
    this.authFacade.markAsDoneInLog('gathering', itemId, done);
    this.userGatheringCompletion[itemId] = done;
  }

  public markDohPageAsDone(page: any): void {
    page.recipes
      .filter(r => {
        return !this.userCompletion[r.recipeId];
      })
      .map(r => {
        this.authFacade.markAsDoneInLog('crafting', r.recipeId, true);
      });
  }

  public markDolPageAsDone(page: any): void {
    page.items
      .filter(i => {
        return !this.userGatheringCompletion[i.itemId];
      })
      .map(i => {
        this.authFacade.markAsDoneInLog('gathering', i.itemId, true);
      });
  }

  @Memoized()
  public getDohDivisionId(pageId: number): number {
    return +Object.keys(this.lazyData.data.notebookDivision).find(key => {
      return this.lazyData.data.notebookDivision[key].pages.indexOf(pageId) > -1;
    });
  }

  @Memoized()
  public getDolDivisionId(pageId: number): number {
    return +Object.keys(this.lazyData.data.notebookDivision).find(key => {
      return this.lazyData.data.notebookDivision[key].pages.indexOf(pageId) > -1;
    });
  }

  public isRequiredForAchievement(page: any): boolean {
    const division = this.l12n.getNotebookDivision(this.getDohDivisionId(page.id));
    return /\d{1,2}-\d{1,2}/.test(division.name.en) || division.name.en.startsWith('Housing');
  }

  public getNodeData(itemId: number, tab: number): { gatheringNode: GatheringNode, alarms: Alarm[] }[] {
    if (this.nodeDataCache[itemId] === undefined) {
      this.nodeDataCache[itemId] = [];
    }
    if (this.nodeDataCache[itemId][tab] === undefined) {
      this.nodeDataCache[itemId][tab] = this.gatheringNodesService.getItemNodes(itemId, true)
        .slice(0, 3)
        .map(gatheringNode => {
          return {
            gatheringNode: gatheringNode,
            alarms: gatheringNode.limited ? this.alarmsFacade.generateAlarms(gatheringNode) : []
          };
        });
    }
    return this.nodeDataCache[itemId][tab];
  }

  public showOptimizedMap(index: number): void {
    const steps: NavigationObjective[] = [].concat.apply([], [...this.lazyData.data.gatheringLogPages[index], ...this.lazyData.data.gatheringLogPages[index + 1]]
      .map(page => {
        return page.items
          .filter(item => {
            const nodes = this.getNodeData(item.itemId, page.id);
            return !this.userGatheringCompletion[item.itemId]
              && nodes.length > 0
              && nodes.some(n => !n.gatheringNode.limited);
          })
          .map(item => {
            const node = this.getNodeData(item.itemId, page.id)[0].gatheringNode;
            return <NavigationObjective>{
              mapId: node.map,
              zoneId: node.zoneId,
              iconid: null,
              item_amount: 1,
              name: this.l12n.getItem(item.itemId),
              itemId: item.itemId,
              total_item_amount: 1,
              type: 'Gathering',
              x: node.x,
              y: node.y,
              gatheringType: node.type
            };
          });
      })
    );
    const ref = this.dialog.create({
      nzTitle: this.translate.instant('NAVIGATION.Title'),
      nzContent: WorldNavigationMapComponent,
      nzComponentParams: {
        points: steps
      },
      nzFooter: null
    });
    ref.afterOpen.pipe(
      switchMap(() => {
        return ref.getContentComponent().markAsDone$;
      }),
      takeUntil(ref.afterClose)
    ).subscribe(step => {
      this.markDolAsDone(step.itemId, true);
    });
  }

}
