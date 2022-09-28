import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { I18nToolsService } from '../../../../core/tools/i18n-tools.service';
import { SettingsService } from '../../../../modules/settings/settings.service';
import { combineLatest, Observable, of, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, map, shareReplay, startWith, switchMap, takeUntil } from 'rxjs/operators';
import { FishContextService } from '../../service/fish-context.service';
import { TranslateService } from '@ngx-translate/core';
import { Chart, ChartOptions } from 'chart.js';
import { Tug } from '../../../../core/data/model/tug';
import { LazyDataFacade } from '../../../../lazy-data/+state/lazy-data.facade';
import { withLazyData } from '../../../../core/rxjs/with-lazy-data';

const fishImageUrls = [];

Chart.pluginService.register({
  // TODO fix image loading
  // afterDraw: chart => {
  //   const ctx = chart.chart.ctx;
  //   const xAxis = chart.scales['x-axis-0'];
  //   const yAxis = chart.scales['y-axis-0'];
  //   yAxis.ticks.forEach((value, index) => {
  //     const y = yAxis.getPixelForTick(index);
  //     const image = new Image();
  //     image.src = fishImageUrls[index],
  //       ctx.drawImage(image, xAxis.left - 33, y - 16, 32, 32);
  //   });
  // }
});

interface FishingSpotChartData {
  id: number;
  name: string;
  series: Array<{ name: string; value: number }>;
}

@Component({
  selector: 'app-fishing-spot-bite-times',
  templateUrl: './fishing-spot-bite-times.component.html',
  styleUrls: ['./fishing-spot-bite-times.component.less', '../../common-db.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FishingSpotBiteTimesComponent implements OnInit, OnDestroy {
  public readonly colors = [{ tug: Tug.LIGHT, color: '184, 245, 110' }, { tug: Tug.MEDIUM, color: '245, 196, 110' }, { tug: Tug.BIG, color: '245, 153, 110' }];

  @Output()
  public readonly activeFishChange = new EventEmitter<number | undefined>();

  public readonly baitFilter$ = this.fishCtx.baitId$.pipe(map((i) => (i >= 0 ? i : -1)));

  public readonly loading$ = this.fishCtx.biteTimesBySpot$.pipe(map((res) => res.loading));

  public readonly biteTimesChartData$: Observable<FishingSpotChartData[]> = this.fishCtx.biteTimesBySpot$.pipe(
    switchMap((res) => {
      if (!res.data) return of([]);
      const fishNames: Array<Observable<{ id: number; name: string }>> = Object.keys(res.data.byFish).map((id) =>
        this.i18n.getNameObservable('items', +id).pipe(map((name) => ({ id: +id, name })))
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
                  value: value
                }))
                .filter((i) => i.value > 1)
                .sort((a, b) => a.name - b.name)
            }))
            .filter((i) => i.series.length > 0);
        }),
        debounceTime(100)
      );
    }),
    startWith([]),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  public readonly biteTimesChartJSData$: Observable<any> = combineLatest([this.fishCtx.biteTimesBySpot$, this.fishCtx.tugsBySpotByFish$]).pipe(
    switchMap(([res, tugs]) => {
      if (!res.data || !tugs.data) return of([]);
      const tugByFish = tugs.data.data.reduce((acc, row) => {
        const bestTug = Object.entries<number>(row.valuesByColId).sort(([, a], [, b]) => b - a)[0][0];
        const clone = [...acc];
        clone[row.rowId] = bestTug;
        return clone;
      }, []);
      const fishNames: Array<Observable<{ id: number; name: string }>> = Object.keys(res.data.byFish).map((id) =>
        this.i18n.getNameObservable('items', +id).pipe(
          map((name) => ({ id: +id, name: `${name} (${['!!', '!!!', '!'][tugByFish[id]]})` }))
        )
      );
      if (fishNames.length === 0) {
        return of({
          labels: [],
          datasets: []
        });
      }
      return combineLatest([...fishNames]).pipe(
        withLazyData(this.lazyData, 'itemIcons'),
        map(([[...names], itemIcons]) => {
          const sortedNames = names.sort((a, b) => a.name < b.name ? 1 : -1);
          const colors = sortedNames.map(el => {
            return this.colors.find(c => c.tug === +tugByFish[el.id])?.color || 'white';
          });
          return {
            labels: sortedNames.map(el => el.name),
            datasets: [{
              borderWidth: 1,
              itemRadius: 0,
              outlierRadius: 3,
              outlierColor: colors.map(color => `rgba(${color}, 0.5)`),
              data: sortedNames.map((el, index) => {
                if (itemIcons) {
                  fishImageUrls[index] = 'https://xivapi.com' + itemIcons[el.id];
                }
                return Object.entries(res.data.byFish[el.id].byTime)
                  .map(([time, occurences]) => {
                    return new Array(occurences).fill(+time);
                  })
                  .flat();
              }),
              backgroundColor: colors.map(color => `rgba(${color}, 0.3)`),
              borderColor: colors.map(color => `rgba(${color}, 0.5)`),
              barPercentage: 0.5,
              categoryPercentage: 1.0
            }]
          };
        }),
        debounceTime(100)
      );
    }),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  gridColor = 'rgba(255,255,255,.3)';

  fontColor = 'rgba(255,255,255,.5)';

  options: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    legend: {
      display: false
    },
    tooltips: {
      displayColors: false,
      callbacks: {
        boxplotLabel: (_item, _data, stats, hoveredOutlierIndex) => {
          if (hoveredOutlierIndex === -1) {
            // Tooltip for the box/whiskers
            return `min: ${stats.whiskerMin}, q1: ${stats.q1}, median: ${stats.median}, q3: ${stats.q3}, max: ${stats.whiskerMax}`;
          } else {
            // Tooltip for the outliers
            return `${stats.outliers[hoveredOutlierIndex]} (outlier)`;
          }
        }
      }
    },
    scales: {
      xAxes: [{
        scaleLabel: {
          display: true,
          labelString: `${this.translate.instant('DB.FISH.Bite_time')} (s)`,
          fontColor: this.fontColor
        },
        ticks: {
          beginAtZero: true,
          color: this.gridColor
        },
        gridLines: {
          color: this.gridColor
        }
      }],
      yAxes: [{
        ticks: {
          fontColor: this.fontColor,
          padding: 30
        },
        gridLines: {
          color: this.gridColor
        }
      }]
    }
  };

  public readonly baitIds$: Observable<number[] | undefined> = this.fishCtx.baitsBySpot$.pipe(
    map((res) => {
      if (!res.data) return undefined;
      const uniq = new Set(Object.keys(res.data.byId).map((id) => +id));
      return [...uniq];
    })
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
    public readonly fishCtx: FishContextService,
    private readonly translate: TranslateService,
    private lazyData: LazyDataFacade
  ) {
  }

  @Input()
  public set activeFish(value: number | undefined) {
    this.activeFish$.next(value >= 0 ? value : undefined);
  }

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
