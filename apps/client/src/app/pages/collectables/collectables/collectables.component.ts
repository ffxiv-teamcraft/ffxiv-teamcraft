import { ChangeDetectionStrategy, Component } from '@angular/core';
import { combineLatest, merge, Observable, Subject } from 'rxjs';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { filter, first, map, mergeMap, switchMap, tap } from 'rxjs/operators';
import { AuthFacade } from '../../../+state/auth.facade';
import { RotationPickerService } from '../../../modules/rotations/rotation-picker.service';
import { ListPickerService } from '../../../modules/list-picker/list-picker.service';
import { ListManagerService } from '../../../modules/list/list-manager.service';
import { ProgressPopupService } from '../../../modules/progress-popup/progress-popup.service';
import { ListsFacade } from '../../../modules/list/+state/lists.facade';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { I18nToolsService } from '../../../core/tools/i18n-tools.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { GatheringNodesService } from '../../../core/data/gathering-nodes.service';
import { AlarmsFacade } from '../../../core/alarms/+state/alarms.facade';
import { AlarmDisplay } from '../../../core/alarms/alarm-display';
import { PersistedAlarm } from '../../../core/alarms/persisted-alarm';
import { AlarmGroup } from '../../../core/alarms/alarm-group';
import { LazyDataFacade } from '../../../lazy-data/+state/lazy-data.facade';
import { LazyDataEntries } from '@ffxiv-teamcraft/types';

@Component({
  selector: 'app-collectables',
  templateUrl: './collectables.component.html',
  styleUrls: ['./collectables.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CollectablesComponent {

  public form$: Observable<UntypedFormGroup>;

  public results$: Observable<{ job: number, level: number, groups: LazyDataEntries['collectablesPageData'] }[]>;

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

  constructor(private fb: UntypedFormBuilder, private authFacade: AuthFacade,
              private lazyData: LazyDataFacade, private rotationPicker: RotationPickerService,
              private listPicker: ListPickerService, private listManager: ListManagerService,
              private progressService: ProgressPopupService, private notificationService: NzNotificationService,
              private listsFacade: ListsFacade, private i18n: I18nToolsService,
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
            { job: jobId, level: +levels[jobId] }
          ];
        }, []);
      }),
      switchMap(rows => {
        return this.lazyData.getEntry('collectablesPageData').pipe(
          map(pageData => {
            return rows.map(({ job, level }) => {
              return {
                job,
                level,
                groups: pageData[job].map(group => {
                  return {
                    ...group,
                    collectables: group.collectables.filter(c => c.level <= level)
                  };
                }).filter(group => group.collectables.length > 0)
                  .reverse()
              };
            });
          })
        );
      })
    );
  }

  selectTab(index: number): void {
    this.lazyData.getRow('jobAbbr', index + 8).pipe(
      map(abbr => abbr.en),
      first()
    ).subscribe(jobAbbr => {
      const newLocation = this.router.createUrlTree(['..', jobAbbr], { relativeTo: this.activeRoute });
      this.location.go(newLocation.toString());
      this.selectedTabFromTabset$.next(index);
    });
  }

  public applyNewLevels(form: UntypedFormGroup): void {
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

  toggleAlarm(display: AlarmDisplay): void {
    if (display.registered) {
      this.alarmsFacade.deleteAlarm(display.alarm as PersistedAlarm);
    } else {
      this.alarmsFacade.addAlarms(display.alarm as PersistedAlarm);
    }
  }

  addAlarmWithGroup(alarm: PersistedAlarm, group: AlarmGroup) {
    this.alarmsFacade.addAlarmInGroup(alarm, group);
  }

  public openInSimulator(itemId: number): void {
    this.lazyData.getRecipeForItem(itemId).pipe(
      first()
    ).subscribe(recipe => {
      this.rotationPicker.openInSimulator(itemId, recipe?.id?.toString());
    });
  }

  public addItemsToList(items: { itemId: number, amount: number, collectable?: boolean }[]): void {
    combineLatest(items.map(item => {
      return this.lazyData.getRecipeForItem(item.itemId).pipe(
        map(recipe => {
          return {
            id: +item.itemId,
            recipeId: recipe?.id?.toString() || '',
            amount: item.amount,
            collectable: item.collectable
          };
        })
      );
    })).pipe(
      switchMap(additions => this.listPicker.addToList(...additions)),
      first()
    ).subscribe();
  }

  public createQuickList(item: { itemId: number, amount: number }): void {
    this.i18n.getNameObservable('items', +item.itemId).pipe(
      first(),
      switchMap(itemName => {
        const list = this.listsFacade.newEphemeralList(itemName);
        return this.lazyData.getRecipeForItem(item.itemId).pipe(
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
                  map(lists => lists.find(l => l.createdAt.seconds === resultList.createdAt.seconds && l.$key !== undefined)),
                  filter(l => l !== undefined),
                  first()
                );
              })
            );

            return this.progressService.showProgress(operation$, 1);
          })
        );
      })
    ).subscribe((newList) => {
      this.router.navigate(['list', newList.$key]);
    });
  }

}
