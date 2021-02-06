import { Injectable } from '@angular/core';
import { NzModalService } from 'ng-zorro-antd/modal';
import { TranslateService } from '@ngx-translate/core';
import { SettingsPopupComponent } from './settings-popup/settings-popup.component';

@Injectable()
export class SettingsPopupService {
  constructor(private dialog: NzModalService, private translate: TranslateService) {
  }

  public openSettings(): void {
    this.dialog.create({
      nzContent: SettingsPopupComponent,
      nzTitle: this.translate.instant('SETTINGS.Title'),
      nzWidth: '100vw',
      nzStyle: {
        top: 0,
        paddingBottom: 0
      },
      nzBodyStyle: {
        height: 'calc(100vh - 72px)'
      },
      nzFooter: null
    });
  }
}
