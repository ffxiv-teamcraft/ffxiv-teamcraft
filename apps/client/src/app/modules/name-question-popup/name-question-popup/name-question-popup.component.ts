import { Component, Input, OnInit } from '@angular/core';
import { NzModalRef } from 'ng-zorro-antd';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-name-question-popup',
  templateUrl: './name-question-popup.component.html',
  styleUrls: ['./name-question-popup.component.less']
})
export class NameQuestionPopupComponent implements OnInit {

  @Input()
  baseName = '';

  @Input()
  showEphemeralCheckbox = false;

  public control: FormGroup;

  constructor(private modalRef: NzModalRef, private fb: FormBuilder) {
  }

  public submit(): void {
    if (this.showEphemeralCheckbox) {
      this.modalRef.close(this.control.value);
    } else {
      this.modalRef.close(this.control.value.name);
    }
  }

  ngOnInit(): void {
    this.control = this.fb.group({
      name: [this.baseName, Validators.required],
      ephemeral: [false]
    });
  }

}
