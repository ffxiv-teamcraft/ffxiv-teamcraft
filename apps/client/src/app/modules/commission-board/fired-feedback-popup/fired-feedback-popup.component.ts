import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FiredReason } from '../model/fired-reason';
import { NzModalRef } from 'ng-zorro-antd/modal';

@Component({
  selector: 'app-fired-feedback-popup',
  templateUrl: './fired-feedback-popup.component.html',
  styleUrls: ['./fired-feedback-popup.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FiredFeedbackPopupComponent {

  firedReasons = Object.keys(FiredReason).map(key => {
    return {
      value: key,
      label: `COMMISSIONS.FIRED.${key}`
    };
  });

  pickedReason: string;

  constructor(private modalRef: NzModalRef) {
  }

  submit(): void {
    this.modalRef.close(this.pickedReason);
  }

  close(): void {
    this.modalRef.close();
  }

}
