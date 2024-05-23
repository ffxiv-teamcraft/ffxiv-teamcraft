import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { UntypedFormBuilder, UntypedFormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { NzWaveModule } from 'ng-zorro-antd/core/wave';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { FlexModule } from '@angular/flex-layout/flex';

import { NzInputModule } from 'ng-zorro-antd/input';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzFormModule } from 'ng-zorro-antd/form';
import { DialogComponent } from '../../../core/dialog.component';

@Component({
    selector: 'app-apply-popup',
    templateUrl: './apply-popup.component.html',
    styleUrls: ['./apply-popup.component.less'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [FormsModule, NzFormModule, ReactiveFormsModule, NzGridModule, NzInputModule, FlexModule, NzButtonModule, NzWaveModule, TranslateModule]
})
export class ApplyPopupComponent extends DialogComponent implements OnInit {

  price: number;

  form: UntypedFormGroup;

  constructor(private fb: UntypedFormBuilder, private modalRef: NzModalRef) {
    super();
  }

  ngOnInit(): void {
    this.patchData();
    this.form = this.fb.group({
      price: [this.price, Validators.required],
      contactInformations: [localStorage.getItem('commission:contact') || '', Validators.required]
    });
  }

  submit(): void {
    if (this.form.valid) {
      localStorage.setItem('commission:contact', this.form.value.contactInformations);
      this.modalRef.close(this.form.value);
    }
  }

  close(): void {
    this.modalRef.close();
  }

}
