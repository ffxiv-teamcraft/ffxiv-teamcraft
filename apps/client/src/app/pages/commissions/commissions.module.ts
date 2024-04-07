import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CommissionBoardComponent } from './commission-board/commission-board.component';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { RouterModule, Routes } from '@angular/router';
import { MaintenanceGuard } from '../maintenance/maintenance.guard';
import { VersionLockGuard } from '../version-lock/version-lock.guard';
import { CommissionsPageComponent } from './commissions-page/commissions-page.component';
import { CommissionArchivesComponent } from './commission-archives/commission-archives.component';
import { CoreModule } from '../../core/core.module';

import { CommissionBoardModule } from '../../modules/commission-board/commission-board.module';
import { FormsModule } from '@angular/forms';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzInputModule } from 'ng-zorro-antd/input';
import { FlexLayoutModule } from '@angular/flex-layout';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { FullpageMessageModule } from '../../modules/fullpage-message/fullpage-message.module';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzGridModule } from 'ng-zorro-antd/grid';

const routes: Routes = [
  {
    path: '',
    component: CommissionsPageComponent,
    canActivate: [MaintenanceGuard, VersionLockGuard],
    data: {
      title: 'TITLE.Commissions'
    }
  },
  {
    path: 'board/:dc',
    component: CommissionBoardComponent,
    canActivate: [MaintenanceGuard, VersionLockGuard],
    data: {
      title: 'TITLE.Commissions'
    }
  },
  {
    path: 'archives',
    component: CommissionArchivesComponent,
    canActivate: [MaintenanceGuard, VersionLockGuard],
    data: {
      title: 'TITLE.Archives'
    }
  }
];

@NgModule({
    imports: [
    CommonModule,
    CoreModule,
    FlexLayoutModule,
    RouterModule.forChild(routes),
    NzButtonModule,
    CommissionBoardModule,
    FormsModule,
    NzSelectModule,
    NzInputModule,
    NzDividerModule,
    FullpageMessageModule,
    NzInputNumberModule,
    NzCheckboxModule,
    NzAlertModule,
    NzGridModule,
    CommissionBoardComponent, CommissionsPageComponent, CommissionArchivesComponent
]
})
export class CommissionsModule {
}
