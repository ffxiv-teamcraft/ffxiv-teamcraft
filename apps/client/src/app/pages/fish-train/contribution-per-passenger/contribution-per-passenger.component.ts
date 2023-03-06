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

@Component({
  selector: 'app-contribution-per-passenger',
  templateUrl: './contribution-per-passenger.component.html',
  styleUrls: ['./contribution-per-passenger.component.less']
})
export class ContributionPerPassengerComponent extends TeamcraftComponent {
  echartsInstance$ = new ReplaySubject<any>();

  loading = true;

  onlyAccurate$ = new BehaviorSubject<boolean>(true);

  @Input()
  train: PersistedFishTrain & { stopped: boolean };

  @Input()
  reports: { itemId: number, userId: string, date: string }[];

  options: EChartsOption = {
    grid: {
      left: 150
    },
    height: '100%',
    title: {
      text: this.translate.instant('FISH_TRAIN.Contribution_per_passenger')
    },
    backgroundColor: '#191E25',
    xAxis: {
      max: 'dataMax',
      show: true
    },
    yAxis: {
      type: 'category',
      axisLabel: {
        show: true
      },
      data: [],
      inverse: true,
      animationDuration: 300,
      animationDurationUpdate: 300,
      max: 10
    },
    series: [],
    legend: {
      orient: 'horizontal',
      top: 'bottom',
      data: []
    },
    animationDuration: 0,
    animationDurationUpdate: 300,
    empty: true
  };

  constructor(private translate: TranslateService, private settings: SettingsService,
              private lodestone: LodestoneService, private cd: ChangeDetectorRef) {
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

    const train$ = observeInput(this, 'train').pipe(
      distinctUntilChanged((a, b) => isEqual(a.fish, b.fish))
    );

    combineLatest([this.echartsInstance$, characters$, reports$, train$, this.onlyAccurate$]).pipe(
      delay(500),
      map(([echartsInstance, characters, reports, train, onlyAccurate]) => {
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
        const accurateReportsByUserId = accurateReports.reduce((acc, report, index) => {
          let userRow = acc.find(row => row.userId === report.userId);
          if (!userRow) {
            acc.push({
              userId: report.userId,
              total: 0
            });
            userRow = acc[acc.length - 1];
          }
          userRow.total++;
          return acc;
        }, []);
        return {
          echartsInstance,
          accurateReportsByUserId,
          characters
        };
      }),
      takeUntil(this.onDestroy$),
      auditTime(300)
    ).subscribe(({ echartsInstance, accurateReportsByUserId, characters }) => {
      echartsInstance.setOption({
        empty: accurateReportsByUserId.length === 0,
        yAxis: {
          data: accurateReportsByUserId.map(row => characters[row.userId]?.character?.Name || row.userId)
        },
        series: {
          realtimeSort: true,
          name: 'X',
          type: 'bar',
          data: accurateReportsByUserId.map((row) => {
            return {
              value: row.total,
              itemStyle: {
                color: this.settings.theme.primary
              }
            };
          }),
          label: {
            show: true,
            position: 'right',
            valueAnimation: true
          }
        }
      });
    });
    this.cd.markForCheck();
  }

  onChartInit(instance: any): void {
    this.echartsInstance$.next(instance);
  }
}
