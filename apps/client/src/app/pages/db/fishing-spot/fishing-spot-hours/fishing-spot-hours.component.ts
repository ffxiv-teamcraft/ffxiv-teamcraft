import { ChangeDetectionStrategy, Component, Output, EventEmitter, OnInit, OnDestroy, Input } from '@angular/core';
import { LocalizedLazyDataService } from 'apps/client/src/app/core/data/localized-lazy-data.service';
import { I18nToolsService } from 'apps/client/src/app/core/tools/i18n-tools.service';
import { SettingsService } from 'apps/client/src/app/modules/settings/settings.service';
import { forkJoin, of, Observable, Subject, combineLatest } from 'rxjs';
import { map, shareReplay, startWith, switchMap, take, takeUntil, filter, distinctUntilChanged, debounceTime } from 'rxjs/operators';
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
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FishingSpotHoursComponent implements OnInit, OnDestroy {
  private readonly activeFish$ = new Subject<number | undefined>();
  @Input()
  public set activeFish(value: number | undefined) {
    this.activeFish$.next(value >= 0 ? value : undefined);
  }
  @Output()
  public readonly activeFishChange = new EventEmitter<number | undefined>();

  public readonly loading$ = this.fishCtx.hoursBySpot$.pipe(map((res) => res.loading));

  public readonly hoursChartData$: Observable<FishingSpotChartData[]> = this.fishCtx.hoursBySpot$.pipe(
    switchMap((res) => {
      if (!res.data) return of([]);
      const fishNames: Record<string, Observable<string | undefined>> = Object.keys(res.data.byFish).reduce(
        (acc, fishId) => ({ ...acc, [fishId]: this.i18n.resolveName(this.l12n.getItem(+fishId)).pipe(take(1)) }),
        {}
      );
      // TODO: Combinelatest instead of forkjoin
      return forkJoin(fishNames).pipe(
        map((names) => {
          return Object.entries(res.data.byFish).map(([fishId, entry]) => ({
            id: +fishId,
            name: names[fishId] ?? '--',
            series: Object.entries(entry.byTime)
              .sort(([a], [b]) => +a - +b)
              .map(([hour, value]) => ({
                name: `${hour.padStart(2, '0')}:00`,
                value: value ?? 0,
              })),
          }));
        })
      );
    }),
    startWith([]),
    shareReplay(1)
  );

  public activeChartEntries$: Observable<Array<{ name: string }>> = this.activeFish$.pipe(
    distinctUntilChanged(),
    debounceTime(100),
    switchMap((fishId) => {
      if (fishId >= 0) {
        return this.i18n.resolveName(this.l12n.getItem(fishId)).pipe(map((name) => [{ name }]));
      }
      return of([]);
    }),
    startWith([])
  );

  public readonly hoveredName$ = new Subject<string | undefined>();

  private readonly unsubscribe$ = new Subject<void>();

  constructor(
    private readonly l12n: LocalizedLazyDataService,
    private readonly i18n: I18nToolsService,
    public readonly settings: SettingsService,
    public readonly fishCtx: FishContextService
  ) {}

  ngOnInit() {
    combineLatest([this.hoursChartData$, this.hoveredName$])
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
