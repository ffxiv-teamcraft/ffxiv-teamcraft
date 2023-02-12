import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RetainerVenturesComponent } from './retainer-ventures/retainer-ventures.component';
import { RouterModule, Routes } from '@angular/router';
import { MaintenanceGuard } from '../maintenance/maintenance.guard';
import { VersionLockGuard } from '../version-lock/version-lock.guard';
import { CoreModule } from '../../core/core.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { TranslateModule } from '@ngx-translate/core';
import { FullpageMessageModule } from '../../modules/fullpage-message/fullpage-message.module';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { PipesModule } from '../../pipes/pipes.module';
import { ItemIconModule } from '../../modules/item-icon/item-icon.module';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { MarketboardModule } from '../../modules/marketboard/marketboard.module';
import { NzFormModule } from 'ng-zorro-antd/form';
import { PageLoaderModule } from '../../modules/page-loader/page-loader.module';
import { NzAlertModule } from 'ng-zorro-antd/alert';


const routes: Routes = [
  {
    path: '',
    component: RetainerVenturesComponent,
    canActivate: [MaintenanceGuard, VersionLockGuard]
  }
];


@NgModule({
  declarations: [RetainerVenturesComponent],
  imports: [
    CommonModule,
    CoreModule,
    FormsModule,
    ReactiveFormsModule,
    FlexLayoutModule,
    TranslateModule,
    RouterModule.forChild(routes),
    FullpageMessageModule,
    NzGridModule,
    PipesModule,
    ItemIconModule,
    NzSwitchModule,
    NzSelectModule,
    NzInputNumberModule,
    MarketboardModule,
    NzFormModule,
    PageLoaderModule,
    NzAlertModule
  ]
})
export class RetainerVenturesModule {
}
