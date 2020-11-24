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
import { AngularFireMessagingModule } from '@angular/fire/messaging';
import { CommissionPanelComponent } from './commission-panel/commission-panel.component';
import { NzCollapseModule } from 'ng-zorro-antd/collapse';
import { RouterModule } from '@angular/router';
import { UserAvatarModule } from '../user-avatar/user-avatar.module';
import { NzTagModule } from 'ng-zorro-antd/tag';

@NgModule({
  declarations: [CommissionPanelComponent],
  exports: [CommissionPanelComponent],
  imports: [
    CommonModule,
    RouterModule,
    StoreModule.forFeature(
      fromCommissions.COMMISSIONS_FEATURE_KEY,
      fromCommissions.reducer
    ),
    EffectsModule.forFeature([CommissionsEffects]),
    TranslateModule,
    AngularFireMessagingModule,

    NzModalModule,
    NameQuestionPopupModule,
    NzCollapseModule,
    UserAvatarModule,
    NzTagModule
  ],
  providers: [CommissionsFacade]
})
export class CommissionBoardModule {
}
