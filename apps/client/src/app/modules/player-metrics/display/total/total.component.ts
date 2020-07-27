import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AbstractMetricDisplayComponent } from '../abstract-metric-display-component';
import { map } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-total',
  templateUrl: './total.component.html',
  styleUrls: ['./total.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
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
