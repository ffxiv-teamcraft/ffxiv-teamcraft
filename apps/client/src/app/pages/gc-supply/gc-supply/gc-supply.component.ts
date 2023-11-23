import { Component } from '@angular/core';
import { combineLatest, concat, Observable, of, Subject } from 'rxjs';
import { GearSet } from '@ffxiv-teamcraft/simulator';
import { AuthFacade } from '../../../+state/auth.facade';
import { UntypedFormBuilder, UntypedFormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { filter, first, map, mergeMap, switchMap, tap } from 'rxjs/operators';
import * as _ from 'lodash';
import { ListPickerService } from '../../../modules/list-picker/list-picker.service';
import { ListsFacade } from '../../../modules/list/+state/lists.facade';
import { ProgressPopupService } from '../../../modules/progress-popup/progress-popup.service';
import { Router } from '@angular/router';
import { ListManagerService } from '../../../modules/list/list-manager.service';
import { EnvironmentService } from '../../../core/environment.service';
import { LazyDataFacade } from '../../../lazy-data/+state/lazy-data.facade';
import { JobUnicodePipe } from '../../../pipes/pipes/job-unicode.pipe';
import { KeysPipe } from '../../../pipes/pipes/keys.pipe';
import { LazyIconPipe } from '../../../pipes/pipes/lazy-icon.pipe';
import { ItemNamePipe } from '../../../pipes/pipes/item-name.pipe';
import { I18nRowPipe } from '../../../core/i18n/i18n-row.pipe';
import { I18nPipe } from '../../../core/i18n.pipe';
import { TranslateModule } from '@ngx-translate/core';
import { PageLoaderComponent } from '../../../modules/page-loader/page-loader/page-loader.component';
import { FullpageMessageComponent } from '../../../modules/fullpage-message/fullpage-message/fullpage-message.component';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { FlexModule } from '@angular/flex-layout/flex';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzWaveModule } from 'ng-zorro-antd/core/wave';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NgIf, NgFor, AsyncPipe } from '@angular/common';

@Component({
    selector: 'app-gc-supply',
    templateUrl: './gc-supply.component.html',
    styleUrls: ['./gc-supply.component.less'],
    standalone: true,
    imports: [NgIf, FormsModule, NzFormModule, ReactiveFormsModule, NgFor, NzGridModule, NzButtonModule, NzInputModule, NzToolTipModule, NzWaveModule, NzIconModule, FlexModule, NzSelectModule, FullpageMessageComponent, PageLoaderComponent, AsyncPipe, TranslateModule, I18nPipe, I18nRowPipe, ItemNamePipe, LazyIconPipe, KeysPipe, JobUnicodePipe]
})
export class GcSupplyComponent {

  public form$: Observable<UntypedFormGroup>;

  public items$: Observable<{ job: number, items: { count: number, itemId: number, icon: string, reward: { xp: number, seals: number } }[] }[]>;

  public selection = [];

  public pristine = true;

  public loading = false;

  private sets$: Observable<GearSet[]> = this.authFacade.gearSets$.pipe(first());

  private levels$: Subject<any> = new Subject<any>();

  constructor(private authFacade: AuthFacade, private fb: UntypedFormBuilder, private listPicker: ListPickerService,
              private listsFacade: ListsFacade, private progressService: ProgressPopupService,
              private router: Router, private listManager: ListManagerService, private environment: EnvironmentService,
              private lazyData: LazyDataFacade) {
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
        const uniqLevels = _.uniq(levelsArray.map(entry => entry.level) as number[]);
        return this.lazyData.getRows('gcSupply', ...uniqLevels).pipe(
          map(supply => {
            return levelsArray
              .map(entry => {
                return {
                  job: entry.jobId,
                  items: supply[entry.level]?.[entry.jobId] || []
                };
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
