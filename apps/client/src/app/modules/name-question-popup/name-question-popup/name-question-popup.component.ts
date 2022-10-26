import { Component, Input, OnInit } from '@angular/core';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';

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

  @Input()
  showOfflineCheckbox = false;

  @Input()
  placeholder = 'Please_enter_a_name';

  public type = 'text';

  public control: UntypedFormGroup;

  constructor(private modalRef: NzModalRef, private fb: UntypedFormBuilder) {
  }

  public submit(): void {
    if (this.showEphemeralCheckbox || this.showOfflineCheckbox) {
      this.modalRef.close(this.control.value);
    } else {
      this.modalRef.close(this.control.value.name);
    }
  }

  ngOnInit(): void {
    this.control = this.fb.group({
      name: [this.baseName, Validators.required],
      ephemeral: [false],
      offline: [false]
    });
  }

}
