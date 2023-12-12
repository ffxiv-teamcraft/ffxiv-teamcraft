import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { TranslateModule } from '@ngx-translate/core';
import { NzWaveModule } from 'ng-zorro-antd/core/wave';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { FlexModule } from '@angular/flex-layout/flex';
import { NzDividerModule } from 'ng-zorro-antd/divider';

@Component({
    selector: 'app-update-install-popup',
    templateUrl: './update-install-popup.component.html',
    styleUrls: ['./update-install-popup.component.less'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [NzDividerModule, FlexModule, NzButtonModule, NzWaveModule, TranslateModule]
})
export class UpdateInstallPopupComponent {

  constructor(private modalRef: NzModalRef) {
  }

  close(): void {
    this.modalRef.close(false);
  }

  install(): void {
    this.modalRef.close(true);
  }

}
