import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { I18nToolsService } from '../../../../core/tools/i18n-tools.service';
import { SettingsService } from '../../../../modules/settings/settings.service';
import { combineLatest, Observable, of, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, map, shareReplay, startWith, switchMap, takeUntil } from 'rxjs/operators';
import { FishContextService } from '../../service/fish-context.service';

interface FishingSpotChartData {
  id: number;
  name: string;
  series: Array<{ name: string; value: number }>;
}

@Component({
  selector: 'app-fishing-spot-hours',
  templateUrl: './fishing-spot-hours.component.html',
  styleUrls: ['./fishing-spot-hours.component.less', '../../common-db.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FishingSpotHoursComponent implements OnInit, OnDestroy {
  @Output()
  public readonly activeFishChange = new EventEmitter<number | undefined>();

  public readonly loading$ = this.fishCtx.hoursBySpot$.pipe(map((res) => res.loading));

  public readonly hoursChartData$: Observable<FishingSpotChartData[]> = this.fishCtx.hoursBySpot$.pipe(
    switchMap((res) => {
      if (!res.data) return of([]);
      const fishNames: Array<Observable<{ id: number; name: string }>> = Object.keys(res.data.byFish).map((id) =>
        this.i18n.getNameObservable('items', +id).pipe(map((name) => ({ id: +id, name })))
      );
      return combineLatest([...fishNames]).pipe(
        map((names) => {
          return Object.entries(res.data.byFish).map(([fishId, entry]) => ({
            id: +fishId,
            name: names.find((name) => name.id === +fishId)?.name ?? '--',
            series: Object.entries(entry.byTime)
              .sort(([a], [b]) => +a - +b)
              .map(([hour, value]) => ({
                name: `${hour.padStart(2, '0')}:00`,
                value: value ?? 0
              }))
          }));
        }),
        debounceTime(100)
      );
    }),
    startWith([]),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  public readonly activeFishName$ = new Subject<string | undefined>();

  private readonly activeFish$ = new Subject<number | undefined>();

  public activeChartEntries$: Observable<Array<{ name: string }>> = this.activeFish$.pipe(
    distinctUntilChanged(),
    debounceTime(100),
    switchMap((fishId) => {
      if (fishId >= 0) {
        return this.i18n.getNameObservable('items', fishId).pipe(map((name) => [{ name }]));
      }
      return of([]);
    }),
    startWith([])
  );

  private readonly unsubscribe$ = new Subject<void>();

  constructor(
    private readonly i18n: I18nToolsService,
    public readonly settings: SettingsService,
    public readonly fishCtx: FishContextService
  ) {
  }

  @Input()
  public set activeFish(value: number | undefined) {
    this.activeFish$.next(value >= 0 ? value : undefined);
  }

  ngOnInit() {
    combineLatest([this.hoursChartData$, this.activeFishName$])
      .pipe(
        takeUntil(this.unsubscribe$),
        filter(([res]) => res.length > 0),
        map(([res, name]) => {
          if (!name) return undefined;
          return res.find((item) => item.name === name)?.id;
        }),
        distinctUntilChanged()
      )
      .subscribe((id) => this.activeFishChange.next(id));
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
