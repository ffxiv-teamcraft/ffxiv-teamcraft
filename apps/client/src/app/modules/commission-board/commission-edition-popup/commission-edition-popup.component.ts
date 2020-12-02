import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { CommissionTag } from '../model/commission-tag';
import { Commission } from '../model/commission';

@Component({
  selector: 'app-commission-edition-popup',
  templateUrl: './commission-edition-popup.component.html',
  styleUrls: ['./commission-edition-popup.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CommissionEditionPopupComponent implements OnInit {

  commission: Partial<Commission>;

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
      name: [this.commission.name, Validators.required],
      contactInformations: [this.commission.contactInformations || localStorage.getItem('commission:contact') || '', Validators.required],
      price: [this.commission.price || 0],
      includesMaterials: [this.commission.includesMaterials || false],
      tags: [this.commission.tags || []]
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
