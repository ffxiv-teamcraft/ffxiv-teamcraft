import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NzModalRef } from 'ng-zorro-antd/modal';

@Component({
  selector: 'app-tutorial-popup',
  templateUrl: './tutorial-popup.component.html',
  styleUrls: ['./tutorial-popup.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TutorialPopupComponent {

  constructor(private modalRef: NzModalRef) {
  }

  public close(result: boolean): void {
    this.modalRef.close(result);
  }

}
