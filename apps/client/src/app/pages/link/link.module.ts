import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LinkComponent } from './link/link.component';
import { RouterModule, Routes } from '@angular/router';
import { PageLoaderModule } from '../../modules/page-loader/page-loader.module';
import { FullpageMessageModule } from '../../modules/fullpage-message/fullpage-message.module';

const routes: Routes = [
  {
    path: 'link/nickName/:uri',
    component: LinkComponent
  }
];

@NgModule({
  declarations: [LinkComponent],
  imports: [
    CommonModule,
    PageLoaderModule,
    FullpageMessageModule,
    RouterModule.forChild(routes)
  ]
})
export class LinkModule {
}
