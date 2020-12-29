import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NzModalRef } from 'ng-zorro-antd/modal';

@Component({
  selector: 'app-rawsock-admin-error-popup',
  templateUrl: './rawsock-admin-error-popup.component.html',
  styleUrls: ['./rawsock-admin-error-popup.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
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
