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
import { VersionLockGuard } from '../version-lock/version-lock.guard';
import { PageLoaderModule } from '../../modules/page-loader/page-loader.module';
import { FullpageMessageModule } from '../../modules/fullpage-message/fullpage-message.module';
import { ItemIconModule } from '../../modules/item-icon/item-icon.module';
import { InventoryFacade } from '../../modules/inventory/+state/inventory.facade';
import { Duplicates } from './optimizations/duplicates';
import { FormsModule } from '@angular/forms';

import { HasTooFew } from './optimizations/has-too-few';
import { LazyDataService } from '../../core/data/lazy-data.service';
import { ConsolidateStacks } from './optimizations/consolidate-stacks';
import { UnwantedMaterials } from './optimizations/unwanted-materials';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { LazyScrollModule } from '../../modules/lazy-scroll/lazy-scroll.module';
import { CanBeGatheredEasily } from './optimizations/can-be-gathered-easily';
import { CanExtractMateria } from './optimizations/can-extract-materia';

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
    deps: [TranslateService, InventoryFacade, LazyDataService]
  },
  {
    provide: INVENTORY_OPTIMIZER,
    useClass: HasTooFew,
    multi: true,
    deps: [LazyDataService]
  },
  {
    provide: INVENTORY_OPTIMIZER,
    useClass: ConsolidateStacks,
    multi: true,
    deps: [TranslateService, InventoryFacade, LazyDataService]
  },
  {
    provide: INVENTORY_OPTIMIZER,
    useClass: UnwantedMaterials,
    multi: true,
    deps: [LazyDataService]
  },
  {
    provide: INVENTORY_OPTIMIZER,
    useClass: CanExtractMateria,
    multi: true,
    deps: [LazyDataService]
  },
  {
    provide: INVENTORY_OPTIMIZER,
    useClass: CanBeGatheredEasily,
    multi: true
  }
];

const routes: Routes = [
  {
    path: '',
    component: InventoryOptimizerComponent,
    canActivate: [MaintenanceGuard, VersionLockGuard]
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
    ItemIconModule,

    ScrollingModule,
    LazyScrollModule
  ],
  providers: [
    ...optimisations
  ]
})
export class InventoryOptimizerModule {
}
