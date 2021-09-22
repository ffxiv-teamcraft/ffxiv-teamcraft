import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { AllaganReportSource } from '../model/allagan-report-source';
import { AllaganReportQueueEntry } from '../model/allagan-report-queue-entry';
import { AllaganReport } from '../model/allagan-report';
import { AllaganReportStatus } from '../model/allagan-report-status';

@Component({
  selector: 'app-allagan-report-row',
  templateUrl: './allagan-report-row.component.html',
  styleUrls: ['./allagan-report-row.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AllaganReportRowComponent {

  AllaganReportSource = AllaganReportSource;

  @Input()
  queueEntry: AllaganReportQueueEntry;

  @Input()
  report: AllaganReport;

  get itemId(): number {
    return (this.report || this.queueEntry)?.itemId;
  }

  get source(): AllaganReportSource {
    return (this.report || this.queueEntry)?.source;
  }

  get data(): any {
    return (this.report || this.queueEntry)?.data;
  }

  get author(): string {
    return this.report?.reporter || this.queueEntry?.author;
  }

  get status(): AllaganReportStatus {
    return this.queueEntry?.type || AllaganReportStatus.ACCEPTED;
  }

  getColor(status: AllaganReportStatus): string {
    switch (status) {
      case AllaganReportStatus.ACCEPTED:
        return 'darkgreen';
      case AllaganReportStatus.DELETION:
        return '#f50';
      case AllaganReportStatus.MODIFICATION:
        return '#f2b10e';
      case AllaganReportStatus.PROPOSAL:
        return '#108ee9';
    }
  }

}
