import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { CommissionProfileService } from '../../../core/database/commission-profile.service';
import { Observable } from 'rxjs';
import { CommissionProfile } from '../../../model/user/commission-profile';
import { map } from 'rxjs/operators';
import { NzModalService } from 'ng-zorro-antd/modal';
import { UserRatingDetailsPopupComponent } from '../user-rating-details-popup/user-rating-details-popup.component';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { NzWaveModule } from 'ng-zorro-antd/core/wave';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { FormsModule } from '@angular/forms';
import { NzRateModule } from 'ng-zorro-antd/rate';
import { FlexModule } from '@angular/flex-layout/flex';
import { NgIf, AsyncPipe } from '@angular/common';

@Component({
    selector: 'app-user-rating-display',
    templateUrl: './user-rating-display.component.html',
    styleUrls: ['./user-rating-display.component.less'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [NgIf, FlexModule, NzRateModule, FormsModule, NzToolTipModule, NzButtonModule, NzIconModule, NzWaveModule, AsyncPipe, TranslateModule]
})
export class UserRatingDisplayComponent implements OnInit {

  @Input()
  userId: string;

  commissionProfile$: Observable<{ profile: CommissionProfile, avgRating: number }>;

  constructor(private commissionProfileService: CommissionProfileService, private modalService: NzModalService,
              private translate: TranslateService) {
  }

  ngOnInit(): void {
    this.commissionProfile$ = this.commissionProfileService.get(this.userId)
      .pipe(
        map(profile => {
          return {
            profile,
            avgRating: profile.ratings.length === 0 ? -1 : profile.ratings.reduce((acc, rating) => acc + rating.rating, 0) / profile.ratings.length
          };
        })
      );
  }

  openDetails(profile: CommissionProfile): void {
    this.modalService.create({
      nzTitle: this.translate.instant('COMMISSIONS.PROFILE.Details'),
      nzContent: UserRatingDetailsPopupComponent,
      nzComponentParams: {
        profile
      },
      nzFooter: null
    });
  }

}
