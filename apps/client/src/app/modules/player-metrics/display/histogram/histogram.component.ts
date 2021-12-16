import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AbstractMetricDisplayComponent } from '../abstract-metric-display-component';
import { map } from 'rxjs/operators';
import { SettingsService } from '../../../settings/settings.service';

@Component({
  selector: 'app-histogram',
  templateUrl: './histogram.component.html',
  styleUrls: ['./histogram.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HistogramComponent extends AbstractMetricDisplayComponent {

  results$ = this.data$.pipe(
    map(reports => {
      return [{
        name: '',
        series: reports.map(report => {
          return {
            name: new Date(report.timestamp * 1000),
            value: report.data[1]
          };
        })
      }];
    })
  );

  constructor(public settings: SettingsService) {
    super();
  }
}
