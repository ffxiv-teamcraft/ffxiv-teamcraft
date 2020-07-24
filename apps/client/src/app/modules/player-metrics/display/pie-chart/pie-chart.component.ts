import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AbstractMetricDisplayComponent } from '../abstract-metric-display-component';
import { map } from 'rxjs/operators';
import { ProbeReport } from '../../model/probe-report';
import { ProbeSource } from '../../model/probe-source';
import { I18nToolsService } from '../../../../core/tools/i18n-tools.service';
import { LocalizedDataService } from '../../../../core/data/localized-data.service';
import { TranslateService } from '@ngx-translate/core';
import { SettingsService } from '../../../settings/settings.service';

@Component({
  selector: 'app-pie-chart',
  templateUrl: './pie-chart.component.html',
  styleUrls: ['./pie-chart.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PieChartComponent extends AbstractMetricDisplayComponent {
  results$ = this.data$.pipe(
    map(reports => {
      return reports.reduce((display, report) => {
        const metricName = this.getMetricName(report);
        let entry = display.find(d => d.name === metricName);
        if (entry === undefined) {
          display.push({
            name: metricName,
            value: 0
          });
          entry = display[display.length - 1];
        }
        entry.value += this.getMetricValue(report);
        return display;
      }, []);
    }),
    map(display => {
      if (display.every(d => d.value < 0)) {
        return display.map(d => {
          d.value *= -1;
          return d;
        });
      }
      return display;
    })
  );

  constructor(private i18n: I18nToolsService, private l12n: LocalizedDataService, private translate: TranslateService,
              public settings: SettingsService) {
    super();
  }


  private getMetricValue(report: ProbeReport): number {
    return report.data[1];
  }

  private getMetricName(report: ProbeReport): string {
    switch (this.params?.metric) {
      case 'amount':
        // TODO once we have reports with more than itemId at index 0, handle properly here
        return this.i18n.getName(this.l12n.getItem(report.data[0]));
      case 'source':
      default:
        return this.translate.instant(`METRICS.SOURCES.${ProbeSource[report.source]}`);
    }
  }
}
