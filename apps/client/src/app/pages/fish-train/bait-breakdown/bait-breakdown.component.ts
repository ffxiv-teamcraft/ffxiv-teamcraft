import { Component, Input } from '@angular/core';
import { PersistedFishTrain } from '../../../model/other/persisted-fish-train';
import { combineLatest, ReplaySubject, switchMap } from 'rxjs';
import { EChartsOption } from 'echarts';
import { observeInput } from '../../../core/rxjs/observe-input';
import { auditTime, map, takeUntil, tap } from 'rxjs/operators';
import { uniq } from 'lodash';
import { safeCombineLatest } from '../../../core/rxjs/safe-combine-latest';
import { I18nToolsService } from '../../../core/tools/i18n-tools.service';
import { TeamcraftComponent } from '../../../core/component/teamcraft-component';
import { TranslateService } from '@ngx-translate/core';
import { formatNumber } from '@angular/common';

@Component({
  selector: 'app-bait-breakdown',
  templateUrl: './bait-breakdown.component.html',
  styleUrls: ['./bait-breakdown.component.less']
})
export class BaitBreakdownComponent extends TeamcraftComponent {
  echartsInstance$ = new ReplaySubject<any>();

  @Input()
  reports: { itemId: number, userId: string, date: string, baitId: number, mooch: boolean }[];

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
    title: {
      bottom: '5%',
      left: 'center'
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

  constructor(private i18n: I18nToolsService, private translate: TranslateService) {
    super();
    const reports$ = observeInput(this, 'reports').pipe(
      map(reports => reports.filter(report => !report.mooch))
    );
    const reportsWithNames$ = reports$.pipe(
      switchMap(reports => {
        return safeCombineLatest(uniq(reports.map(report => report.baitId))
          .filter(baitId => baitId > 0)
          .map(baitId => {
            return this.i18n.getNameObservable('items', baitId).pipe(
              map(name => ({ baitId, name }))
            );
          })).pipe(
          map(names => {
            return {
              reports,
              names: names.reduce((acc, entry) => ({ ...acc, [entry.baitId]: entry.name }), {})
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
        const name = names[report.baitId];
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
        legend: {
          formatter: name => {
            return `${name}: ${formatNumber(seriesData.find(v => v.name === name)?.value || 0, this.translate.currentLang, '1.0-0')}`;
          }
        },
        title:{
          text: `${this.translate.instant('COMMON.Total')}: ${formatNumber(seriesData.reduce((acc, v) => acc + v.value, 0), this.translate.currentLang, '1.0-0')}`
        },
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
