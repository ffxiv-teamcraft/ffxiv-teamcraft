import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import * as fromCommissions from './+state/commissions.reducer';
import { CommissionsEffects } from './+state/commissions.effects';
import { CommissionsFacade } from './+state/commissions.facade';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NameQuestionPopupModule } from '../name-question-popup/name-question-popup.module';
import { TranslateModule } from '@ngx-translate/core';
import { CommissionPanelComponent } from './commission-panel/commission-panel.component';
import { NzCollapseModule } from 'ng-zorro-antd/collapse';
import { RouterModule } from '@angular/router';
import { UserAvatarModule } from '../user-avatar/user-avatar.module';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { LazyScrollModule } from '../lazy-scroll/lazy-scroll.module';
import { ItemIconModule } from '../item-icon/item-icon.module';
import { PipesModule } from '../../pipes/pipes.module';
import { CoreModule } from '../../core/core.module';
import { CommissionEditionPopupComponent } from './commission-edition-popup/commission-edition-popup.component';
import { NzFormModule } from 'ng-zorro-antd/form';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { FlexLayoutModule } from '@angular/flex-layout';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { ApplyPopupComponent } from './apply-popup/apply-popup.component';
import { CommissionRatingPopupComponent } from './commission-rating-popup/commission-rating-popup.component';
import { NzRateModule } from 'ng-zorro-antd/rate';
import { UserRatingDisplayComponent } from './user-rating-display/user-rating-display.component';
import { UserRatingDetailsPopupComponent } from './user-rating-details-popup/user-rating-details-popup.component';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { FiredFeedbackPopupComponent } from './fired-feedback-popup/fired-feedback-popup.component';
import { ResignedFeedbackPopupComponent } from './resigned-feedback-popup/resigned-feedback-popup.component';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { NzAlertModule } from 'ng-zorro-antd/alert';

@NgModule({
  declarations: [CommissionPanelComponent, CommissionEditionPopupComponent, ApplyPopupComponent, CommissionRatingPopupComponent, UserRatingDisplayComponent, UserRatingDetailsPopupComponent, FiredFeedbackPopupComponent, ResignedFeedbackPopupComponent],
  exports: [CommissionPanelComponent, UserRatingDisplayComponent],
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    FormsModule,
    FlexLayoutModule,
    StoreModule.forFeature(
      fromCommissions.COMMISSIONS_FEATURE_KEY,
      fromCommissions.reducer
    ),
    EffectsModule.forFeature([CommissionsEffects]),
    TranslateModule,

    NzModalModule,
    NzCollapseModule,
    NzTagModule,
    NzFormModule,
    NzInputModule,
    NzCheckboxModule,
    NzSelectModule,

    NameQuestionPopupModule,
    UserAvatarModule,
    LazyScrollModule,
    ItemIconModule,
    PipesModule,
    CoreModule,
    NzPopconfirmModule,
    NzDropDownModule,
    NzRateModule,
    NzDividerModule,
    NzEmptyModule,
    NzRadioModule,
    NzInputNumberModule,
    NzBadgeModule,
    NzAlertModule
  ],
  providers: [CommissionsFacade]
})
export class CommissionBoardModule {
}
