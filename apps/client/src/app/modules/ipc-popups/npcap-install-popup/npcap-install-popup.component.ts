import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NzModalRef } from 'ng-zorro-antd/modal';

@Component({
  selector: 'app-npcap-install-popup',
  templateUrl: './npcap-install-popup.component.html',
  styleUrls: ['./npcap-install-popup.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NpcapInstallPopupComponent {

  constructor(private modalRef: NzModalRef) {
  }

  shutdownPcap(): void {
    this.modalRef.close('disable');
  }

  install(): void {
    this.modalRef.close('install');
  }

}
