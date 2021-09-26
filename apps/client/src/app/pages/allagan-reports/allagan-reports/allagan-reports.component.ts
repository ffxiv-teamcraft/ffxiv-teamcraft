import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AllaganReportsService } from '../allagan-reports.service';

@Component({
  selector: 'app-allagan-reports',
  templateUrl: './allagan-reports.component.html',
  styleUrls: ['./allagan-reports.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AllaganReportsComponent {

  public queueStatus$ = this.allaganReportsService.getQueueStatus();

  constructor(public allaganReportsService: AllaganReportsService) {
  }
}
