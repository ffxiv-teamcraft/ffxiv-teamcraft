import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { LocalizedLazyDataService } from 'apps/client/src/app/core/data/localized-lazy-data.service';
import { I18nToolsService } from 'apps/client/src/app/core/tools/i18n-tools.service';
import { SettingsService } from 'apps/client/src/app/modules/settings/settings.service';
import { combineLatest, Observable, of, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, map, shareReplay, startWith, switchMap, takeUntil } from 'rxjs/operators';
import { FishContextService } from '../../service/fish-context.service';

interface FishingSpotChartData {
  id: number;
  name: string;
  series: Array<{ name: string; value: number }>;
}

@Component({
  selector: 'app-fishing-spot-bite-times',
  templateUrl: './fishing-spot-bite-times.component.html',
  styleUrls: ['./fishing-spot-bite-times.component.less', '../../common-db.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FishingSpotBiteTimesComponent implements OnInit, OnDestroy {
  private readonly activeFish$ = new Subject<number | undefined>();
  @Input()
  public set activeFish(value: number | undefined) {
    this.activeFish$.next(value >= 0 ? value : undefined);
  }
  @Output()
  public readonly activeFishChange = new EventEmitter<number | undefined>();

  public readonly baitFilter$ = this.fishCtx.baitId$.pipe(map((i) => (i >= 0 ? i : -1)));

  public readonly loading$ = this.fishCtx.biteTimesBySpot$.pipe(map((res) => res.loading));

  public readonly biteTimesChartData$: Observable<FishingSpotChartData[]> = this.fishCtx.biteTimesBySpot$.pipe(
    switchMap((res) => {
      if (!res.data) return of([]);
      const fishNames: Array<Observable<{ id: number; name: string }>> = Object.keys(res.data.byFish).map((id) =>
        this.i18n.resolveName(this.l12n.getItem(+id)).pipe(map((name) => ({ id: +id, name })))
      );
      return combineLatest([...fishNames]).pipe(
        map(([...names]) => {
          return Object.entries(res.data.byFish)
            .map(([fishId, entry]) => ({
              id: +fishId,
              name: names.find((name) => name.id === +fishId)?.name ?? '--',
              series: Object.entries(entry.byTime)
                .map(([time, value]) => ({
                  name: +time,
                  value: value,
                }))
                .filter((i) => i.value > 1)
                .sort((a, b) => a.name - b.name),
            }))
            .filter((i) => i.series.length > 0);
        }),
        debounceTime(100)
      );
    }),
    startWith([]),
    shareReplay(1)
  );

  public readonly baitIds$: Observable<number[] | undefined> = this.fishCtx.baitsBySpot$.pipe(
    map((res) => {
      if (!res.data) return undefined;
      const uniq = new Set(Object.keys(res.data.byId).map((id) => +id));
      return [...uniq];
    })
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

  public readonly activeFishName$ = new Subject<string | undefined>();

  private readonly unsubscribe$ = new Subject<void>();

  constructor(
    private readonly l12n: LocalizedLazyDataService,
    private readonly i18n: I18nToolsService,
    public readonly settings: SettingsService,
    public readonly fishCtx: FishContextService
  ) {}

  ngOnInit() {
    combineLatest([this.biteTimesChartData$, this.activeFishName$])
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

  public setBaitId(baitId: number) {
    this.fishCtx.setBaitId(baitId === -1 ? undefined : baitId);
  }
}
