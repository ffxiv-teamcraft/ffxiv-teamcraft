import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import {
  EORZEA_FEATURE_KEY,
  initialState as eorzeaInitialState,
  eorzeaReducer
} from './+state/eorzea.reducer';
import { EorzeaEffects } from './+state/eorzea.effects';
import { EorzeaFacade } from './+state/eorzea.facade';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    StoreModule.forFeature(EORZEA_FEATURE_KEY, eorzeaReducer, {
      initialState: eorzeaInitialState
    }),
    EffectsModule.forFeature([EorzeaEffects])
  ],
  providers: [EorzeaFacade]
})
export class EorzeaModule {
}
