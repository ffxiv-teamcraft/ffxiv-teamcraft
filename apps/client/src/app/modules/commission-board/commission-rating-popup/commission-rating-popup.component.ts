import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Commission } from '../model/commission';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { NzModalRef } from 'ng-zorro-antd/modal';

@Component({
  selector: 'app-commission-rating-popup',
  templateUrl: './commission-rating-popup.component.html',
  styleUrls: ['./commission-rating-popup.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
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
