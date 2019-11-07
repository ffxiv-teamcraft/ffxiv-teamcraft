import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MacroTranslatorComponent } from './macro-translator/macro-translator.component';
import { RouterModule, Routes } from '@angular/router';
import { NgZorroAntdModule } from 'ng-zorro-antd';
import { CoreModule } from '../../core/core.module';
import { TranslateModule } from '@ngx-translate/core';
import { ClipboardModule } from 'ngx-clipboard';
import { FormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MaintenanceGuard } from '../maintenance/maintenance.guard';
import { VersionLockGuard } from '../version-lock/version-lock.guard';

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
    NgZorroAntdModule,
    CoreModule,
    TranslateModule,
    ClipboardModule,


    RouterModule.forChild(routes)
  ],
  declarations: [MacroTranslatorComponent]
})
export class MacroTranslatorModule {
}
