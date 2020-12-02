import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { CommissionProfileService } from '../../../core/database/commission-profile.service';
import { Observable } from 'rxjs';
import { CommissionProfile } from '../../../model/user/commission-profile';
import { map } from 'rxjs/operators';
import { NzModalService } from 'ng-zorro-antd/modal';
import { UserRatingDetailsPopupComponent } from '../user-rating-details-popup/user-rating-details-popup.component';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-user-rating-display',
  templateUrl: './user-rating-display.component.html',
  styleUrls: ['./user-rating-display.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
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
