import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { alarmsReducer, initialState as alarmsInitialState } from './+state/alarms.reducer';
import { AlarmsEffects } from './+state/alarms.effects';
import { AlarmsFacade } from './+state/alarms.facade';
import { AlarmsService } from './alarms.service';
import { AlarmBellService } from './alarm-bell.service';
import { SettingsModule } from '../../pages/settings/settings.module';
import { AlarmGroupService } from './alarm-group.service';
import { AlarmDisplayPipe } from './alarm-display.pipe';
import { NgZorroAntdModule } from 'ng-zorro-antd';

@NgModule({
  imports: [
    CommonModule,
    SettingsModule,
    NgZorroAntdModule,

    StoreModule.forFeature('alarms', alarmsReducer, { initialState: alarmsInitialState }),
    EffectsModule.forFeature([AlarmsEffects])
  ],
  declarations: [AlarmDisplayPipe],
  exports: [AlarmDisplayPipe],
  providers: [
    AlarmsFacade,
    AlarmsService,
    AlarmBellService,
    AlarmGroupService
  ]
})
export class AlarmsModule {
}
