import { ChangeDetectionStrategy, Component } from '@angular/core';
import { merge, Observable, Subject } from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { map } from 'rxjs/operators';
import { AuthFacade } from '../../../+state/auth.facade';
import { LazyDataService } from '../../../core/data/lazy-data.service';

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
    })
  );

  public levelsEditor$ = new Subject<Record<number, number>>();

  constructor(private fb: FormBuilder, private authFacade: AuthFacade,
              private lazyData: LazyDataService) {
    this.form$ = this.levels$.pipe(
      map(levels => {
        const groupConfig = Object.keys(levels).reduce((group, key) => {
          group[key] = [levels[key], [Validators.required, Validators.min(1)]];
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
            { job: jobId, groups: this.getCollectables(+jobId, +levels[jobId]) }
          ];
        }, []);
      })
    );
  }

  public applyNewLevels(form: FormGroup): void {
    this.levelsEditor$.next(form.getRawValue());
  }

  private getCollectables(jobId: number, level: number): any[] {
    return Object.keys(this.lazyData.data.collectables)
      .filter(key => {
        const collectableEntry = this.lazyData.data.collectables[key];
        if (collectableEntry.hwd) {
          return false;
        }
        return collectableEntry.levelMin <= level && collectableEntry.levelMax >= level;
      })
      .map(key => this.lazyData.data.collectables[key])
      .reduce((acc, row) => {
        let group = acc.find(accRow => accRow.group = row.group);
        if (group === undefined) {
          acc.push({
            group: row.group,
            collectables: []
          });
          group = acc[acc.length - 1];
        }
        group.collectables.push(row);
      }, []);
  }

}
