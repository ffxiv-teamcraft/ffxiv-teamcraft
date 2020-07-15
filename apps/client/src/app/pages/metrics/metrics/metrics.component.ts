import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { PlayerMetricsService } from '../../../modules/player-metrics/player-metrics.service';
import { map } from 'rxjs/operators';
import { ProbeReport } from '../../../modules/player-metrics/model/probe-report';
import { MetricType } from '../../../modules/player-metrics/model/metric-type';
import { groupBy, sum } from 'lodash';
import { ProbeSource } from '../../../modules/player-metrics/model/probe-source';

@Component({
  selector: 'app-metrics',
  templateUrl: './metrics.component.html',
  styleUrls: ['./metrics.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MetricsComponent implements OnInit {

  public gil$ = this.metricsService.logs$.pipe(
    map((entries: ProbeReport[]) => {
      const expenses = entries.filter(e => e.type === MetricType.CURRENCY && e.data[0] === 1 && e.data[1] > 0);
      const bySource = groupBy(expenses, row => row.data[2]);
      return Object.entries<ProbeReport[]>(bySource)
        .map(([key, value]) => {
          return {
            source: ProbeSource[key],
            total: sum(value.map(v => v.data[1]))
          };
        });

    })
  );

  constructor(private metricsService: PlayerMetricsService) {
  }

  ngOnInit(): void {
    const from = new Date();
    from.setDate(0);
    this.metricsService.load(from);
  }

}
