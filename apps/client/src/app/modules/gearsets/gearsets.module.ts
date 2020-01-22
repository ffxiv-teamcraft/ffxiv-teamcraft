import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import * as fromGearsets from './+state/gearsets.reducer';
import { GearsetsEffects } from './+state/gearsets.effects';
import { GearsetsFacade } from './+state/gearsets.facade';
import { NzButtonModule, NzFormModule, NzInputModule, NzModalServiceModule, NzSelectModule } from 'ng-zorro-antd';
import { TranslateModule } from '@ngx-translate/core';
import { GearsetCreationPopupComponent } from './gearset-creation-popup/gearset-creation-popup.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PipesModule } from '../../pipes/pipes.module';
import { CoreModule } from '../../core/core.module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MateriaSlotIconComponent } from './materia-slot-icon/materia-slot-icon.component';

@NgModule({
  declarations: [GearsetCreationPopupComponent, MateriaSlotIconComponent],
  entryComponents: [GearsetCreationPopupComponent],
  imports: [
    CommonModule,
    NzFormModule,
    NzSelectModule,
    NzInputModule,
    NzButtonModule,
    FormsModule,
    ReactiveFormsModule,
    PipesModule,
    CoreModule,
    FlexLayoutModule,

    StoreModule.forFeature(
      fromGearsets.GEARSETS_FEATURE_KEY,
      fromGearsets.reducer
    ),
    EffectsModule.forFeature([GearsetsEffects]),

    NzModalServiceModule,
    TranslateModule
  ],
  exports: [MateriaSlotIconComponent],
  providers: [GearsetsFacade]
})
export class GearsetsModule {
}
