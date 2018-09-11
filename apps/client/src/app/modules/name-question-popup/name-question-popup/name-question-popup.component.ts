import { Component, Input, OnInit } from '@angular/core';
import { NzModalRef } from 'ng-zorro-antd';
import { FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-name-question-popup',
  templateUrl: './name-question-popup.component.html',
  styleUrls: ['./name-question-popup.component.less']
})
export class NameQuestionPopupComponent implements OnInit {

  @Input()
  baseName = '';

  public control: FormControl;

  constructor(private modalRef: NzModalRef) {
  }

  public submit(): void {
    this.modalRef.close(this.control.value);
  }

  ngOnInit(): void {
    this.control = new FormControl(this.baseName, Validators.required);
  }

}
