import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Commission } from '../model/commission';
import { UntypedFormBuilder, UntypedFormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { TranslateModule } from '@ngx-translate/core';
import { NzWaveModule } from 'ng-zorro-antd/core/wave';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { FlexModule } from '@angular/flex-layout/flex';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzRateModule } from 'ng-zorro-antd/rate';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzFormModule } from 'ng-zorro-antd/form';

@Component({
    selector: 'app-commission-rating-popup',
    templateUrl: './commission-rating-popup.component.html',
    styleUrls: ['./commission-rating-popup.component.less'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [FormsModule, NzFormModule, ReactiveFormsModule, NzGridModule, NzRateModule, NzInputModule, FlexModule, NzButtonModule, NzWaveModule, TranslateModule]
})
export class CommissionRatingPopupComponent implements OnInit {

  commission: Commission;

  authorId: string;

  form: UntypedFormGroup;

  constructor(private fb: UntypedFormBuilder, private modalRef: NzModalRef) {
  }

  submit(): void {
    if (this.form.valid) {
      this.modalRef.close(this.form.value);
    }
  }

  ngOnInit(): void {
    this.form = this.fb.group({
      rating: [5, Validators.required],
      comment: ['', Validators.maxLength(240)]
    });
  }

}
