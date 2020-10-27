import { Component, Input, OnInit } from '@angular/core';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-text-question-popup',
  templateUrl: './text-question-popup.component.html',
  styleUrls: ['./text-question-popup.component.less']
})
export class TextQuestionPopupComponent implements OnInit {

  @Input()
  baseText = '';

  @Input()
  placeholder = '';

  public control: FormControl;

  constructor(private modalRef: NzModalRef) {
  }

  public submit(): void {
    this.modalRef.close(this.control.value);
  }

  ngOnInit(): void {
    this.control = new FormControl(this.baseText);
  }

}
