import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CollectablesComponent } from './collectables/collectables.component';
import {
  NzButtonModule,
  NzCheckboxModule,
  NzCollapseModule,
  NzFormModule,
  NzIconModule,
  NzInputModule,
  NzInputNumberModule,
  NzNotificationModule,
  NzTabsModule,
  NzToolTipModule
} from 'ng-zorro-antd';
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

const routes: Routes = [
  {
    path: '',
    component: CollectablesComponent,
    canActivate: [MaintenanceGuard, VersionLockGuard]
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
    PageLoaderModule
  ],
  declarations: [
    CollectablesComponent
  ]
})
export class CollectablesModule {
}
