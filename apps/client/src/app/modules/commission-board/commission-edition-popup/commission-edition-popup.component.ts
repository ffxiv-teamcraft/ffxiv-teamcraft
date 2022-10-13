import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { CommissionTag } from '../model/commission-tag';
import { Commission } from '../model/commission';
import { LinkToolsService } from '../../../core/tools/link-tools.service';

@Component({
  selector: 'app-commission-edition-popup',
  templateUrl: './commission-edition-popup.component.html',
  styleUrls: ['./commission-edition-popup.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CommissionEditionPopupComponent implements OnInit {

  commission: Partial<Commission>;

  form: UntypedFormGroup;

  commissionTags = Object.keys(CommissionTag).map(key => {
    return {
      value: key,
      label: `COMMISSIONS.TAGS.${key}`
    };
  });

  showWarning = localStorage.getItem('cw:s') === null;

  constructor(private fb: UntypedFormBuilder, private modalRef: NzModalRef, private linkTools: LinkToolsService) {
  }

  ngOnInit(): void {
    this.form = this.fb.group({
      name: [this.commission.name, Validators.required],
      description: [this.commission.description || '', Validators.maxLength(1000)],
      contactInformations: [this.commission.contactInformations || localStorage.getItem('commission:contact') || '', Validators.required],
      price: [this.commission.price || 0],
      includesMaterials: [this.commission.includesMaterials || false],
      requiresOnlyMaterials: [this.commission.requiresOnlyMaterials || false],
      tags: [this.commission.tags || []]
    });
  }

  submit(): void {
    if (this.form.valid) {
      localStorage.setItem('commission:contact', this.form.value.contactInformations);
      this.modalRef.close(this.form.value);
    }
  }

  getCreationLink = () => {
    const template = this.form.value;
    return this.linkTools.getLink(`/commission/import/${btoa(
      unescape(
        encodeURIComponent([
          template.name,
          template.price.toString(),
          template.tags.join(','),
          this.commission.items.map(i => `${i.id},,${i.amount}`).join(';'),
          template.description || ''
        ].join('|'))
      )
    )}`);
  };

  hideWarning(): void {
    localStorage.setItem('cw:s', '1');
    this.showWarning = false;
  }

  close(): void {
    this.modalRef.close();
  }

}
