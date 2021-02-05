import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreModule } from '@ngrx/store';
import * as fromFreecompanyWorkshop from './+state/freecompany-workshop.reducer';
import { EffectsModule } from '@ngrx/effects';
import { FreecompanyWorkshopEffects } from './+state/freecompany-workshop.effects';
import { ImportWorkshopFromPcapPopupComponent } from './import-workshop-from-pcap-popup/import-workshop-from-pcap-popup.component';
import { XivapiClientModule } from '@xivapi/angular-client';
import { FlexLayoutModule } from '@angular/flex-layout';
import { AntdSharedModule } from '../../core/antd-shared.module';
import { PipesModule } from '../../pipes/pipes.module';
import { CoreModule } from '../../core/core.module';


@NgModule({
  declarations: [ImportWorkshopFromPcapPopupComponent],
  imports: [
    CommonModule,
    StoreModule.forFeature(fromFreecompanyWorkshop.freecompanyWorkshopsFeatureKey, fromFreecompanyWorkshop.reducer),
    EffectsModule.forFeature([FreecompanyWorkshopEffects]),

    XivapiClientModule,

    FlexLayoutModule,
    AntdSharedModule,
    CoreModule,
  ]
})
export class FreecompanyWorkshopsModule {
}
