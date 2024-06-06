import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommissionProfile } from '../../../model/user/commission-profile';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { SettingsService } from '../../settings/settings.service';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { RouterLink } from '@angular/router';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { FormsModule } from '@angular/forms';
import { NzRateModule } from 'ng-zorro-antd/rate';
import { DatePipe } from '@angular/common';
import { FlexModule } from '@angular/flex-layout/flex';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { DialogComponent } from '../../../core/dialog.component';

@Component({
  selector: 'app-user-rating-details-popup',
  templateUrl: './user-rating-details-popup.component.html',
  styleUrls: ['./user-rating-details-popup.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [NzDividerModule, FlexModule, NzRateModule, FormsModule, NzButtonModule, RouterLink, NzEmptyModule, NzIconModule, DatePipe, TranslateModule]
})
export class UserRatingDetailsPopupComponent extends DialogComponent {
  profile: CommissionProfile;

  constructor(private modalRef: NzModalRef, public translate: TranslateService, public settings: SettingsService) {
    super();
    this.patchData();
  }

  close(): void {
    if (this.modalRef) {
      this.modalRef.close();
    }
  }
}
