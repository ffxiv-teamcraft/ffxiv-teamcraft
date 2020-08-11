import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AbstractMetricDisplayComponent } from '../abstract-metric-display-component';
import { ProbeSource } from '../../model/probe-source';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TableComponent extends AbstractMetricDisplayComponent {
  ProbeSource = ProbeSource;

  constructor(public translate: TranslateService) {
    super();
  }
}
