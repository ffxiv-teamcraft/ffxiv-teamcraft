import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { PublicProfileComponent } from './public-profile/public-profile.component';

import { ListModule } from '../../modules/list/list.module';
import { CoreModule } from '../../core/core.module';
import { PipesModule } from '../../pipes/pipes.module';
import { TranslateModule } from '@ngx-translate/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FullpageMessageModule } from '../../modules/fullpage-message/fullpage-message.module';
import { ProfileEditorComponent } from './profile-editor/profile-editor.component';
import { FormsModule } from '@angular/forms';
import { MasterbooksPopupComponent } from './profile-editor/masterbooks-popup/masterbooks-popup.component';
import { StatsPopupComponent } from './profile-editor/stats-popup/stats-popup.component';
import { UserPickerModule } from '../../modules/user-picker/user-picker.module';
import { UserAvatarModule } from '../../modules/user-avatar/user-avatar.module';
import { VerificationPopupComponent } from './profile-editor/verification-popup/verification-popup.component';
import { MaintenanceGuard } from '../maintenance/maintenance.guard';
import { VersionLockGuard } from '../version-lock/version-lock.guard';
import { SimulatorModule } from '../simulator/simulator.module';
import { AutofillStatsPopupComponent } from './profile-editor/autofill-stats-popup/autofill-stats-popup.component';
import { ItemIconModule } from '../../modules/item-icon/item-icon.module';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { AntdSharedModule } from '../../core/antd-shared.module';
import { NzSkeletonModule } from 'ng-zorro-antd/skeleton';
import { CommissionBoardModule } from '../../modules/commission-board/commission-board.module';
import { NzSliderModule } from 'ng-zorro-antd/slider';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';

const routes: Routes = [
  {
    path: '',
    component: ProfileEditorComponent,
    canActivate: [MaintenanceGuard, VersionLockGuard]
  },
  {
    path: ':userId',
    component: PublicProfileComponent,
    canActivate: [MaintenanceGuard, VersionLockGuard]
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    AntdSharedModule,

    PipesModule,
    CoreModule,
    ListModule,
    FlexLayoutModule,
    FullpageMessageModule,
    UserPickerModule,
    UserAvatarModule,

    RouterModule.forChild(routes),
    SimulatorModule,
    ItemIconModule,
    ScrollingModule,
    CommissionBoardModule,
    NzSkeletonModule,
    NzSliderModule,
    NzAvatarModule
  ],
  declarations: [PublicProfileComponent, ProfileEditorComponent, MasterbooksPopupComponent, StatsPopupComponent, VerificationPopupComponent, AutofillStatsPopupComponent]
})
export class ProfileModule {
}
