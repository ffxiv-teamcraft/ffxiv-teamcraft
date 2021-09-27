import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AllaganReportsService } from '../allagan-reports.service';
import { environment } from '../../../../environments/environment';
import { NzModalService } from 'ng-zorro-antd/modal';
import { TranslateService } from '@ngx-translate/core';
import { SheetImportPopupComponent } from '../sheet-import-popup/sheet-import-popup.component';
import { map } from 'rxjs/operators';
import { LazyDataService } from '../../../core/data/lazy-data.service';
import { combineLatest } from 'rxjs';

@Component({
  selector: 'app-allagan-reports',
  templateUrl: './allagan-reports.component.html',
  styleUrls: ['./allagan-reports.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AllaganReportsComponent {

  public devEnv = !environment.production;

  public queueStatus$ = this.allaganReportsService.getQueueStatus();

  public status$ = combineLatest([this.lazyData.extracts$, this.allaganReportsService.getDashboardData()]).pipe(
    map(([extracts, dashboardData]) => {
      const fishWithNoData = this.lazyData.data.fishes
        .filter(itemId => {
          return !dashboardData.itemIds.includes(itemId)
            && !this.lazyData.data.items[itemId].en.includes('Skybuilders');
        });
      return {
        reportsCount: dashboardData.reportsCount,
        appliedReportsCount: dashboardData.appliedReportsCount,
        fishCoverage: Math.floor(1000 * (this.lazyData.data.fishes.length - fishWithNoData.length) / this.lazyData.data.fishes.length) / 10,
        fishWithNoData,
        itemsWithNoSource: Object.values(extracts).filter(e => {
          const name = this.lazyData.data.items[e.id].en;
          return !['Dated', 'Skybuilders'].some(ignored => name.indexOf(ignored) > -1)
            && e.sources.length === 0 && !dashboardData.itemIds.includes(e.id);
        }).map(e => e.id).sort((a, b) => b - a)
      };
    })
  );

  constructor(public allaganReportsService: AllaganReportsService,
              private dialog: NzModalService, public translate: TranslateService,
              private lazyData: LazyDataService) {
  }

  importSheet(): void {
    this.dialog.create({
      nzContent: SheetImportPopupComponent,
      nzComponentParams: {},
      nzFooter: null,
      nzTitle: this.translate.instant('CUSTOM_ITEMS.Import_items')
    });
  }
}
