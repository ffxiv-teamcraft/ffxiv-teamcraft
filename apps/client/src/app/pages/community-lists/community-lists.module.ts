import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CommunityListsComponent } from './community-lists/community-lists.component';
import { FullpageMessageModule } from '../../modules/fullpage-message/fullpage-message.module';
import { ListModule } from '../../modules/list/list.module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { RouterModule, Routes } from '@angular/router';

import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { MaintenanceGuard } from '../maintenance/maintenance.guard';
import { VersionLockGuard } from '../version-lock/version-lock.guard';

import { NzPaginationModule } from 'ng-zorro-antd/pagination';

const routes: Routes = [
  {
    path: '',
    component: CommunityListsComponent,
    canActivate: [MaintenanceGuard, VersionLockGuard],
    data: {
      title: 'TITLE.Community_Lists'
    }
  }
];

@NgModule({
    imports: [
    CommonModule,
    TranslateModule,
    FormsModule,
    RouterModule.forChild(routes),
    FullpageMessageModule,
    ListModule,
    FlexLayoutModule,
    NzPaginationModule,
    CommunityListsComponent
]
})
export class CommunityListsModule {
}
