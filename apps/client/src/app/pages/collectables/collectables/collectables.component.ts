import { ChangeDetectionStrategy, Component } from '@angular/core';
import { combineLatest, merge, Observable, of, Subject } from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { filter, first, map, mergeMap, switchMap, tap } from 'rxjs/operators';
import { AuthFacade } from '../../../+state/auth.facade';
import { RotationPickerService } from '../../../modules/rotations/rotation-picker.service';
import { ListPickerService } from '../../../modules/list-picker/list-picker.service';
import { ListManagerService } from '../../../modules/list/list-manager.service';
import { ProgressPopupService } from '../../../modules/progress-popup/progress-popup.service';
import { ListsFacade } from '../../../modules/list/+state/lists.facade';
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
import { LazyDataFacade } from '../../../lazy-data/+state/lazy-data.facade';
import { safeCombineLatest } from '../../../core/rxjs/safe-combine-latest';

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
    first()
  );

  public levelsEditor$ = new Subject<Record<number, number>>();

  selectedItems: Record<number, number[]> = {};

  loading$ = this.authFacade.loaded$.pipe(map(loaded => !loaded));

  alarmGroups$ = this.alarmsFacade.allGroups$;

  selectedTabFromRoute$: Observable<number> = this.activeRoute.paramMap.pipe(
    switchMap(params => {
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
              private lazyData: LazyDataFacade, private rotationPicker: RotationPickerService,
              private listPicker: ListPickerService, private listManager: ListManagerService,
              private progressService: ProgressPopupService, private notificationService: NzNotificationService,
              private listsFacade: ListsFacade, private i18n: I18nToolsService, private l12n: LocalizedDataService,
              private router: Router, private activeRoute: ActivatedRoute, private location: Location,
              private gatheringNodesService: GatheringNodesService, private alarmsFacade: AlarmsFacade) {

    this.lazyData.preloadEntry('paramGrow');

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
            { job: jobId, level: +levels[jobId] }
          ];
        }, []);
      }),
      switchMap(rows => {
        return safeCombineLatest(rows.map(({ job, level }) => {
          return this.getCollectables(+job, level).pipe(
            map(groups => {
              return { job, level, groups };
            })
          );
        }));
      }),
      tap(() => console.log('AYAI'))
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
        amount: collectables.find(c => c.itemId === itemId)?.amount || 0,
        collectable: true
      };
    }));
  }

  private getCollectables(jobId: number, level: number): Observable<any[]> {
    return combineLatest([
      this.lazyData.getEntry('collectables'),
      this.lazyData.getEntry('collectablesShops')
    ]).pipe(
      switchMap(([collectables, collectablesShops]) => {
        return combineLatest(Object.keys(collectables)
          .filter(key => {
            const collectableEntry = collectables[key];
            if (collectableEntry.hwd || !collectableEntry.collectable) {
              return false;
            }
            const job = Object.keys(collectablesShops).find(sKey => {
              return collectablesShops[sKey].includes(collectableEntry.shopId);
            });
            return job !== undefined && (+job + 8) === jobId && collectableEntry.levelMin <= level;
          })
          .map(key => {
            return {
              ...collectables[key],
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
            return safeCombineLatest(group.collectables
              .sort((a, b) => b.levelMax - a.levelMax)
              .map(collectable => {
                return combineLatest([
                  this.getExp(level, collectable, collectable.base.exp),
                  this.getExp(level, collectable, collectable.mid.exp),
                  this.getExp(level, collectable, collectable.high.exp)
                ]).pipe(
                  switchMap(([expBase, expMid, expHigh]) => {
                    collectable.expBase = expBase;
                    collectable.expMid = expMid;
                    collectable.expHigh = expHigh;
                    if ([16, 17, 18].includes(jobId)) {
                      return this.gatheringNodesService.getItemNodes(collectable.itemId, true).pipe(
                        map(nodes => {
                          collectable.nodes = nodes.map(gatheringNode => {
                            return {
                              gatheringNode,
                              alarms: gatheringNode.limited ? this.alarmsFacade.generateAlarms(gatheringNode) : []
                            };
                          });
                          return collectable;
                        })
                      );
                    }
                    return of(collectable);
                  })
                );
              })
            ).pipe(
              map(res => {
                group.collectables = res;
                return group;
              })
            );
          })
        );
      })
    );
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
    this.lazyData.getRecipeForItem(itemId).pipe(
      first()
    ).subscribe(recipe => {
      this.rotationPicker.openInSimulator(itemId, recipe?.id);
    });
  }

  public addItemsToList(items: { itemId: number, amount: number, collectable?: boolean }[]): void {
    combineLatest(items.map(item => {
      return this.lazyData.getRecipeForItem(item.itemId).pipe(
        map(recipe => {
          return {
            id: +item.itemId,
            recipeId: recipe?.id || '',
            amount: item.amount,
            collectable: item.collectable
          };
        })
      );
    })).pipe(
      switchMap(additions => this.listPicker.addToList(...additions))
    );
  }

  public createQuickList(item: { itemId: number, amount: number }): void {
    const list = this.listsFacade.newEphemeralList(this.i18n.getName(this.l12n.getItem(+item.itemId)));
    this.lazyData.getRecipeForItem(item.itemId).pipe(
      switchMap(recipe => {
        const operation$ = this.listManager.addToList({
          itemId: +item.itemId,
          list: list,
          recipeId: recipe?.id || '',
          amount: item.amount
        }).pipe(
          tap(resultList => this.listsFacade.addList(resultList)),
          mergeMap(resultList => {
            return this.listsFacade.myLists$.pipe(
              map(lists => lists.find(l => l.createdAt.toMillis() === resultList.createdAt.toMillis() && l.$key !== undefined)),
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

  public getExp(level: number, collectable: any, ratio: number): Observable<number> {
    const firstCollectableDigit = Math.floor(collectable.levelMax / 10);
    const firstLevelDigit = Math.floor(level / 10);
    let nerfedExp = firstCollectableDigit < firstLevelDigit;
    if (level % 10 === 0 && level > collectable.levelMax) {
      nerfedExp = nerfedExp && (firstCollectableDigit + 1) < firstLevelDigit
        || (level - collectable.levelMax) >= 10
        || collectable.levelMax % 10 === 0;
    }
    if (nerfedExp) {
      return of(10000);
    }
    return this.lazyData.getRow('paramGrow', collectable.levelMax).pipe(
      map(row => row.ExpToNext * ratio / 1000)
    );
  }

}
