import { NgModule, Provider } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InventoryOptimizerComponent } from './inventory-optimizer/inventory-optimizer.component';
import { INVENTORY_OPTIMIZER } from './optimizations/inventory-optimizer';
import { NgZorroAntdModule } from 'ng-zorro-antd';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { CoreModule } from '../../core/core.module';
import { PipesModule } from '../../pipes/pipes.module';
import { CanBeBought } from './optimizations/can-be-bought';
import { RouterModule, Routes } from '@angular/router';
import { MaintenanceGuard } from '../maintenance/maintenance.guard';
import { PageLoaderModule } from '../../modules/page-loader/page-loader.module';
import { FullpageMessageModule } from '../../modules/fullpage-message/fullpage-message.module';
import { ItemIconModule } from '../../modules/item-icon/item-icon.module';
import { InventoryFacade } from '../../modules/inventory/+state/inventory.facade';
import { Duplicates } from './optimizations/duplicates';
import { FormsModule } from '@angular/forms';

const optimisations: Provider[] = [
  {
    provide: INVENTORY_OPTIMIZER,
    useClass: CanBeBought,
    multi: true
  },
  {
    provide: INVENTORY_OPTIMIZER,
    useClass: Duplicates,
    multi: true,
    deps: [TranslateService, InventoryFacade]
  }
];

const routes: Routes = [
  {
    path: '',
    component: InventoryOptimizerComponent,
    canActivate: [MaintenanceGuard]
  }
];

@NgModule({
  declarations: [
    InventoryOptimizerComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    CoreModule,
    PipesModule,
    NgZorroAntdModule,
    TranslateModule,
    FlexLayoutModule,
    RouterModule.forChild(routes),
    PageLoaderModule,
    FullpageMessageModule,
    ItemIconModule
  ],
  providers: [
    ...optimisations
  ]
})
export class InventoryOptimizerModule {
}
