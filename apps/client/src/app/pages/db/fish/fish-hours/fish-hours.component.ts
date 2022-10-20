import { ChangeDetectionStrategy, Component } from '@angular/core';
import { map } from 'rxjs/operators';
import { FishContextService } from '../../service/fish-context.service';
import { SettingsService } from '../../../../modules/settings/settings.service';
import { Observable } from 'rxjs';
import { EChartsOption } from 'echarts';

@Component({
  selector: 'app-fish-hours',
  templateUrl: './fish-hours.component.html',
  styleUrls: ['./fish-hours.component.less', '../../common-db.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FishHoursComponent {
  public readonly loading$ = this.fishCtx.hoursByFish$.pipe(map((res) => res.loading));

  public readonly etimesChartData$ = this.fishCtx.hoursByFish$.pipe(
    map((res) => {
      if (!res.data) return undefined;
      return Object.entries(res.data.byId).map(([key, value]) => ({ key, value }));
    })
  );

  options$: Observable<EChartsOption> = this.etimesChartData$.pipe(
    map(entries => {
      return {
        backgroundColor: '#191E25',
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            animation: false
          }
        },
        xAxis: {
          type: 'category',
          data: new Array(24).fill(null).map((_, i) => `${i}:00`)
        },
        yAxis: {
          type: 'value'
        },
        series: {
          data: entries.map(({ value }) => {
            return value;
          }),
          type: 'line'
        }
      };
    })
  );

  public readonly fishEyes$ = this.fishCtx.fishEyes$;

  constructor(public readonly settings: SettingsService, public readonly fishCtx: FishContextService) {
  }
}
