import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { FiredReason } from '../model/fired-reason';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { ResignedReason } from '../model/resigned-reason';

@Component({
  selector: 'app-resigned-feedback-popup',
  templateUrl: './resigned-feedback-popup.component.html',
  styleUrls: ['./resigned-feedback-popup.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ResignedFeedbackPopupComponent {

  resignedReasons = Object.keys(ResignedReason).map(key => {
    return {
      value: key,
      label: `COMMISSIONS.RESIGNED.${key}`
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
