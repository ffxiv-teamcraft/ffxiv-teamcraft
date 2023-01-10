import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreModule } from '@ngrx/store';
import * as fromListAggregates from './+state/list-aggregates.reducer';
import { EffectsModule } from '@ngrx/effects';
import { ListAggregatesEffects } from './+state/list-aggregates.effects';



@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    StoreModule.forFeature(fromListAggregates.listAggregatesFeatureKey, fromListAggregates.reducer),
    EffectsModule.forFeature([ListAggregatesEffects])
  ]
})
export class ListAggregateModule { }
