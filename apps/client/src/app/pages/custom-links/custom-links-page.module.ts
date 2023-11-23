import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CustomLinksComponent } from './custom-links/custom-links.component';
import { RouterModule, Routes } from '@angular/router';
import { CoreModule } from '../../core/core.module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { DatabaseModule } from '../../core/database/database.module';
import { ListModule } from '../../modules/list/list.module';
import { RotationsModule } from '../../modules/rotations/rotations.module';
import { RotationFoldersModule } from '../../modules/rotation-folders/rotation-folders.module';
import { WorkshopModule } from '../../modules/workshop/workshop.module';
import { FullpageMessageModule } from '../../modules/fullpage-message/fullpage-message.module';


import { MaintenanceGuard } from '../maintenance/maintenance.guard';
import { VersionLockGuard } from '../version-lock/version-lock.guard';


const routes: Routes = [{
  path: '',
  component: CustomLinksComponent,
  canActivate: [MaintenanceGuard, VersionLockGuard]
}];

@NgModule({
    imports: [
    CommonModule,
    CoreModule,
    FlexLayoutModule,
    DatabaseModule,
    FullpageMessageModule,
    ListModule,
    RotationsModule,
    RotationFoldersModule,
    WorkshopModule,
    RouterModule.forChild(routes),
    CustomLinksComponent
]
})
export class CustomLinksPageModule {
}
