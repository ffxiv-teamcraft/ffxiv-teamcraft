import { Component, Input } from '@angular/core';
import { PersistedFishTrain } from '../../../model/other/persisted-fish-train';
import { BehaviorSubject, combineLatest, ReplaySubject, switchMap } from 'rxjs';
import { EChartsOption } from 'echarts';
import { observeInput } from '../../../core/rxjs/observe-input';
import { auditTime, distinctUntilChanged, map, takeUntil, tap } from 'rxjs/operators';
import { isEqual, uniq } from 'lodash';
import { safeCombineLatest } from '../../../core/rxjs/safe-combine-latest';
import { I18nToolsService } from '../../../core/tools/i18n-tools.service';
import { TeamcraftComponent } from '../../../core/component/teamcraft-component';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-fish-breakdown',
  templateUrl: './fish-breakdown.component.html',
  styleUrls: ['./fish-breakdown.component.less']
})
export class FishBreakdownComponent extends TeamcraftComponent {
  echartsInstance$ = new ReplaySubject<any>();

  @Input()
  train: PersistedFishTrain & { stopped: boolean };

  @Input()
  reports: { itemId: number, userId: string, date: string }[];

  loading = true;

  options: EChartsOption = {
    tooltip: {
      trigger: 'item'
    },
    backgroundColor: '#191E25',
    legend: {
      type: 'scroll',
      left: 10,
      top: 20,
      bottom: 20,
      orient: 'vertical'
    },
    series: [
      {
        type: 'pie',
        radius: ['40%', '70%'],
        data: [],
        itemStyle: {
          borderRadius: 10,
          borderColor: '#292929',
          borderWidth: 2
        },
        label: {
          show: false
        },
        labelLine: {
          show: false
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        },
        animationDuration: 200,
        animationDurationUpdate: 200
      }
    ],
    empty: true
  };

  onlyAccurate$ = new BehaviorSubject<boolean>(true);

  constructor(private i18n: I18nToolsService, private translate: TranslateService) {
    super();
    const reports$ = observeInput(this, 'reports');
    const train$ = observeInput(this, 'train').pipe(
      distinctUntilChanged((a, b) => isEqual(a.fish, b.fish))
    );
    const reportsWithNames$ = combineLatest([
      reports$,
      this.onlyAccurate$,
      train$
    ]).pipe(
      map(([reports, onlyAccurate, train]) => {
        const trainFishList = train.fish.map(fish => fish.id);
        return onlyAccurate ? reports.filter(report => trainFishList.includes(report.itemId)) : reports;
      }),
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

    combineLatest([reportsWithNames$, this.echartsInstance$]).pipe(
      takeUntil(this.onDestroy$),
      auditTime(300)
    ).subscribe(([{ reports, names }, echarts]) => {
      const totalPerName = reports.reduce((acc, report) => {
        const name = names[report.itemId] || this.translate.instant('DB.FISHING_SPOT.Miss');
        const entry = acc[name] || {
          name: name,
          value: 0
        };
        entry.value += 1;
        return {
          ...acc,
          [name]: entry
        };
      }, {});
      const seriesData = Object.values<{ name: string, value: number }>(totalPerName)
        .sort((a, b) => b.value - a.value);
      echarts.setOption({
        series: {
          data: seriesData
        }
      });
      this.options.empty = seriesData.length === 0;
    });
  }

  onChartInit(instance: any): void {
    this.echartsInstance$.next(instance);
  }
}
