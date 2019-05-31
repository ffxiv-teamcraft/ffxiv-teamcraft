import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { alarmsReducer, initialState as alarmsInitialState } from './+state/alarms.reducer';
import { AlarmsEffects } from './+state/alarms.effects';
import { AlarmDisplayPipe } from './alarm-display.pipe';
import { NgZorroAntdModule } from 'ng-zorro-antd';
import { SettingsModule } from '../../modules/settings/settings.module';

@NgModule({
  imports: [
    CommonModule,
    SettingsModule,
    NgZorroAntdModule,

    StoreModule.forFeature('alarms', alarmsReducer, { initialState: alarmsInitialState }),
    EffectsModule.forFeature([AlarmsEffects])
  ],
  declarations: [AlarmDisplayPipe],
  exports: [AlarmDisplayPipe]
})
export class AlarmsModule {
}
