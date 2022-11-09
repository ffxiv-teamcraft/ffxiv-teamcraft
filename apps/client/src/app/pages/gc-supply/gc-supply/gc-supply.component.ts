import { Component } from '@angular/core';
import { combineLatest, concat, Observable, of, Subject } from 'rxjs';
import { GearSet } from '@ffxiv-teamcraft/simulator';
import { AuthFacade } from '../../../+state/auth.facade';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { filter, first, map, mergeMap, switchMap, tap } from 'rxjs/operators';
import * as _ from 'lodash';
import { XivapiEndpoint, XivapiService } from '@xivapi/angular-client';
import { ListPickerService } from '../../../modules/list-picker/list-picker.service';
import { ListsFacade } from '../../../modules/list/+state/lists.facade';
import { ProgressPopupService } from '../../../modules/progress-popup/progress-popup.service';
import { Router } from '@angular/router';
import { ListManagerService } from '../../../modules/list/list-manager.service';
import { requestsWithDelay } from '../../../core/rxjs/requests-with-delay';
import { EnvironmentService } from '../../../core/environment.service';

@Component({
  selector: 'app-gc-supply',
  templateUrl: './gc-supply.component.html',
  styleUrls: ['./gc-supply.component.less']
})
export class GcSupplyComponent {

  public form$: Observable<UntypedFormGroup>;

  public items$: Observable<{ job: number, items: { count: number, itemId: number, icon: string, reward: { xp: number, seals: number } }[] }[]>;

  public selection = [];

  public pristine = true;

  public loading = false;

  private sets$: Observable<GearSet[]> = this.authFacade.gearSets$.pipe(first());

  private levels$: Subject<any> = new Subject<any>();

  private idToIndex = [8, 15, 14, 10, 12, 11, 13, 9, 16, 17, 18];

  constructor(private authFacade: AuthFacade, private fb: UntypedFormBuilder, private xivapi: XivapiService,
              private listPicker: ListPickerService, private listsFacade: ListsFacade, private progressService: ProgressPopupService,
              private router: Router, private listManager: ListManagerService, private environment: EnvironmentService) {
    this.form$ = this.sets$.pipe(
      map(sets => {
        const groupConfig = sets.reduce((group, set) => {
          group[set.jobId] = [set.level, [Validators.required, Validators.min(0)]];
          return group;
        }, {});
        return fb.group(groupConfig);
      })
    );
    this.items$ = this.levels$.pipe(
      tap(() => {
        this.pristine = false;
        this.loading = true;
      }),
      switchMap(levels => {
        const levelsArray = [].concat.apply([], Object.keys(levels).map(key => {
          return [
            { jobId: +key, level: levels[key] },
            { jobId: +key, level: Math.max(levels[key] - 1, 1) },
            { jobId: +key, level: Math.max(levels[key] - 2, 1) },
            { jobId: +key, level: Math.max(levels[key] - 3, 1) },
            { jobId: +key, level: Math.max(levels[key] - 4, 1) },
            levels[key] === environment.maxLevel ? null : { jobId: +key, level: Math.max(levels[key] - 5, 1) }
          ].filter(row => row !== null);
        }));
        const uniqLevels = _.uniq(levelsArray.map(entry => entry.level));
        const requests = uniqLevels.map((level: number) => {
          return combineLatest([this.xivapi.get(XivapiEndpoint.GCSupplyDuty, level), this.xivapi.get(XivapiEndpoint.GCSupplyDutyReward, level)]);
        });
        return requestsWithDelay(requests, 50).pipe(
          map((data: any[]) => {
            return levelsArray
              .map(entry => {
                const finalEntry = {
                  job: entry.jobId,
                  items: []
                };
                const dataEntry = data.find(row => row[0].ID === entry.level);
                const duty = dataEntry[0];
                const reward = dataEntry[1];
                for (let j = 0; j < 3; j++) {
                  const item = duty[`Item${j}${this.idToIndex.indexOf(entry.jobId)}`];
                  const itemCount = duty[`ItemCount${j}${this.idToIndex.indexOf(entry.jobId)}`];
                  if (item === null) {
                    break;
                  }
                  finalEntry.items.push({
                    count: itemCount,
                    itemId: item.ID,
                    icon: item.Icon,
                    reward: { xp: reward.ExperienceSupply, seals: reward.SealsSupply }
                  });
                }
                return finalEntry;
              })
              .reduce((entriesByJob, entry) => {
                const jobEntry = entriesByJob.find(e => e.job === entry.job);
                if (jobEntry !== undefined) {
                  jobEntry.items.push(...entry.items);
                } else {
                  entriesByJob.push(entry);
                }
                return entriesByJob;
              }, [])
              .sort((a, b) => a.job - b.job);
          })
        );
      }),
      tap(() => {
        this.loading = false;
      })
    );
  }

  public getSupplies(form: UntypedFormGroup): void {
    this.levels$.next(form.getRawValue());
  }

  public select(jobId: number, itemId: number, count: number): void {
    this.selection = this.selection.filter(row => row.jobId !== jobId);
    if (itemId !== null) {
      this.selection.push({ jobId: jobId, itemId: itemId, count: count });
    }
  }

  public generateList(): void {
    const quickList = this.listsFacade.newEphemeralList(`GC Supply ${new Date().toLocaleDateString()}`);
    const operations = this.selection.map(row => {
      return this.listManager.addToList({ itemId: row.itemId, list: quickList, recipeId: '', amount: row.count });
    });
    let operation$: Observable<any>;
    if (operations.length > 0) {
      operation$ = concat(
        ...operations
      );
    } else {
      operation$ = of(quickList);
    }
    this.progressService.showProgress(operation$,
      this.selection.length,
      'Adding_recipes',
      { amount: this.selection.length, listname: quickList.name })
      .pipe(
        tap(list => list.$key ? this.listsFacade.updateList(list) : this.listsFacade.addList(list)),
        mergeMap(list => {
          // We want to get the list created before calling it a success, let's be pessimistic !
          return this.progressService.showProgress(
            combineLatest([this.listsFacade.myLists$, this.listsFacade.listsWithWriteAccess$]).pipe(
              map(([myLists, listsICanWrite]) => [...myLists, ...listsICanWrite]),
              map(lists => lists.find(l => l.createdAt.seconds === list.createdAt.seconds && l.$key !== undefined)),
              filter(l => l !== undefined),
              first()
            ), 1, 'Saving_in_database');
        })
      ).subscribe((list) => {
      this.router.navigate(['/list', list.$key]);
    });
  }

}
