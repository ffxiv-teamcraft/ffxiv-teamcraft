import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-apply-popup',
  templateUrl: './apply-popup.component.html',
  styleUrls: ['./apply-popup.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ApplyPopupComponent implements OnInit {

  price: number;

  form: FormGroup;

  constructor(private fb: FormBuilder, private modalRef: NzModalRef) {
  }

  ngOnInit(): void {
    this.form = this.fb.group({
      price: [this.price, Validators.required]
    });
  }

  submit(): void {
    if (this.form.valid) {
      this.modalRef.close(this.form.value);
    }
  }

  close(): void {
    this.modalRef.close();
  }

}
