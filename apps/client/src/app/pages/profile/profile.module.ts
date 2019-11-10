import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { PublicProfileComponent } from './public-profile/public-profile.component';
import { NgZorroAntdModule } from 'ng-zorro-antd';
import { ClipboardModule } from 'ngx-clipboard';
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
    NgZorroAntdModule,
    ClipboardModule,
    PipesModule,
    CoreModule,
    ListModule,
    FlexLayoutModule,
    FullpageMessageModule,
    UserPickerModule,
    UserAvatarModule,

    RouterModule.forChild(routes),
    SimulatorModule
  ],
  declarations: [PublicProfileComponent, ProfileEditorComponent, MasterbooksPopupComponent, StatsPopupComponent, VerificationPopupComponent, AutofillStatsPopupComponent],
  entryComponents: [MasterbooksPopupComponent, StatsPopupComponent, VerificationPopupComponent, AutofillStatsPopupComponent]
})
export class ProfileModule {
}
