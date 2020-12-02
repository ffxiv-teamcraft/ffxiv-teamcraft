import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { MaintenanceGuard } from '../maintenance/maintenance.guard';
import { VersionLockGuard } from '../version-lock/version-lock.guard';
import { FlexLayoutModule } from '@angular/flex-layout';
import { TranslateModule } from '@ngx-translate/core';
import { CoreModule } from '../../core/core.module';
import { PipesModule } from '../../pipes/pipes.module';
import { ItemIconModule } from '../../modules/item-icon/item-icon.module';
import { AlarmsModule } from '../../core/alarms/alarms.module';
import { SettingsModule } from '../../modules/settings/settings.module';
import { PageLoaderModule } from '../../modules/page-loader/page-loader.module';
import { FullpageMessageModule } from '../../modules/fullpage-message/fullpage-message.module';
import { OverlayContainerModule } from '../../modules/overlay-container/overlay-container.module';
import { ListPanelOverlayComponent } from './list-panel-overlay/list-panel-overlay.component';
import { ListModule } from '../../modules/list/list.module';
import { ItemPickerModule } from '../../modules/item-picker/item-picker.module';
import { FormsModule } from '@angular/forms';
import { AntdSharedModule } from '../../core/antd-shared.module';

const routes: Routes = [
  {
    path: '',
    component: ListPanelOverlayComponent,
    canActivate: [MaintenanceGuard, VersionLockGuard]
  }
];

@NgModule({
  imports: [
    CommonModule,
    FlexLayoutModule,

    RouterModule.forChild(routes),

    TranslateModule,

    CoreModule,
    PipesModule,
    ItemIconModule,
    AlarmsModule,
    SettingsModule,
    PageLoaderModule,
    FullpageMessageModule,
    ListModule,
    ItemPickerModule,

    AntdSharedModule,
    OverlayContainerModule,
    FormsModule
  ],
  declarations: [ListPanelOverlayComponent]
})
export class ListPanelOverlayModule {
}
