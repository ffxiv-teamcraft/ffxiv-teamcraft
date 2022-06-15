import { ChangeDetectionStrategy, Component, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { map, shareReplay, switchMap } from 'rxjs/operators';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { LazyDataFacade } from '../../../lazy-data/+state/lazy-data.facade';

@Component({
  selector: 'app-search-job-picker',
  templateUrl: './search-job-picker.component.html',
  styleUrls: ['./search-job-picker.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SearchJobPickerComponent),
      multi: true
    }
  ]
})
export class SearchJobPickerComponent implements ControlValueAccessor {

  public jobsDisplay$ = this.lazyData.getEntry('jobCategories').pipe(
    switchMap(data => {
      return combineLatest([
        this.toJobIds(data[33].jobs),
        this.toJobIds(data[156].jobs),
        this.toJobIds(data[157].jobs),
        this.toJobIds(data[148].jobs),
        this.toJobIds(data[123].jobs),
        this.toJobIds(data[124].jobs),
        this.toJobIds(data[32].jobs)
      ]);
    }),
    map(([doh, tank, healer, melee, ranged, caster, land]) => {
      return {
        tank,
        healer,
        melee,
        ranged,
        caster,
        land,
        hand1: doh.slice(0, 4),
        hand2: doh.slice(4),
        // Since there will be no more classes, these are just hardcoded because they don't have their own categories
        tankClass: [1, 3],
        healerClass: [6],
        meleeClass: [2, 4, 29],
        rangedClass: [5],
        casterClass: [7, 26]
      };
    }),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  private onChange: (_: any) => void;

  private onTouched: () => void;

  private selectedJobs$: BehaviorSubject<number[]> = new BehaviorSubject([]);

  public display$ = combineLatest([this.jobsDisplay$, this.selectedJobs$]).pipe(
    map(([display, selected]) => {
      return Object.keys(display).reduce((acc, key) => {
        return {
          ...acc,
          [key]: this.mapToEntry(display[key], selected)
        };
      }, {});
    })
  );

  private pristine = true;

  constructor(private lazyData: LazyDataFacade) {
  }

  registerOnChange(fn: (_: any) => {}): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => {}): void {
    this.onTouched = fn;
  }

  writeValue(value: number[]): void {
    this.selectedJobs$.next(value);
  }

  toggleJob(job: number, newState: boolean): void {
    if (newState) {
      this.selectedJobs$.next([...this.selectedJobs$.value, job]);
    } else {
      this.selectedJobs$.next(this.selectedJobs$.value.filter(j => j !== job));
    }
    if (this.pristine) {
      this.pristine = false;
      if (this.onTouched) {
        this.onTouched();
      }
    }
    if (this.onChange) {
      this.onChange(this.selectedJobs$.value);
    }
  }

  private toJobIds(abbrs: string[]): Observable<number[]> {
    return combineLatest([
      this.lazyData.getEntry('jobAbbr'),
      this.lazyData.getEntry('jobSortIndex')
    ]).pipe(
      map(([jobAbbr, jobSortIndex]) => {
        return abbrs.map(abbr => +Object.keys(jobAbbr).find(key => jobAbbr[key].en === abbr))
          .sort((a, b) => jobSortIndex[a] - jobSortIndex[b]);
      })
    );
  }

  private mapToEntry(jobs: number[], selected: number[]): { id: number, selected: boolean }[] {
    return jobs.map(id => ({ id, selected: selected.includes(id) }));
  }

}
