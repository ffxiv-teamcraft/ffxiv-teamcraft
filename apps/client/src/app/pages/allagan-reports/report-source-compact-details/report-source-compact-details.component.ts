import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { AllaganReportSource } from '../model/allagan-report-source';

@Component({
  selector: 'app-report-source-compact-details',
  templateUrl: './report-source-compact-details.component.html',
  styleUrls: ['./report-source-compact-details.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReportSourceCompactDetailsComponent {

  AllaganReportSource = AllaganReportSource;

  @Input()
  source: AllaganReportSource;

  @Input()
  data: any;

  @Input()
  fullDisplayMode = false;

}
