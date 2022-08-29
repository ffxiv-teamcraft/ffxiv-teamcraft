import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { AllaganReportsService } from '../allagan-reports.service';
import { NzModalService } from 'ng-zorro-antd/modal';
import { TranslateService } from '@ngx-translate/core';
import { distinctUntilChanged, filter, map, shareReplay } from 'rxjs/operators';
import { combineLatest } from 'rxjs';
import { AuthFacade } from '../../../+state/auth.facade';
import { AllaganReportQueueEntry } from '../model/allagan-report-queue-entry';
import { NzMessageService } from 'ng-zorro-antd/message';
import { AllaganReportStatus } from '../model/allagan-report-status';
import { AllaganReportSource } from '../model/allagan-report-source';
import { uniq } from 'lodash';
import { LazyDataFacade } from '../../../lazy-data/+state/lazy-data.facade';

@Component({
  selector: 'app-allagan-reports',
  templateUrl: './allagan-reports.component.html',
  styleUrls: ['./allagan-reports.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AllaganReportsComponent {

  AllaganReportStatus = AllaganReportStatus;

  AllaganReportSource = AllaganReportSource;

  public reportSources = uniq(Object.keys(AllaganReportSource));

  public applyingChange = false;

  public dirty = false;

  public selectCount = 0;

  public queueStatus$ = this.allaganReportsService.getQueueStatus().pipe(
    filter(() => !this.dirty),
    map(rows => {
      return rows.map(row => {
        return {
          ...row,
          selected: false
        };
      });
    })
  );

  isDataChecker$ = this.authFacade.user$.pipe(
    map(user => user.admin || user.moderator || user.allaganChecker),
    distinctUntilChanged(),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  public status$ = combineLatest([
    this.lazyData.getEntry('extracts'),
    this.lazyData.getEntry('fishes'),
    this.lazyData.getEntry('items'),
    this.allaganReportsService.getDashboardData()
  ]).pipe(
    map(([extracts, fishes, items, dashboardData]) => {
      const fishWithNoData = fishes
        .filter(itemId => {
          return itemId < 200000 && !items[itemId].en.includes('Skybuilders')
            && extracts[itemId].sources.length === 0;
        });
      return {
        reportsCount: dashboardData.reportsCount,
        appliedReportsCount: dashboardData.appliedReportsCount,
        fishCoverage: Math.floor(1000 * (fishes.length - fishWithNoData.length) / fishes.length) / 10,
        fishWithNoData,
        itemsWithNoSource: Object.values(extracts).filter(e => {
          if (e.id < 0) {
            return false;
          }
          const enName = items[e.id].en;
          const frName = items[e.id].fr;
          return !fishWithNoData.includes(e.id)
            && !['Dated', 'Skybuilders'].some(ignored => enName.indexOf(ignored) > -1)
            && !/S\d{1,2}$/.test(frName) && enName.length > 0
            && e.sources.length === 0;
        }).map(e => e.id).sort((a, b) => b - a)
      };
    })
  );


  public sourceFilter$ = this.allaganReportsService.filter$;

  constructor(public allaganReportsService: AllaganReportsService,
              private dialog: NzModalService, public translate: TranslateService,
              private lazyData: LazyDataFacade, private authFacade: AuthFacade,
              private message: NzMessageService, private cd: ChangeDetectorRef) {
  }

  public saveSourceFilter(sources: AllaganReportSource[]): void {
    this.allaganReportsService.filter$.next(sources);
  }

  public onRowChecked($event: boolean): void {
    this.dirty = true;
    if ($event) {
      this.selectCount++;
    } else {
      this.selectCount--;
    }
  }

  public handleCheckboxClick($event: MouseEvent, rows: AllaganReportQueueEntry[], index: number): void {
    if ($event.shiftKey) {
      const slice = rows.slice(0, index).reverse();
      for (const row of slice) {
        if (row.selected) {
          break;
        }
        if (row.type === AllaganReportStatus.PROPOSAL && row.source !== AllaganReportSource.FISHING && row.source !== AllaganReportSource.SPEARFISHING) {
          row.selected = true;
          this.selectCount++;
        }
      }
      this.cd.detectChanges();
    }
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

  acceptProposal(entry: AllaganReportQueueEntry): void {
    this.dirty = false;
    this.allaganReportsService.acceptProposal(entry).subscribe(() => {
      this.message.success(this.translate.instant('ALLAGAN_REPORTS.Proposal_accepted'));
      this.applyingChange = false;
      this.cd.detectChanges();
    });
  }

  rejectProposal(entry: AllaganReportQueueEntry): void {
    this.dirty = false;
    this.allaganReportsService.reject(entry).subscribe(() => {
      this.message.success(this.translate.instant('ALLAGAN_REPORTS.Proposal_rejected'));
      this.applyingChange = false;
      this.cd.detectChanges();
    });
  }

  acceptMany(entries: AllaganReportQueueEntry[]): void {
    this.dirty = false;
    this.allaganReportsService.acceptManyProposal(entries.filter(e => e.selected).map(e => {
      delete e.selected;
      return e;
    })).subscribe(() => {
      this.message.success(this.translate.instant('ALLAGAN_REPORTS.Proposal_accepted'));
      this.applyingChange = false;
      this.selectCount = 0;
      this.cd.detectChanges();
    });
  }

  rejectMany(entries: AllaganReportQueueEntry[]): void {
    this.dirty = false;
    this.allaganReportsService.rejectMany(entries.filter(e => e.selected).map(e => {
      delete e.selected;
      return e;
    })).subscribe(() => {
      this.message.success(this.translate.instant('ALLAGAN_REPORTS.Proposal_rejected'));
      this.applyingChange = false;
      this.selectCount = 0;
      this.cd.detectChanges();
    });
  }
}
