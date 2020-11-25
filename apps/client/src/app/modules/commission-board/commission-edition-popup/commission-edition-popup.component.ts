import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { CommissionTag } from '../model/commission-tag';

@Component({
  selector: 'app-commission-edition-popup',
  templateUrl: './commission-edition-popup.component.html',
  styleUrls: ['./commission-edition-popup.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CommissionEditionPopupComponent implements OnInit {

  name: string;

  form: FormGroup;

  commissionTags = Object.keys(CommissionTag).map(key => {
    return {
      value: key,
      label: `COMMISSIONS.TAGS.${key}`
    };
  });

  constructor(private fb: FormBuilder, private modalRef: NzModalRef) {
  }

  ngOnInit(): void {
    this.form = this.fb.group({
      name: [this.name, Validators.required],
      contactInformations: [localStorage.getItem('commission:contact') || '', Validators.required],
      price: [0],
      includesMaterials: [false],
      tags: [[]]
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
