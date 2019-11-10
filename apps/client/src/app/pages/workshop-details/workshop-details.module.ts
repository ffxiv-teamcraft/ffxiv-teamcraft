import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WorkshopDetailsComponent } from './workshop-details/workshop-details.component';
import { TranslateModule } from '@ngx-translate/core';
import { NgZorroAntdModule } from 'ng-zorro-antd';
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
    NgZorroAntdModule,
    CoreModule,
    FlexLayoutModule,
    FavoritesModule,

    XivapiClientModule,

    RouterModule.forChild(routes),

    WorkshopModule,
    ListModule,
    PermissionsModule,
    PageLoaderModule,
    FullpageMessageModule
  ],
  declarations: [WorkshopDetailsComponent]
})
export class WorkshopDetailsModule {
}
