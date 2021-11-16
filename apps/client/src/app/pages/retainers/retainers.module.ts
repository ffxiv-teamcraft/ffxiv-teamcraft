import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RetainersComponent } from './retainers/retainers.component';
import { RouterModule, Routes } from '@angular/router';
import { MaintenanceGuard } from '../maintenance/maintenance.guard';
import { VersionLockGuard } from '../version-lock/version-lock.guard';
import { CoreModule } from '../../core/core.module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { TranslateModule } from '@ngx-translate/core';
import { FullpageMessageModule } from '../../modules/fullpage-message/fullpage-message.module';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { PipesModule } from '../../pipes/pipes.module';
import { ItemIconModule } from '../../modules/item-icon/item-icon.module';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { FormsModule } from '@angular/forms';
import { PageLoaderModule } from '../../modules/page-loader/page-loader.module';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzCollapseModule } from 'ng-zorro-antd/collapse';

const routes: Routes = [
  {
    path: '',
    component: RetainersComponent,
    canActivate: [MaintenanceGuard, VersionLockGuard]
  }
];


@NgModule({
  declarations: [RetainersComponent],
  imports: [
    CommonModule,
    CoreModule,
    FormsModule,
    FlexLayoutModule,
    TranslateModule,
    RouterModule.forChild(routes),
    FullpageMessageModule,
    NzGridModule,
    PipesModule,
    ItemIconModule,
    NzSwitchModule,
    PageLoaderModule,
    NzDividerModule,
    NzTagModule,
    NzCollapseModule
  ]
})
export class RetainersModule {
}
