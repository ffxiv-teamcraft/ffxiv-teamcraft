import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LevequestsComponent } from './levequests/levequests.component';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { ListModule } from '../../modules/list/list.module';
import { TranslateModule } from '@ngx-translate/core';
import { FullpageMessageModule } from '../../modules/fullpage-message/fullpage-message.module';

import { PipesModule } from '../../pipes/pipes.module';
import { ListPickerModule } from '../../modules/list-picker/list-picker.module';
import { CoreModule } from '../../core/core.module';
import { MapModule } from '../../modules/map/map.module';
import { ProgressPopupModule } from '../../modules/progress-popup/progress-popup.module';
import { SettingsModule } from '../../modules/settings/settings.module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MaintenanceGuard } from '../maintenance/maintenance.guard';
import { VersionLockGuard } from '../version-lock/version-lock.guard';
import { ItemIconModule } from '../../modules/item-icon/item-icon.module';

import { NzProgressModule } from 'ng-zorro-antd/progress';

const routes: Routes = [
  {
    path: '',
    component: LevequestsComponent,
    canActivate: [MaintenanceGuard, VersionLockGuard],
    data: {
      title: 'TITLE.Levequests'
    }
  }
];

@NgModule({
    imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    FlexLayoutModule,
    CoreModule,
    ListModule,
    TranslateModule,
    FullpageMessageModule,
    PipesModule,
    SettingsModule,
    ListPickerModule,
    ProgressPopupModule,
    MapModule,
    ItemIconModule,
    NzProgressModule,
    RouterModule.forChild(routes),
    LevequestsComponent
]
})
export class LevequestsModule {
}
