import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { alarmsReducer, initialState as alarmsInitialState } from './+state/alarms.reducer';
import { AlarmsEffects } from './+state/alarms.effects';
import { AlarmDisplayPipe } from './alarm-display.pipe';
import { SettingsModule } from '../../modules/settings/settings.module';
import { RouterModule } from '@angular/router';
import { TimerTooltipDirective } from './timer-tooltip.directive';

@NgModule({
  imports: [
    CommonModule,
    SettingsModule,
    RouterModule,

    StoreModule.forFeature('alarms', alarmsReducer, { initialState: alarmsInitialState }),
    EffectsModule.forFeature([AlarmsEffects])
  ],
  declarations: [AlarmDisplayPipe, TimerTooltipDirective],
  providers: [DatePipe],
  exports: [AlarmDisplayPipe, TimerTooltipDirective]
})
export class AlarmsModule {
}
