import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommissionProfile } from '../../../model/user/commission-profile';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { TranslateService } from '@ngx-translate/core';
import { SettingsService } from '../../settings/settings.service';

@Component({
  selector: 'app-user-rating-details-popup',
  templateUrl: './user-rating-details-popup.component.html',
  styleUrls: ['./user-rating-details-popup.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserRatingDetailsPopupComponent {
  profile: CommissionProfile;

  constructor(private modalRef: NzModalRef, public translate: TranslateService, public settings: SettingsService) {
  }

  close(): void {
    if (this.modalRef) {
      this.modalRef.close();
    }
  }
}
