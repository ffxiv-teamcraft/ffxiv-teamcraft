import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GearsetsPageComponent } from './gearsets-page/gearsets-page.component';
import { GearsetPanelComponent } from './gearset-panel/gearset-panel.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { CoreModule } from '../../core/core.module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { TooltipModule } from '../../modules/tooltip/tooltip.module';
import { ProgressPopupModule } from '../../modules/progress-popup/progress-popup.module';
import { FullpageMessageModule } from '../../modules/fullpage-message/fullpage-message.module';
import { ListModule } from '../../modules/list/list.module';
import { ListPickerModule } from '../../modules/list-picker/list-picker.module';
import { NgZorroAntdModule } from 'ng-zorro-antd';
import { PipesModule } from '../../pipes/pipes.module';
import { ItemIconModule } from '../../modules/item-icon/item-icon.module';
import { PageLoaderModule } from '../../modules/page-loader/page-loader.module';
import { RouterModule, Routes } from '@angular/router';
import { MaintenanceGuard } from '../maintenance/maintenance.guard';
import { VersionLockGuard } from '../version-lock/version-lock.guard';

const routes: Routes = [
  {
    path: '',
    component: GearsetsPageComponent,
    canActivate: [MaintenanceGuard, VersionLockGuard]
  }
];

@NgModule({
  declarations: [GearsetsPageComponent, GearsetPanelComponent],
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

    NgZorroAntdModule,
    PipesModule,
    ItemIconModule,
    PageLoaderModule,

    RouterModule.forChild(routes)
  ]
})
export class GearsetsPageModule {
}
