import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { TranslateModule } from '@ngx-translate/core';
import { NzWaveModule } from 'ng-zorro-antd/core/wave';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { FlexModule } from '@angular/flex-layout/flex';
import { NzDividerModule } from 'ng-zorro-antd/divider';

@Component({
    selector: 'app-rawsock-admin-error-popup',
    templateUrl: './rawsock-admin-error-popup.component.html',
    styleUrls: ['./rawsock-admin-error-popup.component.less'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [NzDividerModule, FlexModule, NzButtonModule, NzWaveModule, TranslateModule]
})
export class RawsockAdminErrorPopupComponent {

  constructor(private modalRef: NzModalRef) {
  }

  shutdownPcap(): void {
    this.modalRef.close('disable');
  }

  switchToWinpcap(): void {
    this.modalRef.close('winpcap');
  }

}
