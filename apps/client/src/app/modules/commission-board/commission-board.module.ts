import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import * as fromCommissions from './+state/commissions.reducer';
import { CommissionsEffects } from './+state/commissions.effects';
import { CommissionsFacade } from './+state/commissions.facade';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    StoreModule.forFeature(
      fromCommissions.COMMISSIONS_FEATURE_KEY,
      fromCommissions.reducer
    ),
    EffectsModule.forFeature([CommissionsEffects]),
  ],
  providers: [CommissionsFacade],
})
export class CommissionBoardModule {}
