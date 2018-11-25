import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import {
  initialState as rotationsInitialState,
  rotationsReducer
} from './+state/rotations.reducer';
import { RotationsEffects } from './+state/rotations.effects';
import { RotationsFacade } from './+state/rotations.facade';
import { TranslateModule } from '@ngx-translate/core';
import { CoreModule } from '../../core/core.module';
import { NgZorroAntdModule } from 'ng-zorro-antd';

@NgModule({
  imports: [
    CommonModule,
    CoreModule,
    TranslateModule,
    NgZorroAntdModule,

    StoreModule.forFeature('rotations', rotationsReducer, {
      initialState: rotationsInitialState
    }),
    EffectsModule.forFeature([RotationsEffects])
  ],
  declarations: [],
  providers: [RotationsFacade]
})
export class RotationsModule {
}
