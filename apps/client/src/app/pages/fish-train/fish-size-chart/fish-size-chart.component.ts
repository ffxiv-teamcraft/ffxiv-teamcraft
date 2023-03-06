import { ChangeDetectorRef, Component, Input } from '@angular/core';
import { PersistedFishTrain } from '../../../model/other/persisted-fish-train';
import { EChartsOption } from 'echarts';
import { TranslateService } from '@ngx-translate/core';
import { SettingsService } from '../../../modules/settings/settings.service';
import { LodestoneService } from '../../../core/api/lodestone.service';
import { observeInput } from '../../../core/rxjs/observe-input';
import { BehaviorSubject, combineLatest, ReplaySubject } from 'rxjs';
import { isEqual, uniq } from 'lodash';
import { auditTime, delay, distinctUntilChanged, map, shareReplay, switchMap, takeUntil, tap } from 'rxjs/operators';
import { TeamcraftComponent } from '../../../core/component/teamcraft-component';
import { Character } from '@xivapi/angular-client';
import { safeCombineLatest } from '../../../core/rxjs/safe-combine-latest';
import { I18nToolsService } from '../../../core/tools/i18n-tools.service';

@Component({
  selector: 'app-fish-size-chart',
  templateUrl: './fish-size-chart.component.html',
  styleUrls: ['./fish-size-chart.component.less']
})
export class FishSizeChartComponent extends TeamcraftComponent {
  echartsInstance$ = new ReplaySubject<any>();

  loading = true;

  onlyAccurate$ = new BehaviorSubject<boolean>(true);

  @Input()
  train: PersistedFishTrain & { stopped: boolean };

  @Input()
  reports: { itemId: number, userId: string, date: string, size: number }[];

  options: EChartsOption = {
    backgroundColor: '#191E25',
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    tooltip: {
      trigger: 'axis',
      order: 'valueDesc',
      axisPointer: {
        type: 'shadow'
      }
    },
    xAxis: {
      type: 'category',
      axisLabel: {
        show: true
      }
    },
    yAxis: {
      name: this.translate.instant('DB.FISH.OVERLAY.Size'),
      type: 'log',
      minorSplitLine: {
        show: true
      }
    },
    series: [],
    animationDuration: 0,
    animationDurationUpdate: 300,
    empty: true
  };

  constructor(private translate: TranslateService, private settings: SettingsService,
              private lodestone: LodestoneService, private cd: ChangeDetectorRef,
              private i18n: I18nToolsService) {
    /**
     * NOTE:
     * If we want to implement chart race replay, it'd be quite easy:
     *  - Add filter on data in parent to only consider data with date <= currentTime
     *  - Add a function in train facade to replay a train, this function would simply emit values on time$ between start and stop of the given train
     */
    super();
    const reports$ = observeInput(this, 'reports');
    const characters$ = reports$.pipe(
      map(reports => uniq(reports.map(report => report.userId)).sort()),
      distinctUntilChanged(isEqual),
      switchMap(userIds => {
        return safeCombineLatest(userIds.map(userId => {
          return this.lodestone.getUserCharacter(userId).pipe(
            map(entry => {
              return {
                ...entry,
                userId
              };
            })
          );
        }));
      }),
      map((entries: { character: Character, verified: boolean, userId: string }[]) => {
        return entries.reduce((acc, entry) => {
          return {
            ...acc,
            [entry.userId]: entry
          };
        }, {});
      }),
      tap(() => this.loading = false),
      shareReplay(1)
    );


    const reportsWithNames$ = reports$.pipe(
      switchMap(reports => {
        return safeCombineLatest(uniq(reports.map(report => report.itemId))
          .filter(itemId => itemId > 0)
          .map(itemId => {
            return this.i18n.getNameObservable('items', itemId).pipe(
              map(name => ({ itemId, name }))
            );
          })).pipe(
          map(names => {
            return {
              reports,
              names: names.reduce((acc, entry) => ({ ...acc, [entry.itemId]: entry.name }), {})
            };
          })
        );
      }),
      tap(() => this.loading = false)
    );

    const train$ = observeInput(this, 'train').pipe(
      distinctUntilChanged((a, b) => isEqual(a.fish, b.fish))
    );

    combineLatest([this.echartsInstance$, characters$, reportsWithNames$, train$, this.onlyAccurate$]).pipe(
      delay(500),
      map(([echartsInstance, characters, { reports, names }, train, onlyAccurate]) => {
        const trainFishList = train.fish.map(fish => fish.id);
        const accurateReports = reports
          .filter(report => {
            return !onlyAccurate || trainFishList.includes(report.itemId);
          })
          .map(report => {
            return {
              ...report,
              date: new Date(report.date).getTime()
            };
          })
          .sort((a, b) => a.date - b.date);
        const smallestAndLargestByItemId = accurateReports.reduce((acc, report) => {
          const entry = acc[report.itemId];
          if (!entry) {
            return {
              ...acc,
              [report.itemId]: {
                itemId: report.itemId,
                max: report,
                min: report
              }
            };
          }
          if (entry.max.size < report.size) {
            entry.max = report;
          }
          if (entry.min.size > report.size) {
            entry.min = report;
          }
          return acc;
        }, {});
        return {
          echartsInstance,
          chartData: Object.values<any>(smallestAndLargestByItemId),
          characters,
          names
        };
      }),
      takeUntil(this.onDestroy$),
      auditTime(300)
    ).subscribe(({ echartsInstance, chartData, characters, names }) => {
      this.options.empty = chartData.length === 0;
      echartsInstance.setOption({
        xAxis: {
          data: chartData.map(row => names[row.itemId])
        },
        series: [
          {
            name: this.translate.instant('DB.FISH.Min_size'),
            type: 'bar',
            stack: 'Total',
            silent: true,
            itemStyle: {
              borderColor: 'transparent',
              color: 'transparent'
            },
            label: {
              show: true,
              position: 'top',
              formatter: ({ dataIndex }) => {
                const row = chartData[dataIndex];
                const author = characters[row.min.userId]?.character?.Name || row.min.userId;
                const size = row.min.size / 10;
                return `${size}ilm by ${author}`;
              },
              distance: -20
            },
            emphasis: {
              itemStyle: {
                borderColor: 'transparent',
                color: 'transparent'
              }
            },
            data: chartData.map((row) => {
              return {
                value: row.min.size / 10
              };
            })
          },
          {
            name: this.translate.instant('DB.FISH.Max_size'),
            type: 'bar',
            stack: 'Total',
            colorBy: 'data',
            label: {
              show: true,
              position: 'top',
              formatter: ({ dataIndex }) => {
                const row = chartData[dataIndex];
                const author = characters[row.max.userId]?.character?.Name || row.max.userId;
                const size = row.max.size / 10;
                return `${size}ilm by ${author}`;
              }
            },
            data: chartData.map((row) => {
              return {
                value: row.max.size / 10
              };
            })
          }
        ]
      });
      this.cd.markForCheck();
    });
  }

  onChartInit(instance: any): void {
    this.echartsInstance$.next(instance);
  }
}
