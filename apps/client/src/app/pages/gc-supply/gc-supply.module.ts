import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GcSupplyComponent } from './gc-supply/gc-supply.component';
import { PipesModule } from '../../pipes/pipes.module';
import { ItemIconModule } from '../../modules/item-icon/item-icon.module';

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


const routes: Routes = [
  {
    path: '',
    component: GcSupplyComponent,
    canActivate: [MaintenanceGuard, VersionLockGuard]
  }
];

@NgModule({
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
    PipesModule,
    ItemIconModule,
    RouterModule.forChild(routes),
    GcSupplyComponent
]
})
export class GcSupplyModule {
}
