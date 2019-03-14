import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { customItemsInitialState, customItemsReducer } from './+state/custom-items.reducer';
import { CustomItemsEffects } from './+state/custom-items.effects';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,

    StoreModule.forFeature('custom-items', customItemsReducer, { initialState: customItemsInitialState }),
    EffectsModule.forFeature([CustomItemsEffects])
  ]
})
export class CustomItemsModule {
}
