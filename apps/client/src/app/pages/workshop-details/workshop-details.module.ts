import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WorkshopDetailsComponent } from './workshop-details/workshop-details.component';
import { TranslateModule } from '@ngx-translate/core';
import { RouterModule, Routes } from '@angular/router';
import { PermissionsModule } from '../../modules/permissions/permissions.module';
import { ListModule } from '../../modules/list/list.module';
import { WorkshopModule } from '../../modules/workshop/workshop.module';
import { PageLoaderModule } from '../../modules/page-loader/page-loader.module';
import { FullpageMessageModule } from '../../modules/fullpage-message/fullpage-message.module';
import { XivapiClientModule } from '@xivapi/angular-client';
import { CoreModule } from '../../core/core.module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FavoritesModule } from '../../modules/favorites/favorites.module';
import { MaintenanceGuard } from '../maintenance/maintenance.guard';
import { VersionLockGuard } from '../version-lock/version-lock.guard';
import { AntdSharedModule } from '../../core/antd-shared.module';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';

const routes: Routes = [
  {
    path: ':id',
    component: WorkshopDetailsComponent,
    canActivate: [MaintenanceGuard, VersionLockGuard]
  }
];

@NgModule({
  imports: [
    CommonModule,
    TranslateModule,
    AntdSharedModule,
    CoreModule,
    FlexLayoutModule,
    FavoritesModule,

    XivapiClientModule,

    RouterModule.forChild(routes),

    WorkshopModule,
    ListModule,
    PermissionsModule,
    PageLoaderModule,
    FullpageMessageModule,
    NzAvatarModule
  ],
  declarations: [WorkshopDetailsComponent]
})
export class WorkshopDetailsModule {
}
