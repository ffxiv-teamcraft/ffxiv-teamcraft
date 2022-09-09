import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CollectablesComponent } from './collectables/collectables.component';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzCollapseModule } from 'ng-zorro-antd/collapse';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzNotificationModule } from 'ng-zorro-antd/notification';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { PipesModule } from '../../pipes/pipes.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CoreModule } from '../../core/core.module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { RouterModule, Routes } from '@angular/router';
import { MaintenanceGuard } from '../maintenance/maintenance.guard';
import { VersionLockGuard } from '../version-lock/version-lock.guard';
import { ItemIconModule } from '../../modules/item-icon/item-icon.module';
import { FullpageMessageModule } from '../../modules/fullpage-message/fullpage-message.module';
import { PageLoaderModule } from '../../modules/page-loader/page-loader.module';
import { NodeDetailsModule } from '../../modules/node-details/node-details.module';
import { MapModule } from '../../modules/map/map.module';
import { ListModule } from '../../modules/list/list.module';
import { AlarmButtonModule } from '../../modules/alarm-button/alarm-button.module';

const routes: Routes = [
  {
    path: ':jobAbbr',
    component: CollectablesComponent,
    canActivate: [MaintenanceGuard, VersionLockGuard]
  },
  {
    path: '',
    redirectTo: 'CRP',
    pathMatch: 'full'
  }
];


@NgModule({
  imports: [
    CoreModule,
    PipesModule,

    FormsModule,
    ReactiveFormsModule,
    CommonModule,

    FlexLayoutModule,

    NzCollapseModule,
    NzTabsModule,
    NzInputModule,
    NzFormModule,
    NzButtonModule,
    NzToolTipModule,
    NzNotificationModule,
    NzIconModule,
    NzCheckboxModule,

    RouterModule.forChild(routes),
    ItemIconModule,
    NzInputNumberModule,
    FullpageMessageModule,
    PageLoaderModule,
    NodeDetailsModule,
    MapModule,
    ListModule,
    AlarmButtonModule
  ],
  declarations: [
    CollectablesComponent
  ]
})
export class CollectablesModule {
}
