import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { FiredReason } from '../model/fired-reason';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { ResignedReason } from '../model/resigned-reason';
import { TranslateModule } from '@ngx-translate/core';
import { NzWaveModule } from 'ng-zorro-antd/core/wave';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { FlexModule } from '@angular/flex-layout/flex';

@Component({
    selector: 'app-resigned-feedback-popup',
    templateUrl: './resigned-feedback-popup.component.html',
    styleUrls: ['./resigned-feedback-popup.component.less'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [FlexModule, NzRadioModule, FormsModule, NgFor, NzButtonModule, NzWaveModule, TranslateModule]
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
