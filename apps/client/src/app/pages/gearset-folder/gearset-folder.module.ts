import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GearsetFolderComponent } from './gearset-folder/gearset-folder.component';
import { RouterModule, Routes } from '@angular/router';
import { MaintenanceGuard } from '../maintenance/maintenance.guard';
import { VersionLockGuard } from '../version-lock/version-lock.guard';
import { TranslateModule } from '@ngx-translate/core';
import { CoreModule } from '../../core/core.module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ProgressPopupModule } from '../../modules/progress-popup/progress-popup.module';
import { FullpageMessageModule } from '../../modules/fullpage-message/fullpage-message.module';
import { PipesModule } from '../../pipes/pipes.module';
import { PageLoaderModule } from '../../modules/page-loader/page-loader.module';
import { FoldersModule } from '../../modules/folders/folders.module';
import { GearsetsModule } from '../../modules/gearsets/gearsets.module';


const routes: Routes = [
  {
    path: ':folderId',
    component: GearsetFolderComponent,
    canActivate: [MaintenanceGuard, VersionLockGuard]
  }
];

@NgModule({
  declarations: [GearsetFolderComponent],
  imports: [
    CommonModule,
    TranslateModule,
    CoreModule,
    FlexLayoutModule,
    ProgressPopupModule,
    FullpageMessageModule,

    PipesModule,
    PageLoaderModule,
    FoldersModule,
    GearsetsModule,

    RouterModule.forChild(routes)
  ]
})
export class GearsetFolderModule {
}
