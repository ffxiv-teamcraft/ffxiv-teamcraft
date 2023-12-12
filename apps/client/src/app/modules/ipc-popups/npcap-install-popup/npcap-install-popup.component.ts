import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { TranslateModule } from '@ngx-translate/core';
import { NzWaveModule } from 'ng-zorro-antd/core/wave';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { FlexModule } from '@angular/flex-layout/flex';
import { NzDividerModule } from 'ng-zorro-antd/divider';

@Component({
    selector: 'app-npcap-install-popup',
    templateUrl: './npcap-install-popup.component.html',
    styleUrls: ['./npcap-install-popup.component.less'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [NzDividerModule, FlexModule, NzButtonModule, NzWaveModule, TranslateModule]
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
