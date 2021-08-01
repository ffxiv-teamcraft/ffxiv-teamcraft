import { ChangeDetectionStrategy, Component, TemplateRef, ViewChild } from '@angular/core';
import { combineLatest, concat, merge, Observable, of, Subject } from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { filter, first, map, mergeMap, tap } from 'rxjs/operators';
import { AuthFacade } from '../../../+state/auth.facade';
import { LazyDataService } from '../../../core/data/lazy-data.service';
import { RotationPickerService } from '../../../modules/rotations/rotation-picker.service';
import { ListPickerService } from '../../../modules/list-picker/list-picker.service';
import { ListManagerService } from '../../../modules/list/list-manager.service';
import { ProgressPopupService } from '../../../modules/progress-popup/progress-popup.service';
import { ListsFacade } from '../../../modules/list/+state/lists.facade';
import { List } from '../../../modules/list/model/list';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { I18nToolsService } from '../../../core/tools/i18n-tools.service';
import { LocalizedDataService } from '../../../core/data/localized-data.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { GatheringNodesService } from '../../../core/data/gathering-nodes.service';
import { AlarmsFacade } from '../../../core/alarms/+state/alarms.facade';
import { AlarmDisplay } from '../../../core/alarms/alarm-display';
import { Alarm } from '../../../core/alarms/alarm';
import { AlarmGroup } from '../../../core/alarms/alarm-group';

