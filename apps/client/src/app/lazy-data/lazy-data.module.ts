import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import * as fromLazyData from './+state/lazy-data.reducer';
import { LazyDataEffects } from './+state/lazy-data.effects';
import { LazyDataFacade } from './+state/lazy-data.facade';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    StoreModule.forFeature(
      fromLazyData.LAZYDATA_FEATURE_KEY,
      fromLazyData.reducer
    ),
    EffectsModule.forFeature([LazyDataEffects]),
  ],
  providers: [LazyDataFacade],
})
export class LazyDataModule {}
