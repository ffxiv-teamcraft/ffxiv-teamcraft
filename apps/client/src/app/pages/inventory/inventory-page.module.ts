import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InventoryComponent } from './inventory/inventory.component';
import { CoreModule } from '../../core/core.module';
import { RouterModule, Routes } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ItemIconModule } from '../../modules/item-icon/item-icon.module';
import { PipesModule } from '../../pipes/pipes.module';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { MaintenanceGuard } from '../maintenance/maintenance.guard';
import { VersionLockGuard } from '../version-lock/version-lock.guard';
import { FullpageMessageModule } from '../../modules/fullpage-message/fullpage-message.module';

import { ScrollingModule } from '@angular/cdk/scrolling';
import { FormsModule } from '@angular/forms';

import { InventoryModule } from '../../modules/inventory/inventory.module';

const routes: Routes = [
  {
    path: '',
    component: InventoryComponent,
    canActivate: [MaintenanceGuard, VersionLockGuard]
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    CoreModule,
    RouterModule.forChild(routes),
    TranslateModule,
    FlexLayoutModule,
    ItemIconModule,
    PipesModule,
    FullpageMessageModule,
    ScrollingModule,
    InventoryModule,
    InventoryComponent
  ],
  providers: [provideHttpClient(withInterceptorsFromDi())]
})
export class InventoryPageModule {
}
