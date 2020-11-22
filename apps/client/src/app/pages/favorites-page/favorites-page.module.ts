import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FavoritesComponent } from './favorites/favorites.component';
import { RouterModule, Routes } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { CoreModule } from '../../core/core.module';
import { ListModule } from '../../modules/list/list.module';
import { WorkshopModule } from '../../modules/workshop/workshop.module';
import { RotationsModule } from '../../modules/rotations/rotations.module';
import { SimulatorModule } from '../simulator/simulator.module';
import { RotationFoldersModule } from '../../modules/rotation-folders/rotation-folders.module';
import { MaintenanceGuard } from '../maintenance/maintenance.guard';
import { VersionLockGuard } from '../version-lock/version-lock.guard';
import { AntdSharedModule } from '../../core/antd-shared.module';

const routes: Routes = [
  {
    path: '',
    component: FavoritesComponent,
    canActivate: [MaintenanceGuard, VersionLockGuard]
  }
];

@NgModule({
  imports: [
    CommonModule,
    CoreModule,
    TranslateModule,
    ListModule,
    WorkshopModule,
    RotationsModule,
    RotationFoldersModule,
    SimulatorModule,

    AntdSharedModule,

    RouterModule.forChild(routes)
  ],
  declarations: [FavoritesComponent]
})
export class FavoritesPageModule {
}
