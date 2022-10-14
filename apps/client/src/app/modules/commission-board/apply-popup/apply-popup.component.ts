import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-apply-popup',
  templateUrl: './apply-popup.component.html',
  styleUrls: ['./apply-popup.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ApplyPopupComponent implements OnInit {

  price: number;

  form: UntypedFormGroup;

  constructor(private fb: UntypedFormBuilder, private modalRef: NzModalRef) {
  }

  ngOnInit(): void {
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
