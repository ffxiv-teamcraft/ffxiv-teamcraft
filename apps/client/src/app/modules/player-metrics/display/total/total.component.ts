import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AbstractMetricDisplayComponent } from '../abstract-metric-display-component';
import { map } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { AsyncPipe, DecimalPipe } from '@angular/common';
import { NzStatisticModule } from 'ng-zorro-antd/statistic';

@Component({
    selector: 'app-total',
    templateUrl: './total.component.html',
    styleUrls: ['./total.component.less'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [NzStatisticModule, AsyncPipe, DecimalPipe]
})
export class TotalComponent extends AbstractMetricDisplayComponent {

  public total$ = this.data$.pipe(
    map(data => {
      return data.reduce((total, report) => {
        return total + report.data[1];
      }, 0) || 0;
    })
  );

  constructor(public translate: TranslateService) {
    super();
  }
}
