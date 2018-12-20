import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LinkComponent } from './link/link.component';
import { RouterModule, Routes } from '@angular/router';
import { PageLoaderModule } from '../../modules/page-loader/page-loader.module';
import { FullpageMessageModule } from '../../modules/fullpage-message/fullpage-message.module';
import { CustomLinksModule } from '../../modules/custom-links/custom-links.module';
import { TranslateModule } from '@ngx-translate/core';
import { MaintenanceGuard } from '../maintenance/maintenance.guard';

const routes: Routes = [
  {
    path: ':nickname/:uri',
    component: LinkComponent,
    canActivate: [MaintenanceGuard]
  }
];

@NgModule({
  declarations: [LinkComponent],
  imports: [
    CommonModule,
    PageLoaderModule,
    FullpageMessageModule,
    TranslateModule,
    CustomLinksModule,
    RouterModule.forChild(routes)
  ]
})
export class LinkModule {
}
