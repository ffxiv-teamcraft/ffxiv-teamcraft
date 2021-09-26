import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AllaganReportsService } from '../allagan-reports.service';
import { environment } from '../../../../environments/environment';
import { NzModalService } from 'ng-zorro-antd/modal';
import { TranslateService } from '@ngx-translate/core';
import { SheetImportPopupComponent } from '../sheet-import-popup/sheet-import-popup.component';

@Component({
  selector: 'app-allagan-reports',
  templateUrl: './allagan-reports.component.html',
  styleUrls: ['./allagan-reports.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AllaganReportsComponent {

  public devEnv = !environment.production;

  public queueStatus$ = this.allaganReportsService.getQueueStatus();

  constructor(public allaganReportsService: AllaganReportsService,
              private dialog: NzModalService, private translate: TranslateService) {
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
