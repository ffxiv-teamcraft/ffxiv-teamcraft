import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { CommissionTag } from '../model/commission-tag';
import { Commission } from '../model/commission';
import { LinkToolsService } from '../../../core/tools/link-tools.service';
import { TranslateModule } from '@ngx-translate/core';
import { ClipboardDirective } from '../../../core/clipboard.directive';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzWaveModule } from 'ng-zorro-antd/core/wave';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { FlexModule } from '@angular/flex-layout/flex';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzAlertModule } from 'ng-zorro-antd/alert';

import { DialogComponent } from '../../../core/dialog.component';

@Component({
    selector: 'app-commission-edition-popup',
    templateUrl: './commission-edition-popup.component.html',
    styleUrls: ['./commission-edition-popup.component.less'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [NzAlertModule, FormsModule, NzFormModule, ReactiveFormsModule, NzGridModule, NzInputModule, NzSelectModule, NzInputNumberModule, NzCheckboxModule, FlexModule, NzButtonModule, NzWaveModule, NzToolTipModule, ClipboardDirective, TranslateModule]
})
export class CommissionEditionPopupComponent extends DialogComponent implements OnInit {

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
    super();
  }

  ngOnInit(): void {
    this.patchData();
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
