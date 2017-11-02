import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {PricingComponent} from './pricing/pricing.component';
import {PricingService} from './pricing.service';
import {
    MatButtonModule,
    MatCardModule,
    MatExpansionModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatTooltipModule
} from '@angular/material';
import {CoreModule} from '../core/core.module';
import {PricingRowComponent} from './pricing-row/pricing-row.component';
import {FormsModule} from '@angular/forms';
import {FlexLayoutModule} from '@angular/flex-layout';
import {PipesModule} from '../pipe/pipes.module';

@NgModule({
    imports: [
        CoreModule,
        CommonModule,
        MatCardModule,
        MatExpansionModule,
        MatListModule,
        MatInputModule,
        MatButtonModule,
        MatIconModule,
        MatTooltipModule,
        FormsModule,
        FlexLayoutModule,
        PipesModule,
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
