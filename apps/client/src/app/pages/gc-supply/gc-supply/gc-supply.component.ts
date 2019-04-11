import { Component } from '@angular/core';
import { combineLatest, concat, Observable, of, Subject } from 'rxjs';
import { GearSet } from '../../simulator/model/gear-set';
import { AuthFacade } from '../../../+state/auth.facade';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { filter, first, map, mergeMap, tap } from 'rxjs/operators';
import * as _ from 'lodash';
import { XivapiEndpoint, XivapiService } from '@xivapi/angular-client';
import { switchMap } from 'rxjs/internal/operators/switchMap';
import { ListPickerService } from '../../../modules/list-picker/list-picker.service';
import { ListsFacade } from '../../../modules/list/+state/lists.facade';
import { ProgressPopupService } from '../../../modules/progress-popup/progress-popup.service';
import { Router } from '@angular/router';
import { ListManagerService } from '../../../modules/list/list-manager.service';

@Component({
  selector: 'app-gc-supply',
  templateUrl: './gc-supply.component.html',
  styleUrls: ['./gc-supply.component.less']
})
export class GcSupplyComponent {

  private sets$: Observable<GearSet[]> = this.authFacade.gearSets$;

  public form$: Observable<FormGroup>;

  public items$: Observable<{ job: number, reward: { xp: number, seals: number }, items: { count: number, itemId: number, icon: string }[] }[]>;

  private levels$: Subject<any> = new Subject<any>();

  private idToIndex = [8, 15, 14, 10, 12, 11, 13, 9, 16, 17, 18];

  public selection = [];

  public pristine = true;

  public loading = false;

  constructor(private authFacade: AuthFacade, private fb: FormBuilder, private xivapi: XivapiService,
              private listPicker: ListPickerService, private listsFacade: ListsFacade, private progressService: ProgressPopupService,
              private router: Router, private listManager: ListManagerService) {
    this.form$ = this.sets$.pipe(
      map(sets => {
        const groupConfig = sets.reduce((group, set) => {
          group[set.jobId] = [set.level, [Validators.required, Validators.min(1)]];
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
        const levelsArray = Object.keys(levels).map(key => {
          return { jobId: +key, level: levels[key] };
        });
        const uniqLevels = _.uniq(Object.keys(levels).map(key => levels[key]));
        const requests = uniqLevels.map(level => {
          return combineLatest(this.xivapi.get(XivapiEndpoint.GCSupplyDuty, level), this.xivapi.get(XivapiEndpoint.GCSupplyDutyReward, level));
        });
        return combineLatest(requests).pipe(
          map((data: any[]) => {
            return levelsArray.map(entry => {
              const dataEntry = data.find(row => row[0].ID === entry.level);
              const duty = dataEntry[0];
              const reward = dataEntry[1];
              const finalEntry = {
                job: entry.jobId,
                items: [],
                reward: { xp: reward.ExperienceSupply, seals: reward.SealsSupply }
              };
              for (let i = 0; i < 3; i++) {
                const item = duty[`Item${i}${this.idToIndex.indexOf(entry.jobId)}`];
                const itemCount = duty[`ItemCount${i}${this.idToIndex.indexOf(entry.jobId)}`];
                if (item === null) {
                  break;
                }
                finalEntry.items.push({
                  count: itemCount,
                  itemId: item.ID,
                  icon: item.Icon
                });
              }
              return finalEntry;
            });
          })
        );
      }),
      tap(() => {
        this.loading = false;
      })
    );
  }

  public getSupplies(form: FormGroup): void {
    this.levels$.next(form.getRawValue());
  }

  public onCheckboxChange(itemId: number, count: number, checked: boolean): void {
    if (checked) {
      this.selection.push({ itemId: itemId, count: count });
    } else {
      this.selection = this.selection.filter(row => row.itemId !== itemId);
    }
  }

  public generateList(): void {
    this.listPicker.pickList().pipe(
      mergeMap(list => {
        const operations = this.selection.map(row => {
          return this.listManager.addToList(row.itemId, list, '', row.count);
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
          this.selection.length,
          'Adding_recipes',
          { amount: this.selection.length, listname: list.name });
      }),
      tap(list => list.$key ? this.listsFacade.updateList(list) : this.listsFacade.addList(list)),
      mergeMap(list => {
        // We want to get the list created before calling it a success, let's be pessimistic !
        return this.progressService.showProgress(
          combineLatest(this.listsFacade.myLists$, this.listsFacade.listsWithWriteAccess$).pipe(
            map(([myLists, listsICanWrite]) => [...myLists, ...listsICanWrite]),
            map(lists => lists.find(l => l.createdAt === list.createdAt && l.$key === list.$key && l.$key !== undefined)),
            filter(l => l !== undefined),
            first()
          ), 1, 'Saving_in_database');
      })
    ).subscribe((list) => {
      this.router.navigate(['/list', list.$key]);
    });
  }

}
