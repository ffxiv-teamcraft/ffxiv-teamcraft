import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TeamsComponent } from './teams/teams.component';
import { RouterModule, Routes } from '@angular/router';
import { TeamsModule } from '../../modules/teams/teams.module';
import { TranslateModule } from '@ngx-translate/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FullpageMessageModule } from '../../modules/fullpage-message/fullpage-message.module';
import { NameQuestionPopupModule } from '../../modules/name-question-popup/name-question-popup.module';
import { PageLoaderModule } from '../../modules/page-loader/page-loader.module';
import { UserAvatarModule } from '../../modules/user-avatar/user-avatar.module';
import { PipesModule } from '../../pipes/pipes.module';
import { FormsModule } from '@angular/forms';
import { TeamInviteComponent } from './team-invite/team-invite.component';

import { MaintenanceGuard } from '../maintenance/maintenance.guard';
import { VersionLockGuard } from '../version-lock/version-lock.guard';
import { AntdSharedModule } from '../../core/antd-shared.module';
import { CoreModule } from '../../core/core.module';

const routes: Routes = [
  {
    path: '',
    component: TeamsComponent,
    canActivate: [MaintenanceGuard, VersionLockGuard]
  },
  {
    path: 'invite/:inviteId',
    component: TeamInviteComponent,
    canActivate: [MaintenanceGuard, VersionLockGuard]
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    CoreModule,

    FlexLayoutModule,
    TranslateModule,
    TeamsModule,
    UserAvatarModule,
    PipesModule,
    AntdSharedModule,
    FullpageMessageModule,
    PageLoaderModule,
    NameQuestionPopupModule,

    RouterModule.forChild(routes)
  ],
  declarations: [TeamsComponent, TeamInviteComponent]
})
export class TeamsPagesModule {
}
