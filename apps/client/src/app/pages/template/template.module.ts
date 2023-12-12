import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TemplateComponent } from './template/template.component';
import { RouterModule, Routes } from '@angular/router';

import { FullpageMessageModule } from '../../modules/fullpage-message/fullpage-message.module';
import { CustomLinksModule } from '../../modules/custom-links/custom-links.module';
import { TranslateModule } from '@ngx-translate/core';
import { MaintenanceGuard } from '../maintenance/maintenance.guard';
import { VersionLockGuard } from '../version-lock/version-lock.guard';

const routes: Routes = [
  {
    path: ':nickname/:uri',
    component: TemplateComponent,
    canActivate: [MaintenanceGuard, VersionLockGuard]
  }
];

@NgModule({
    imports: [
    CommonModule,
    TranslateModule,
    FullpageMessageModule,
    CustomLinksModule,
    RouterModule.forChild(routes),
    TemplateComponent
]
})
export class TemplateModule {
}
