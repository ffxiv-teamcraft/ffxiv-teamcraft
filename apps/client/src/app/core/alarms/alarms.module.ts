import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { alarmsReducer, initialState as alarmsInitialState } from './+state/alarms.reducer';
import { AlarmsEffects } from './+state/alarms.effects';
import { AlarmsFacade } from './+state/alarms.facade';
import { AlarmsService } from './alarms.service';

@NgModule({
  imports: [
    CommonModule,
    StoreModule.forFeature('alarms', alarmsReducer, { initialState: alarmsInitialState }),
    EffectsModule.forFeature([AlarmsEffects])
  ],
  declarations: [],
  providers: [
    AlarmsFacade,
    AlarmsService
  ]
})
export class AlarmsModule {
}
