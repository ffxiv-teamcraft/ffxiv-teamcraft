import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CraftingReplayComponent } from './crafting-replay/crafting-replay.component';
import { PageLoaderModule } from '../../modules/page-loader/page-loader.module';
import { FullpageMessageModule } from '../../modules/fullpage-message/fullpage-message.module';
import { TranslateModule } from '@ngx-translate/core';
import { CraftingReplayModule } from '../../modules/crafting-replay/crafting-replay.module';
import { MaintenanceGuard } from '../maintenance/maintenance.guard';
import { VersionLockGuard } from '../version-lock/version-lock.guard';
import { RouterModule, Routes } from '@angular/router';
import { PipesModule } from '../../pipes/pipes.module';
import { CoreModule } from '../../core/core.module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { UserAvatarModule } from '../../modules/user-avatar/user-avatar.module';

const routes: Routes = [
  {
    path: ':replayId',
    component: CraftingReplayComponent,
    canActivate: [MaintenanceGuard, VersionLockGuard]
  }
];

@NgModule({
  declarations: [CraftingReplayComponent],
  imports: [
    CommonModule,
    PageLoaderModule,
    FullpageMessageModule,
    TranslateModule,
    CraftingReplayModule,
    FlexLayoutModule,

    RouterModule.forChild(routes),
    PipesModule,
    CoreModule,
    UserAvatarModule
  ]
})
export class CraftingReplayPageModule {
}
