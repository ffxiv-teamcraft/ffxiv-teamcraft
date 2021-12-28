import { NgModule } from '@angular/core';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { initialState as layoutsInitialState, layoutsReducer } from './+state/layouts.reducer';
import { LayoutsEffects } from './+state/layouts.effects';
import { LayoutService } from './layout.service';
import { LayoutOrderService } from './layout-order.service';

@NgModule({
  providers: [
    LayoutOrderService,
    LayoutService
  ],
  imports: [
    StoreModule.forFeature('layouts', layoutsReducer, { initialState: layoutsInitialState }),
    EffectsModule.forFeature([LayoutsEffects])
  ]
})
export class LayoutModule {
}
