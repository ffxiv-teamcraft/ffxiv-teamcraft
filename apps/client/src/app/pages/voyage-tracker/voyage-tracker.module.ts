import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VoyageTrackerComponent } from './voyage-tracker/voyage-tracker.component';
import { RouterModule, Routes } from '@angular/router';
import { MaintenanceGuard } from '../maintenance/maintenance.guard';
import { VersionLockGuard } from '../version-lock/version-lock.guard';
import { FlexLayoutModule } from '@angular/flex-layout';
import { AntdSharedModule } from '../../core/antd-shared.module';
import { PipesModule } from '../../pipes/pipes.module';
import { CoreModule } from '../../core/core.module';
import { FreecompanyWorkshopsModule } from '../../modules/freecompany-workshops/freecompany-workshops.module';
import { PageLoaderModule } from '../../modules/page-loader/page-loader.module';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';

const routes: Routes = [
  {
    path: '',
    component: VoyageTrackerComponent,
    canActivate: [MaintenanceGuard, VersionLockGuard]
  }
];

@NgModule({
  declarations: [VoyageTrackerComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    AntdSharedModule,

    CoreModule,
    PipesModule,

    FreecompanyWorkshopsModule,

    RouterModule.forChild(routes),
    PageLoaderModule,
    NzBreadCrumbModule
  ]
})
export class VoyageTrackerModule {
}
