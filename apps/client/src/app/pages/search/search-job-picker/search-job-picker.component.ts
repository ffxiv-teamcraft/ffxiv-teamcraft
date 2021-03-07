import { ChangeDetectionStrategy, Component, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { distinctUntilChanged, map, pluck, shareReplay } from 'rxjs/operators';
import { LazyDataService } from '../../../core/data/lazy-data.service';
import { BehaviorSubject, combineLatest } from 'rxjs';

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

  private onChange: (_: any) => void;

  private onTouched: () => void;

  private selectedJobs$: BehaviorSubject<number[]> = new BehaviorSubject([]);

  public jobsDisplay$ = this.lazyData.data$.pipe(
    pluck('jobCategories'),
    distinctUntilChanged(),
    map(data => {
      const doh = this.toJobIds(data[33].jobs);
      return {
        tank: this.toJobIds(data[156].jobs),
        healer: this.toJobIds(data[157].jobs),
        melee: this.toJobIds(data[148].jobs),
        ranged: this.toJobIds(data[123].jobs),
        caster: this.toJobIds(data[124].jobs),
        land: this.toJobIds(data[32].jobs),
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
    shareReplay(1)
  );

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

  constructor(private lazyData: LazyDataService) {
  }

  private toJobIds(abbrs: string[]): number[] {
    return abbrs.map(abbr => +Object.keys(this.lazyData.data.jobAbbr).find(key => this.lazyData.data.jobAbbr[key].en === abbr))
      .sort((a, b) => this.lazyData.data.jobSortIndex[a] - this.lazyData.data.jobSortIndex[b]);
  }

  private mapToEntry(jobs: number[], selected: number[]): { id: number, selected: boolean }[] {
    return jobs.map(id => ({ id, selected: selected.includes(id) }));
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

}
