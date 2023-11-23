import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreModule } from '@ngrx/store';
import * as fromFreeCompanyWorkshop from './+state/freecompany-workshop.reducer';
import { EffectsModule } from '@ngrx/effects';
import { FreeCompanyWorkshopEffects } from './+state/free-company-workshop.effects';
import { ImportWorkshopFromPcapPopupComponent } from './import-workshop-from-pcap-popup/import-workshop-from-pcap-popup.component';
import { FlexLayoutModule } from '@angular/flex-layout';

import { CoreModule } from '../../core/core.module';
import { NzStepsModule } from 'ng-zorro-antd/steps';


@NgModule({
    imports: [
    CommonModule,
    StoreModule.forFeature(fromFreeCompanyWorkshop.freeCompanyWorkshopsFeatureKey, fromFreeCompanyWorkshop.reducer),
    EffectsModule.forFeature([FreeCompanyWorkshopEffects]),
    FlexLayoutModule,
    CoreModule,
    NzStepsModule,
    ImportWorkshopFromPcapPopupComponent
]
})
export class FreeCompanyWorkshopsModule {
}
