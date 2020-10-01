import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import * as fromCommissions from './+state/commissions.reducer';
import { CommissionsEffects } from './+state/commissions.effects';
import { CommissionsFacade } from './+state/commissions.facade';
import { NzModalModule } from 'ng-zorro-antd';
import { NameQuestionPopupModule } from '../name-question-popup/name-question-popup.module';
import { TranslateModule } from '@ngx-translate/core';
import { AngularFireMessagingModule } from '@angular/fire/messaging';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    StoreModule.forFeature(
      fromCommissions.COMMISSIONS_FEATURE_KEY,
      fromCommissions.reducer
    ),
    EffectsModule.forFeature([CommissionsEffects]),
    TranslateModule,
    AngularFireMessagingModule,

    NzModalModule,
    NameQuestionPopupModule
  ],
  providers: [CommissionsFacade],
})
export class CommissionBoardModule {}
