import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { AllaganReportsService } from '../allagan-reports.service';
import { NzModalService } from 'ng-zorro-antd/modal';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { distinctUntilChanged, filter, map, shareReplay, switchMap } from 'rxjs/operators';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { AuthFacade } from '../../../+state/auth.facade';
import { AllaganReportQueueEntry } from '../model/allagan-report-queue-entry';
import { NzMessageService } from 'ng-zorro-antd/message';
import { AllaganReportStatus } from '../model/allagan-report-status';
import { AllaganReportSource, getExtract, TRADE_SOURCES_PRIORITIES } from '@ffxiv-teamcraft/types';
import { uniq } from 'lodash';
import { LazyDataFacade } from '../../../lazy-data/+state/lazy-data.facade';
import { PageLoaderComponent } from '../../../modules/page-loader/page-loader/page-loader.component';
import { ReportSourceCompactDetailsComponent } from '../report-source-compact-details/report-source-compact-details.component';
import { ReportSourceDisplayComponent } from '../report-source-display/report-source-display.component';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzWaveModule } from 'ng-zorro-antd/core/wave';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { RouterLink } from '@angular/router';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { I18nNameComponent } from '../../../core/i18n/i18n-name/i18n-name.component';
import { ItemIconComponent } from '../../../modules/item-icon/item-icon/item-icon.component';
import { LazyScrollComponent } from '../../../modules/lazy-scroll/lazy-scroll/lazy-scroll.component';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzStatisticModule } from 'ng-zorro-antd/statistic';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { FormsModule } from '@angular/forms';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NgIf, NgFor, AsyncPipe, DecimalPipe } from '@angular/common';
import { FlexModule } from '@angular/flex-layout/flex';

@Component({
    selector: 'app-allagan-reports',
    templateUrl: './allagan-reports.component.html',
    styleUrls: ['./allagan-reports.component.less'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [FlexModule, NgIf, NzSelectModule, FormsModule, NgFor, NzDividerModule, NzCardModule, NzStatisticModule, NzEmptyModule, LazyScrollComponent, ItemIconComponent, I18nNameComponent, NzButtonModule, NzToolTipModule, RouterLink, NzIconModule, NzWaveModule, NzPopconfirmModule, NzGridModule, NzTagModule, ReportSourceDisplayComponent, ReportSourceCompactDetailsComponent, PageLoaderComponent, AsyncPipe, DecimalPipe, TranslateModule]
})
export class AllaganReportsComponent {

  AllaganReportStatus = AllaganReportStatus;

  AllaganReportSource = AllaganReportSource;

  public reportSources = uniq(Object.keys(AllaganReportSource));

  public applyingChange = false;

  public dirty = false;

  public selectCount = 0;

  private reloader$ = new BehaviorSubject<void>(void 0);

  public queueStatus$ = this.reloader$.pipe(
    switchMap(() => {
      return this.allaganReportsService.getQueueStatus().pipe(
        filter(() => !this.dirty && this.selectCount === 0),
        map(rows => {
          return rows.map(row => {
            return {
              ...row,
              selected: false
            };
          });
        })
      );
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
            && getExtract(extracts, itemId).sources.length === 0;
        });
      return {
        reportsCount: dashboardData.reportsCount,
        appliedReportsCount: dashboardData.appliedReportsCount,
        fishCoverage: Math.floor(1000 * (fishes.length - fishWithNoData.length) / fishes.length) / 10,
        fishWithNoData,
        itemsWithNoSource: Object.keys(items)
          .filter(id => {
            if (+id <= 1 || TRADE_SOURCES_PRIORITIES[+id] >= 20) {
              return false;
            }
            const enName = items[id].en;
            const frName = items[id].fr;
            return !fishWithNoData.includes(+id)
              && !['Dated', 'Skybuilders'].some(ignored => enName.indexOf(ignored) > -1)
              && !/S\d{1,2}$/.test(frName) && enName.length > 0
              && getExtract(extracts, +id).sources.length === 0;
          }).sort((a, b) => +b - +a)
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

  public selectAll(rows: AllaganReportQueueEntry[]): void {
    rows.forEach(row => {
      if (row.type === AllaganReportStatus.PROPOSAL && row.source !== AllaganReportSource.FISHING && row.source !== AllaganReportSource.SPEARFISHING) {
        row.selected = true;
        this.selectCount++;
      }
    });
    this.cd.detectChanges();
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
      this.reloader$.next();
    });
  }

  rejectProposal(entry: AllaganReportQueueEntry): void {
    this.dirty = false;
    this.allaganReportsService.reject(entry).subscribe(() => {
      this.message.success(this.translate.instant('ALLAGAN_REPORTS.Proposal_rejected'));
      this.applyingChange = false;
      this.cd.detectChanges();
      this.reloader$.next();
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
      this.reloader$.next();
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
      this.reloader$.next();
    });
  }
}
