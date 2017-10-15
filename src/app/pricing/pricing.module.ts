import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {PricingComponent} from './pricing/pricing.component';
import {PricingService} from './pricing.service';
import {MdExpansionModule, MdInputModule, MdListModule} from '@angular/material';
import {CoreModule} from '../core/core.module';
import { PricingRowComponent } from './pricing-row/pricing-row.component';
import {FormsModule} from '@angular/forms';

@NgModule({
    imports: [
        CoreModule,
        CommonModule,
        MdExpansionModule,
        MdListModule,
        MdInputModule,
        FormsModule,
    ],
    declarations: [
        PricingComponent,
        PricingRowComponent
    ],
    providers: [
        PricingService
    ],
    exports: [
        PricingComponent
    ]
})
export class PricingModule {
}
