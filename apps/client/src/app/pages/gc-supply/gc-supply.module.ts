import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GcSupplyComponent } from './gc-supply/gc-supply.component';
import { PipesModule } from '../../pipes/pipes.module';
import { ItemIconModule } from '../../modules/item-icon/item-icon.module';
import { PageLoaderModule } from '../../modules/page-loader/page-loader.module';
import { ListModule } from '../../modules/list/list.module';
import { ListPickerModule } from '../../modules/list-picker/list-picker.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { MaintenanceGuard } from '../maintenance/maintenance.guard';
import { VersionLockGuard } from '../version-lock/version-lock.guard';
import { TranslateModule } from '@ngx-translate/core';
import { CoreModule } from '../../core/core.module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { TooltipModule } from '../../modules/tooltip/tooltip.module';
import { ProgressPopupModule } from '../../modules/progress-popup/progress-popup.module';
import { FullpageMessageModule } from '../../modules/fullpage-message/fullpage-message.module';
import { AntdSharedModule } from '../../core/antd-shared.module';

const routes: Routes = [
  {
    path: '',
    component: GcSupplyComponent,
    canActivate: [MaintenanceGuard, VersionLockGuard]
  }
];

@NgModule({
  declarations: [GcSupplyComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    CoreModule,
    FlexLayoutModule,
    TooltipModule,
    ProgressPopupModule,
    FullpageMessageModule,

    ListModule,
    ListPickerModule,

    AntdSharedModule,
    PipesModule,
    ItemIconModule,
    PageLoaderModule,

    RouterModule.forChild(routes)
  ]
})
export class GcSupplyModule {
}
