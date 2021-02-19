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
import { FreeCompanyWorkshopsModule } from '../../modules/free-company-workshops/free-company-workshops.module';
import { PageLoaderModule } from '../../modules/page-loader/page-loader.module';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzPopoverModule } from 'ng-zorro-antd/popover';
import { VesselRowComponent } from './voyage-tracker/vessel-row/vessel-row.component';
import { VesselListComponent } from './voyage-tracker/vessel-list/vessel-list.component';
import { VesselBuildColumnComponent } from './voyage-tracker/vessel-row/vessel-build-column/vessel-build-column.component';
import { VesselVoyageColumnComponent } from './voyage-tracker/vessel-row/vessel-voyage-column/vessel-voyage-column.component';
import { FormsModule } from '@angular/forms';

const routes: Routes = [
  {
    path: '',
    component: VoyageTrackerComponent,
    canActivate: [MaintenanceGuard, VersionLockGuard]
  }
];

@NgModule({
  declarations: [
    VoyageTrackerComponent,
    VesselRowComponent,
    VesselListComponent,
    VesselBuildColumnComponent,
    VesselVoyageColumnComponent],
  imports: [
    CommonModule,
    FormsModule,
    FlexLayoutModule,
    AntdSharedModule,

    CoreModule,
    PipesModule,

    FreeCompanyWorkshopsModule,

    RouterModule.forChild(routes),
    PageLoaderModule,
    NzBreadCrumbModule,
    NzPopoverModule
  ]
})
export class VoyageTrackerModule {
}
