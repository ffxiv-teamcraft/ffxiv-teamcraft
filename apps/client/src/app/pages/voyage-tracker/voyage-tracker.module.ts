import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VoyageTrackerComponent } from './voyage-tracker/voyage-tracker.component';
import { RouterModule, Routes } from '@angular/router';
import { MaintenanceGuard } from '../maintenance/maintenance.guard';
import { VersionLockGuard } from '../version-lock/version-lock.guard';
import { FlexLayoutModule } from '@angular/flex-layout';

import { PipesModule } from '../../pipes/pipes.module';
import { CoreModule } from '../../core/core.module';
import { FreeCompanyWorkshopsModule } from '../../modules/free-company-workshops/free-company-workshops.module';

import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzPopoverModule } from 'ng-zorro-antd/popover';
import { VesselRowComponent } from './voyage-tracker/vessel-row/vessel-row.component';
import { VesselListComponent } from './voyage-tracker/vessel-list/vessel-list.component';
import { VesselBuildColumnComponent } from './voyage-tracker/vessel-row/vessel-build-column/vessel-build-column.component';
import { VesselRankColumnComponent } from './voyage-tracker/vessel-row/vessel-rank-column/vessel-rank-column.component';
import { VesselVoyageColumnComponent } from './voyage-tracker/vessel-row/vessel-voyage-column/vessel-voyage-column.component';
import { FormsModule } from '@angular/forms';
import { FullpageMessageModule } from '../../modules/fullpage-message/fullpage-message.module';
import { NzPipesModule } from 'ng-zorro-antd/pipes';

const routes: Routes = [
  {
    path: '',
    component: VoyageTrackerComponent,
    canActivate: [MaintenanceGuard, VersionLockGuard]
  }
];

@NgModule({
    imports: [
    CommonModule,
    FormsModule,
    FlexLayoutModule,
    CoreModule,
    PipesModule,
    FreeCompanyWorkshopsModule,
    RouterModule.forChild(routes),
    NzBreadCrumbModule,
    NzPopoverModule,
    FullpageMessageModule,
    NzPipesModule,
    VoyageTrackerComponent,
    VesselRowComponent,
    VesselListComponent,
    VesselBuildColumnComponent,
    VesselRankColumnComponent,
    VesselVoyageColumnComponent
]
})
export class VoyageTrackerModule {
}
