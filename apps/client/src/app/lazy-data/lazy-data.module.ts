import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import * as fromLazyData from './+state/lazy-data.reducer';
import { LazyDataEffects } from './+state/lazy-data.effects';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    StoreModule.forFeature(
      fromLazyData.LAZY_DATA_FEATURE_KEY,
      fromLazyData.reducer,
      { initialState: fromLazyData.initialState }
    ),
    EffectsModule.forFeature([LazyDataEffects])
  ]
})
export class LazyDataModule {
}
