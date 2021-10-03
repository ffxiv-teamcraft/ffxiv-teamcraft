import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { AllaganReportSource } from '../model/allagan-report-source';

@Component({
  selector: 'app-report-source-display',
  templateUrl: './report-source-display.component.html',
  styleUrls: ['./report-source-display.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReportSourceDisplayComponent {

  AllaganReportSource = AllaganReportSource;

  @Input()
  source: AllaganReportSource;

}
