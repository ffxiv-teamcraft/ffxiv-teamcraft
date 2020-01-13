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
import { folklores } from '../../../core/data/sources/folklores';
import { reductions } from '../../../core/data/sources/reductions';
import { BellNodesService } from '../../../core/data/bell-nodes.service';
import { LocalizedDataService } from '../../../core/data/localized-data.service';
import { AlarmsFacade } from '../../../core/alarms/+state/alarms.facade';
import { LazyDataService } from '../../../core/data/lazy-data.service';
import { TrackerComponent } from '../tracker-component';
import { NavigationObjective } from '../../../modules/map/navigation-objective';
import { NzModalService, NzNotificationService } from 'ng-zorro-antd';
import { WorldNavigationMapComponent } from '../../../modules/map/world-navigation-map/world-navigation-map.component';
import { List } from '../../../modules/list/model/list';

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

  private dohPageNameCache: { [index: number]: string } = {};
  private dolPageNameCache: { [index: number]: string } = {};

  public userCompletion: { [index: number]: boolean } = {};
  public userGatheringCompletion: { [index: number]: boolean } = {};

  public nodeDataCache: any[][] = [];

  public dohSelectedPage = 0;
  public dolSelectedPage = 0;

  public type$: Observable<number>;

  public hideCompleted = false;


  @ViewChild('notificationRef', { static: true })
  notification: TemplateRef<any>;

  // Notification data
  itemsAdded = 0;

  modifiedList: List;

  constructor(private authFacade: AuthFacade, private gt: GarlandToolsService, private translate: TranslateService,
              private listsFacade: ListsFacade, private listManager: ListManagerService, private listPicker: ListPickerService,
              private progressService: ProgressPopupService, private router: Router, private route: ActivatedRoute,
              private bell: BellNodesService, private l12n: LocalizedDataService, protected alarmsFacade: AlarmsFacade,
              private lazyData: LazyDataService, private dialog: NzModalService, private notificationService: NzNotificationService) {
    super(alarmsFacade);
    this.dohTabs = [...this.lazyData.data.craftingLogPages];
    this.dolTabs = [...this.lazyData.data.gatheringLogPages];
    this.authFacade.user$.pipe(
    ).subscribe(user => {
      this.userCompletion = {};
      this.userGatheringCompletion = {};
      user.logProgression.forEach(recipeId => {
        this.userCompletion[recipeId] = true;
      });
      user.gatheringLogProgression.forEach(itemId => {
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

  public createList(page: any, limit?: number): void {
    let recipesToAdd = page.recipes.filter(recipe => !this.userCompletion[recipe.recipeId]);
    if (limit) {
      recipesToAdd = recipesToAdd.slice(0, limit);
    }
    this.listPicker.pickList().pipe(
      mergeMap(list => {
        const operations = recipesToAdd.map(recipe => {
          return this.listManager.addToList(recipe.itemId, list, recipe.recipeId, 1);
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
          combineLatest(this.listsFacade.myLists$, this.listsFacade.listsWithWriteAccess$).pipe(
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

  public isPageDone(page: any): boolean {
    return page.items.filter(item => this.userGatheringCompletion[item.itemId]).length >= page.items.length;
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
    this.authFacade.user$.pipe(first()).subscribe(user => {
      if (done) {
        user.logProgression.push(recipeId);
      } else {
        user.logProgression = user.logProgression.filter(entry => entry !== recipeId);
      }
      this.userCompletion[recipeId] = done;
      this.authFacade.updateUser(user);
    });
  }

  public markDolAsDone(recipeId: number, done: boolean): void {
    this.authFacade.user$.pipe(first()).subscribe(user => {
      if (done) {
        user.gatheringLogProgression.push(recipeId);
      } else {
        user.gatheringLogProgression = user.gatheringLogProgression.filter(entry => entry !== recipeId);
      }
      this.userGatheringCompletion[recipeId] = done;
      this.authFacade.updateUser(user);
    });
  }

  public markDohPageAsDone(page: any): void {
    this.authFacade.user$.pipe(first()).subscribe(user => {
      user.logProgression.push(...page.recipes.map(r => {
        this.userCompletion[r.recipeId] = true;
        return r.recipeId;
      }));
      this.authFacade.updateUser(user);
    });
  }

  public markDolPageAsDone(page: any): void {
    this.authFacade.user$.pipe(first()).subscribe(user => {
      user.gatheringLogProgression.push(...page.items.map(i => {
        this.userGatheringCompletion[i.itemId] = true;
        return i.itemId;
      }));
      this.authFacade.updateUser(user);
    });
  }

  public getDohPageName(page: any): string {
    if (this.dohPageNameCache[page.id] === undefined) {
      this.dohPageNameCache[page.id] = this._getDohPageName(page);
    }
    return this.dohPageNameCache[page.id];
  }

  public getDolPageName(page: any): string {
    if (this.dolPageNameCache[page.id] === undefined) {
      this.dolPageNameCache[page.id] = this._getDolPageName(page);
    }
    return this.dolPageNameCache[page.id];
  }

  public isRequiredForAchievement(page: any): boolean {
    return !page.masterbook
      && (
        (page.startLevel.ClassJobLevel !== 50
          && page.startLevel.ClassJobLevel !== 30
        )
        || (page.id > 1055 && page.id < 1072)
      ) &&
      page.id < 1088;
  }

  public getNodeData(itemId: number, tab: number): any {
    if (this.nodeDataCache[itemId] === undefined) {
      this.nodeDataCache[itemId] = [];
    }
    if (this.nodeDataCache[itemId][tab] === undefined) {
      this.nodeDataCache[itemId][tab] = this._getNodeData(itemId, tab);
    }
    return this.nodeDataCache[itemId][tab];
  }

  private _getNodeData(itemId: number, pageId: number): any {
    const tab = Math.floor(pageId / 40);
    const availableNodeIds = Object.keys(this.lazyData.data.nodePositions)
      .filter(key => {
        return this.lazyData.data.nodePositions[key].items.indexOf(itemId) > -1;
      });
    const nodesFromPositions = availableNodeIds
      .map(key => {
        return { ...this.lazyData.data.nodePositions[key], nodeId: key };
      })
      .filter(node => {
        return tab > 10 || node.type === tab;
      })
      .map(node => {
        const bellNode = this.bell.getNode(+node.nodeId);
        node.timed = bellNode !== undefined;
        node.itemId = itemId;
        node.icon = this.lazyData.data.itemIcons[itemId];
        if (node.timed) {
          const slotMatch = bellNode.items.find(nodeItem => nodeItem.id === itemId);
          node.spawnTimes = bellNode.time;
          node.uptime = bellNode.uptime;
          if (slotMatch !== undefined) {
            node.slot = slotMatch.slot;
          }
        }
        node.hidden = node.items && !node.items.some(i => i === node.itemId);
        node.mapId = node.map;
        const folklore = Object.keys(folklores).find(id => folklores[id].indexOf(itemId) > -1);
        if (folklore !== undefined) {
          node.folklore = {
            id: +folklore,
            icon: [7012, 7012, 7127, 7127, 7128, 7128][node.type]
          };
        }
        return node;
      });
    const nodesFromGarlandBell = this.bell.getNodesByItemId(itemId)
      .filter(node => {
        return tab > 10 || node.type === tab;
      })
      .map(node => {
        const nodePosition = this.lazyData.data.nodePositions[node.id];
        const result: any = {
          nodeId: node.id,
          zoneid: this.l12n.getAreaIdByENName(node.zone),
          mapId: nodePosition ? nodePosition.map : this.l12n.getAreaIdByENName(node.zone),
          x: node.coords[0],
          y: node.coords[1],
          level: node.lvl,
          type: node.type,
          itemId: node.itemId,
          icon: node.icon,
          spawnTimes: node.time,
          uptime: node.uptime,
          slot: node.slot,
          timed: true,
          reduction: reductions[itemId] && reductions[itemId].indexOf(node.itemId) > -1,
          ephemeral: node.name === 'Ephemeral',
          items: node.items
        };
        const folklore = Object.keys(folklores).find(id => folklores[id].indexOf(itemId) > -1);
        if (folklore !== undefined) {
          result.folklore = {
            id: +folklore,
            icon: [7012, 7012, 7127, 7127, 7128, 7128][node.type]
          };
        }
        return result;
      });
    const results = [...nodesFromPositions, ...nodesFromGarlandBell];
    const finalNodes = [];
    results
      .sort((a, b) => {
        if (a.ephemeral && !b.ephemeral) {
          return -1;
        } else if (b.ephemeral && !a.ephemeral) {
          return 1;
        }
        return 0;
      })
      .forEach(row => {
        if (!finalNodes.some(node => node.nodeId)) {
          finalNodes.push(row);
        }
      });
    return finalNodes.slice(0, 3);
  }

  private _getDohPageName(page: any): string {
    if (page.masterbook > 0) {
      const masterbookIndex = this.getMasterbookIndex(page);
      if (masterbookIndex === -7) {
        return this.translate.instant('LOG_TRACKER.PAGE.Other_master_recipes');
      }
      const masterbookNumber = Math.floor((page.id - 1000) / 8) + 1;
      return `${this.translate.instant('LOG_TRACKER.PAGE.Master_recipes', { number: masterbookNumber })}`;
    }
    if (page.id > 1063 && page.id < 1080) {
      return `${this.translate.instant('LOG_TRACKER.PAGE.Housing_items', { number: page.id < 1072 ? 1 : 2 })}`;
    }
    if (page.id >= 1088 && page.id <= 1095) {
      return this.translate.instant('LOG_TRACKER.PAGE.Quests');
    }
    if (page.id >= 1096) {
      return this.translate.instant('LOG_TRACKER.PAGE.Deliveries');
    }
    if (page.startLevel.ClassJobLevel === 50) {
      return this.translate.instant('LOG_TRACKER.PAGE.Others');
    }
    if (page.startLevel.ClassJobLevel === 30) {
      return this.translate.instant('LOG_TRACKER.PAGE.Dyes');
    }
    return `${page.startLevel.ClassJobLevel} - ${page.startLevel.ClassJobLevel + 4}`;
  }

  private _getDolPageName(page: any): string {
    if (page.id === 9999) {
      return this.translate.instant('LOG_TRACKER.Folklore');
    }
    if (page.id === 47) {
      return `36-40`;
    }
    return `${Math.floor(page.startLevel / 5) * 5 + 1} - ${Math.floor((page.startLevel + 4) / 5) * 5}`;
  }

  private getMasterbookIndex(page: any): number {
    const baseValue = ((page.startLevel.ClassJobLevel - 50) / 5) + page.startLevel.Stars / 2;
    if (baseValue === 1.6) {
      return 3;
    }
    if (baseValue > 2) {
      return baseValue + 1;
    }
    return baseValue;
  }

  public showOptimizedMap(index: number): void {
    const steps: NavigationObjective[] = [].concat.apply([], [...this.lazyData.data.gatheringLogPages[index], ...this.lazyData.data.gatheringLogPages[index + 1]]
      .map(page => {
        return page.items
          .filter(item => {
            const nodes = this.getNodeData(item.itemId, page.id);
            return !this.userGatheringCompletion[item.itemId]
              && nodes.length > 0
              && nodes.some(n => !n.timed);
          })
          .map(item => {
            const node = this.getNodeData(item.itemId, page.id)[0];
            return <NavigationObjective>{
              mapId: node.mapId,
              zoneId: node.zoneid,
              iconid: null,
              item_amount: 1,
              name: this.l12n.getItem(item.itemId),
              itemId: item.itemId,
              total_item_amount: 1,
              type: 'Gathering',
              x: node.x,
              y: node.y
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
