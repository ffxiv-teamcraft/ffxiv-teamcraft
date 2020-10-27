import { Component, Input } from '@angular/core';
import { NzModalRef } from 'ng-zorro-antd/modal';

@Component({
  selector: 'app-name-question-popup',
  templateUrl: './number-question-popup.component.html',
  styleUrls: ['./number-question-popup.component.less']
})
export class NumberQuestionPopupComponent {

  @Input()
  value: number;

  constructor(private modalRef: NzModalRef) {
  }

  public submit(): void {
    this.modalRef.close(this.value);
  }

}
