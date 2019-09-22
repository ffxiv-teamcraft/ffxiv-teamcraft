import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InventoryComponent } from './inventory/inventory.component';
import { CoreModule } from '../../core/core.module';
import { RouterModule, Routes } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { NgZorroAntdModule } from 'ng-zorro-antd';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ItemIconModule } from '../../modules/item-icon/item-icon.module';
import { PipesModule } from '../../pipes/pipes.module';
import { HttpClientModule } from '@angular/common/http';
import { MaintenanceGuard } from '../maintenance/maintenance.guard';
import { FullpageMessageModule } from '../../modules/fullpage-message/fullpage-message.module';
import { ClipboardModule } from 'ngx-clipboard';

const routes: Routes = [
  {
    path: '',
    component: InventoryComponent,
    canActivate: [MaintenanceGuard]
  }
];

@NgModule({
  declarations: [InventoryComponent],
  imports: [
    CommonModule,
    CoreModule,
    RouterModule.forChild(routes),
    TranslateModule,
    NgZorroAntdModule,
    FlexLayoutModule,
    ItemIconModule,
    PipesModule,
    HttpClientModule,
    FullpageMessageModule,
    ClipboardModule
  ]
})
export class InventoryModule {
}
