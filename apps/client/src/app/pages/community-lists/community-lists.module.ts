import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CommunityListsComponent } from './community-lists/community-lists.component';
import { NgZorroAntdModule } from 'ng-zorro-antd';
import { FullpageMessageModule } from '../../modules/fullpage-message/fullpage-message.module';
import { ListModule } from '../../modules/list/list.module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { RouterModule, Routes } from '@angular/router';
import { PageLoaderModule } from '../../modules/page-loader/page-loader.module';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { MaintenanceGuard } from '../maintenance/maintenance.guard';
import { VersionLockGuard } from '../version-lock/version-lock.guard';

const routes: Routes = [
  {
    path: '',
    component: CommunityListsComponent,
    canActivate: [MaintenanceGuard, VersionLockGuard]
  }
];

@NgModule({
  imports: [
    CommonModule,
    TranslateModule,
    FormsModule,

    RouterModule.forChild(routes),

    NgZorroAntdModule,
    FullpageMessageModule,
    ListModule,
    FlexLayoutModule,
    PageLoaderModule
  ],
  declarations: [CommunityListsComponent]
})
export class CommunityListsModule {
}
