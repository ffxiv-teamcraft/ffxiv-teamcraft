import { Component } from '@angular/core';
import { NzModalRef } from 'ng-zorro-antd';
import { FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-name-question-popup',
  templateUrl: './name-question-popup.component.html',
  styleUrls: ['./name-question-popup.component.less']
})
export class NameQuestionPopupComponent {

  public control = new FormControl('', Validators.required);

  constructor(private modalRef: NzModalRef) {
  }

  public submit(): void {
    this.modalRef.close(this.control.value);
  }

}
