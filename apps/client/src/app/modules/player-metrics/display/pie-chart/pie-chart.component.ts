import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AbstractMetricDisplayComponent } from '../abstract-metric-display-component';
import { map, switchMap } from 'rxjs/operators';
import { ProbeReport } from '../../model/probe-report';
import { ProbeSource } from '../../model/probe-source';
import { I18nToolsService } from '../../../../core/tools/i18n-tools.service';
import { TranslateService } from '@ngx-translate/core';
import { SettingsService } from '../../../settings/settings.service';
import { Observable } from 'rxjs';
import { safeCombineLatest } from '../../../../core/rxjs/safe-combine-latest';
import { EChartsOption } from 'echarts';
import { formatNumber } from '@angular/common';

@Component({
  selector: 'app-pie-chart',
  templateUrl: './pie-chart.component.html',
  styleUrls: ['./pie-chart.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PieChartComponent extends AbstractMetricDisplayComponent {
  options$: Observable<EChartsOption> = this.data$.pipe(
    switchMap(reports => {
      return safeCombineLatest(reports.map(report => {
        return this.getMetricName(report).pipe(
          map(name => {
            return { name, report };
          })
        );
      })).pipe(
        map(reportsWithNames => {
          return reportsWithNames
            .reduce((display, { name, report }) => {
              let entry = display.find(d => d.name === name);
              if (entry === undefined) {
                display.push({
                  name: name,
                  value: 0
                });
                entry = display[display.length - 1];
              }
              entry.value += this.getMetricValue(report);
              return display;
            }, []);
        })
      );
    }),
    map(display => {
      if (display.every(d => d.value < 0)) {
        return display.map(d => {
          d.value *= -1;
          return d;
        });
      }
      return display;
    }),
    map(values => {
      if (values.length === 0) {
        return { empty: true };
      }
      return <EChartsOption>{
        tooltip: {
          trigger: 'item'
        },
        backgroundColor: '#292929',
        legend: {
          type: 'scroll',
          left: 10,
          top: 20,
          bottom: 20,
          orient: 'vertical',
          formatter: name => {
            return `${name}: ${formatNumber(values.find(v => v.name === name)?.value || 0, this.translate.currentLang, '1.0-0')}`;
          }
        },
        title: {
          bottom: '5%',
          left: 'center',
          text: `${this.translate.instant('COMMON.Total')}: ${formatNumber(values.reduce((acc, v) => acc + v.value, 0), this.translate.currentLang, '1.0-0')}`
        },
        series: [
          {
            type: 'pie',
            radius: ['40%', '70%'],
            data: values,
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
            }
          }
        ]
      };
    })
  );

  constructor(private i18n: I18nToolsService, private translate: TranslateService,
              public settings: SettingsService) {
    super();
  }


  private getMetricValue(report: ProbeReport): number {
    return report.data[1];
  }

  private getMetricName(report: ProbeReport): Observable<string> {
    switch (this.params?.metric) {
      case 'amount':
        // TODO once we have reports with more than itemId at index 0, handle properly here
        return this.i18n.getNameObservable('items', report.data[0]);
      case 'source':
      default:
        return this.translate.get(`METRICS.SOURCES.${ProbeSource[report.source]}`);
    }
  }
}
