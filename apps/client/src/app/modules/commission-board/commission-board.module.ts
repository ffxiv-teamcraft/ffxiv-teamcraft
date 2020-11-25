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

@NgModule({
  declarations: [CommissionPanelComponent, CommissionEditionPopupComponent],
  exports: [CommissionPanelComponent],
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
    AngularFireMessagingModule,

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
  ],
  providers: [CommissionsFacade]
})
export class CommissionBoardModule {
}
