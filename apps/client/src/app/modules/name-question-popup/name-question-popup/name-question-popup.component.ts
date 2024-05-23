import { Component, inject, Input, OnInit } from '@angular/core';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { NzWaveModule } from 'ng-zorro-antd/core/wave';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';

import { NzInputModule } from 'ng-zorro-antd/input';
import { FlexModule } from '@angular/flex-layout/flex';
import { DialogComponent } from '../../../core/dialog.component';
import { SettingsService } from '../../settings/settings.service';

@Component({
  selector: 'app-name-question-popup',
  templateUrl: './name-question-popup.component.html',
  styleUrls: ['./name-question-popup.component.less'],
  standalone: true,
  imports: [FormsModule, FlexModule, ReactiveFormsModule, NzInputModule, NzCheckboxModule, NzToolTipModule, NzButtonModule, NzWaveModule, TranslateModule]
})
export class NameQuestionPopupComponent extends DialogComponent implements OnInit {

  #settings = inject(SettingsService);

  @Input()
  baseName = '';

  showEphemeralCheckbox = false;

  showOfflineCheckbox = false;

  @Input()
  placeholder = 'Please_enter_a_name';

  public type = 'text';

  public control: UntypedFormGroup;

  constructor(private modalRef: NzModalRef, private fb: UntypedFormBuilder) {
    super();
  }

  public submit(): void {
    if (this.showEphemeralCheckbox || this.showOfflineCheckbox) {
      this.modalRef.close(this.control.value);
    } else {
      this.modalRef.close(this.control.value.name);
    }
  }

  ngOnInit(): void {
    this.patchData();
    this.control = this.fb.group({
      name: [this.baseName, Validators.required],
      ephemeral: [false],
      offline: [this.#settings.offlineListByDefault]
    });
  }

}
