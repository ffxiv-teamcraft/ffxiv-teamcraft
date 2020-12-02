import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MacroTranslatorComponent } from './macro-translator/macro-translator.component';
import { RouterModule, Routes } from '@angular/router';
import { CoreModule } from '../../core/core.module';
import { TranslateModule } from '@ngx-translate/core';

import { FormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MaintenanceGuard } from '../maintenance/maintenance.guard';
import { VersionLockGuard } from '../version-lock/version-lock.guard';
import { AntdSharedModule } from '../../core/antd-shared.module';
import { NzRadioModule } from 'ng-zorro-antd/radio';

const routes: Routes = [
  {
    path: '',
    component: MacroTranslatorComponent,
    canActivate: [MaintenanceGuard, VersionLockGuard]
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    FlexLayoutModule,
    AntdSharedModule,
    CoreModule,
    TranslateModule,

    RouterModule.forChild(routes),

    NzRadioModule
  ],
  declarations: [MacroTranslatorComponent]
})
export class MacroTranslatorModule {
}
