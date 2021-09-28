import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { AllaganReportSource } from '../model/allagan-report-source';
import { AllaganReportQueueEntry } from '../model/allagan-report-queue-entry';
import { AllaganReport } from '../model/allagan-report';
import { AllaganReportStatus } from '../model/allagan-report-status';
import { UserLevel } from '../../../model/other/user-level';
import { TranslateService } from '@ngx-translate/core';
import { LazyDataService } from '../../../core/data/lazy-data.service';
import { OceanFishingTime } from '../model/ocean-fishing-time';

@Component({
  selector: 'app-allagan-report-row',
  templateUrl: './allagan-report-row.component.html',
  styleUrls: ['./allagan-report-row.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AllaganReportRowComponent {

  AllaganReportSource = AllaganReportSource;
  AllaganReportStatus = AllaganReportStatus;
  OceanFishingTime = OceanFishingTime;
  UserLevel = UserLevel;

  canSuggestDeletionOrModification = false;

  @Input()
  queueEntry: AllaganReportQueueEntry;

  @Input()
  report: AllaganReport;

  @Input()
  userIsChecker = false;

  @Input()
  userId: string;

  @Input()
  embed = false;

  @Input()
  focusId: string;

  @Input()
  set reportsQueue(queue: AllaganReportQueueEntry[]) {
    this.canSuggestDeletionOrModification = !this.embed && queue && !queue.some(entry => entry.report === this.report?.uid && [AllaganReportStatus.DELETION, AllaganReportStatus.MODIFICATION].includes(entry.type));
  }

  @Output()
  accept = new EventEmitter<void>();

  @Output()
  reject = new EventEmitter<void>();

  @Output()
  delete = new EventEmitter<void>();

  @Output()
  edit = new EventEmitter<void>();

  applyingChange = false;

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

  get fishingSpot(): any {
    return this.lazyData.data.fishingSpots.find(s => s.id === this.data.spot);
  }

  get hookset(): any {
    return [0, 4103, 4179][this.data.hookset];
  }

  constructor(public translate: TranslateService, private lazyData: LazyDataService) {
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