@Component({
  selector: 'app-collectables',
  templateUrl: './collectables.component.html',
  styleUrls: ['./collectables.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CollectablesComponent {

  public form$: Observable<FormGroup>;

  public results$: Observable<any[]>;

  public levels$: Observable<Record<number, number>> = this.authFacade.gearSets$.pipe(
    map(sets => {
      return sets.reduce((res, set) => {
        res[set.jobId] = set.level;
        return res;
      }, {});
    }),
    first(),
  );

  public levelsEditor$ = new Subject<Record<number, number>>();

  @ViewChild('notificationRef', { static: true })
  notification: TemplateRef<any>;

  itemsAdded = 0;

  modifiedList: List;

  selectedItems: Record<number, number[]> = {};

  loading$ = this.authFacade.loaded$.pipe(map(loaded => !loaded));

  alarmGroups$ = this.alarmsFacade.allGroups$;

  selectedTabFromRoute$: Observable<number> = this.activeRoute.paramMap.pipe(
    map(params => {
      const jobAbbr = params.get('jobAbbr') || 'CRP';
      return this.lazyData.getJobIdByAbbr(jobAbbr);
    }),
    map(id => {
      if (id > 18) {
        return 0;
      }
      return Math.max(0, id - 8);
    }),
    first()
  );

  selectedTabFromTabset$ = new Subject<number>();

  selectedTab$: Observable<number> = merge(this.selectedTabFromRoute$, this.selectedTabFromTabset$);

  constructor(private fb: FormBuilder, private authFacade: AuthFacade,
              private lazyData: LazyDataService, private rotationPicker: RotationPickerService,
              private listPicker: ListPickerService, private listManager: ListManagerService,
              private progressService: ProgressPopupService, private notificationService: NzNotificationService,
              private listsFacade: ListsFacade, private i18n: I18nToolsService, private l12n: LocalizedDataService,
              private router: Router, private activeRoute: ActivatedRoute, private location: Location,
              private gatheringNodesService: GatheringNodesService, private alarmsFacade: AlarmsFacade) {

    this.form$ = this.levels$.pipe(
      map(levels => {
        const groupConfig = Object.keys(levels).reduce((group, key) => {
          group[key] = [levels[key], [Validators.required, Validators.min(0)]];
          return group;
        }, {});
        return fb.group(groupConfig);
      })
    );

    this.results$ = merge(this.levels$, this.levelsEditor$).pipe(
      map((levels: Record<number, number>) => {
        return Object.keys(levels).reduce((res, jobId) => {
          return [
            ...res,
            { job: jobId, level: +levels[jobId], groups: this.getCollectables(+jobId, +levels[jobId]) }
          ];
        }, []);
      })
    );
  }

  selectTab(index: number): void {
    const newLocation = this.router.createUrlTree(['..', this.l12n.getJobAbbr(index + 8).en], { relativeTo: this.activeRoute });
    this.location.go(newLocation.toString());
    this.selectedTabFromTabset$.next(index);
  }

  public applyNewLevels(form: FormGroup): void {
    this.levelsEditor$.next(form.getRawValue());
  }

  public selectItem(panelId: number, itemId: number, selected: boolean): void {
    if (this.selectedItems[panelId] === undefined) {
      this.selectedItems[panelId] = [];
    }
    if (selected) {
      this.selectedItems[panelId].push(itemId);
    } else {
      this.selectedItems[panelId] = this.selectedItems[panelId].filter(i => i !== itemId);
    }
  }

  public isItemSelected(panelId: number, itemId: number): boolean {
    if (this.selectedItems[panelId] === undefined) {
      return false;
    }
    return this.selectedItems[panelId].includes(itemId);
  }

  public addSelectionToList(panelId: number, collectables: any[]): void {
    this.addItemsToList((this.selectedItems[panelId] || []).map(itemId => {
      return {
        itemId: itemId,
        amount: collectables.find(c => c.itemId === itemId)?.amount || 0
      };
    }));
  }

  private getCollectables(jobId: number, level: number): any[] {
    return Object.keys(this.lazyData.data.collectables)
      .filter(key => {
        const collectableEntry = this.lazyData.data.collectables[key];
        if (collectableEntry.hwd || !collectableEntry.collectable) {
          return false;
        }
        const job = Object.keys(this.lazyData.data.collectablesShops).find(sKey => {
          return this.lazyData.data.collectablesShops[sKey].indexOf(collectableEntry.shopId) > -1;
        });
        return job !== undefined && (+job + 8) === jobId && collectableEntry.levelMin <= level;
      })
      .map(key => {
        return {
          ...this.lazyData.data.collectables[key],
          itemId: +key,
          amount: 1
        };
      })
      .reduce((acc, row) => {
        let group = acc.find(accRow => accRow.groupId === row.group);
        if (group === undefined) {
          acc.push({
            groupId: row.group,
            collectables: []
          });
          group = acc[acc.length - 1];
        }
        group.collectables.push(row);
        return acc;
      }, [])
      .map(group => {
        group.collectables = group.collectables
          .sort((a, b) => b.levelMax - a.levelMax)
          .map(collectable => {
            if ([16, 17, 18].includes(jobId)) {
              collectable.nodes = this.gatheringNodesService.getItemNodes(collectable.itemId, true)
                .map(gatheringNode => {
                  return {
                    gatheringNode,
                    alarms: gatheringNode.limited ? this.alarmsFacade.generateAlarms(gatheringNode) : []
                  };
                });
            }
            return collectable;
          });
        return group;
      })
      .reverse();
  }

  toggleAlarm(display: AlarmDisplay): void {
    if (display.registered) {
      this.alarmsFacade.deleteAlarm(display.alarm);
    } else {
      this.alarmsFacade.addAlarms(display.alarm);
    }
  }

  addAlarmWithGroup(alarm: Alarm, group: AlarmGroup) {
    this.alarmsFacade.addAlarmInGroup(alarm, group);
  }

  public openInSimulator(itemId: number): void {
    this.rotationPicker.openInSimulator(itemId, this.lazyData.getItemRecipeSync(itemId.toString())?.id);
  }

  public addItemsToList(items: { itemId: number, amount: number }[]): void {
    this.listPicker.pickList().pipe(
      mergeMap(list => {
        const operations = items.map(item => {
          const recipeId = this.lazyData.getItemRecipeSync(item.itemId.toString())?.id;
          return this.listManager.addToList({
            itemId: +item.itemId,
            list: list,
            recipeId: recipeId || '',
            amount: item.amount
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
            map(lists => lists.find(l => l.createdAt.toMillis() === list.createdAt.toMillis())),
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

  public createQuickList(item: { itemId: number, amount: number }): void {
    const list = this.listsFacade.newEphemeralList(this.i18n.getName(this.l12n.getItem(+item.itemId)));
    const recipeId = this.lazyData.getItemRecipeSync(item.itemId.toString())?.id;
    const operation$ = this.listManager.addToList({
      itemId: +item.itemId,
      list: list,
      recipeId: recipeId || '',
      amount: item.amount
    })
      .pipe(
        tap(resultList => this.listsFacade.addList(resultList)),
        mergeMap(resultList => {
          return this.listsFacade.myLists$.pipe(
            map(lists => lists.find(l => l.createdAt.toMillis() === resultList.createdAt.toMillis() && l.$key !== undefined)),
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

  public getExp(level: number, collectable: any, ratio: number): number {
    const firstCollectableDigit = Math.floor(collectable.levelMax / 10);
    const firstLevelDigit = Math.floor(level / 10);
    let nerfedExp = firstCollectableDigit < firstLevelDigit;
    if (level % 10 === 0 && level > collectable.levelMax) {
      nerfedExp = nerfedExp && (firstCollectableDigit + 1) < firstLevelDigit
        || (level - collectable.levelMax) >= 10
        || collectable.levelMax % 10 === 0;
    }
    if (nerfedExp) {
      return 10000;
    }
    return this.lazyData.data.paramGrow[collectable.levelMax].ExpToNext * ratio / 1000;
  }

}
