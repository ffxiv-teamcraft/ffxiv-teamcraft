import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import {
  initialState as inventoryInitialState,
  INVENTORY_FEATURE_KEY,
  inventoryReducer
} from './+state/inventory.reducer';
import { InventoryEffects } from './+state/inventory.effects';
import { CoreModule } from '../../core/core.module';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    CoreModule,
    StoreModule.forFeature(INVENTORY_FEATURE_KEY, inventoryReducer, {
      initialState: inventoryInitialState
    }),
    EffectsModule.forFeature([InventoryEffects])
  ]
})
export class InventoryModule {
}
