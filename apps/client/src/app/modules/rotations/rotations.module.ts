import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { initialState as rotationsInitialState, rotationsReducer } from './+state/rotations.reducer';
import { RotationsEffects } from './+state/rotations.effects';
import { RotationsFacade } from './+state/rotations.facade';
import { TranslateModule } from '@ngx-translate/core';
import { CoreModule } from '../../core/core.module';
import { RotationPickerDrawerComponent } from './rotation-picker-drawer/rotation-picker-drawer.component';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { AntdSharedModule } from '../../core/antd-shared.module';

@NgModule({
  imports: [
    CommonModule,
    CoreModule,
    FormsModule,
    TranslateModule,
    AntdSharedModule,
    RouterModule,
    FlexLayoutModule,

    StoreModule.forFeature('rotations', rotationsReducer, {
      initialState: rotationsInitialState
    }),
    EffectsModule.forFeature([RotationsEffects])
  ],
  declarations: [RotationPickerDrawerComponent],
  providers: [RotationsFacade]
})
export class RotationsModule {
}
