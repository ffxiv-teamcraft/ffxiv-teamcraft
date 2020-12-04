import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CommissionDetailsComponent } from './commission-details/commission-details.component';
import { MaintenanceGuard } from '../maintenance/maintenance.guard';
import { VersionLockGuard } from '../version-lock/version-lock.guard';
import { RouterModule, Routes } from '@angular/router';
import { CoreModule } from '../../core/core.module';
import { NzCardModule } from 'ng-zorro-antd/card';
import { UserAvatarModule } from '../../modules/user-avatar/user-avatar.module';
import { PipesModule } from '../../pipes/pipes.module';
import { PageLoaderModule } from '../../modules/page-loader/page-loader.module';
import { CommissionBoardModule } from '../../modules/commission-board/commission-board.module';
import { ItemIconModule } from '../../modules/item-icon/item-icon.module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzProgressModule } from 'ng-zorro-antd/progress';
import { NzRateModule } from 'ng-zorro-antd/rate';
import { FormsModule } from '@angular/forms';
import { CommissionImportComponent } from './commission-import/commission-import.component';
import { FullpageMessageModule } from '../../modules/fullpage-message/fullpage-message.module';

const routes: Routes = [
  {
    path: 'import/:importString',
    component: CommissionImportComponent,
    canActivate: [MaintenanceGuard, VersionLockGuard]
  },
  {
    path: ':id',
    component: CommissionDetailsComponent,
    canActivate: [MaintenanceGuard, VersionLockGuard]
  }
];

@NgModule({
  declarations: [CommissionDetailsComponent, CommissionImportComponent],
  imports: [
    CommonModule,
    CoreModule,
    FlexLayoutModule,
    FormsModule,

    CommissionBoardModule,

    RouterModule.forChild(routes),
    NzCardModule,
    NzGridModule,
    UserAvatarModule,
    PipesModule,
    PageLoaderModule,
    ItemIconModule,
    NzDividerModule,
    NzTagModule,
    NzButtonModule,
    NzDropDownModule,
    NzPopconfirmModule,
    NzToolTipModule,
    NzEmptyModule,
    NzProgressModule,
    NzRateModule,
    FullpageMessageModule
  ]
})
export class CommissionModule {
}
