import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NzModalRef } from 'ng-zorro-antd/modal';

@Component({
  selector: 'app-update-install-popup',
  templateUrl: './update-install-popup.component.html',
  styleUrls: ['./update-install-popup.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
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
