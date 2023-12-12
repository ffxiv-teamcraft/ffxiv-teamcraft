import { Component, Input, OnInit } from '@angular/core';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { UntypedFormBuilder, UntypedFormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { NzWaveModule } from 'ng-zorro-antd/core/wave';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NgIf } from '@angular/common';
import { NzInputModule } from 'ng-zorro-antd/input';
import { FlexModule } from '@angular/flex-layout/flex';

@Component({
    selector: 'app-name-question-popup',
    templateUrl: './name-question-popup.component.html',
    styleUrls: ['./name-question-popup.component.less'],
    standalone: true,
    imports: [FormsModule, FlexModule, ReactiveFormsModule, NzInputModule, NgIf, NzCheckboxModule, NzToolTipModule, NzButtonModule, NzWaveModule, TranslateModule]
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
