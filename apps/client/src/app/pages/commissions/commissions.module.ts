import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CommissionBoardComponent } from './commission-board/commission-board.component';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { RouterModule, Routes } from '@angular/router';
import { MaintenanceGuard } from '../maintenance/maintenance.guard';
import { VersionLockGuard } from '../version-lock/version-lock.guard';
import { CommissionsPageComponent } from './commissions-page/commissions-page.component';
import { CommissionDetailsComponent } from './commission-details/commission-details.component';
import { CommissionArchivesComponent } from './commission-archives/commission-archives.component';
import { CoreModule } from '../../core/core.module';
import { LoggedInGuard } from '../../core/guard/logged-in.guard';

const routes: Routes = [
  {
    path: '',
    component: CommissionsPageComponent,
    canActivate: [LoggedInGuard, MaintenanceGuard, VersionLockGuard]
  },
  {
    path: 'board/:dc',
    component: CommissionBoardComponent,
    canActivate: [LoggedInGuard, MaintenanceGuard, VersionLockGuard]
  },
  {
    path: 'archives',
    component: CommissionArchivesComponent,
    canActivate: [LoggedInGuard, MaintenanceGuard, VersionLockGuard]
  },
  {
    path: ':key',
    component: CommissionDetailsComponent,
    canActivate: [LoggedInGuard, MaintenanceGuard, VersionLockGuard]
  }
];

@NgModule({
  declarations: [CommissionBoardComponent, CommissionsPageComponent, CommissionDetailsComponent, CommissionArchivesComponent],
  imports: [
    CommonModule,
    CoreModule,

    RouterModule.forChild(routes),

    NzButtonModule
  ]
})
export class CommissionsModule {
}
