import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {PricingComponent} from './pricing/pricing.component';
import {PricingService} from './pricing.service';
import {
    MatButtonModule,
    MatCardModule,
    MatCheckboxModule,
    MatExpansionModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatSlideToggleModule,
    MatSnackBarModule,
    MatTooltipModule
} from '@angular/material';
import {CoreModule} from '../../core/core.module';
import {PricingRowComponent} from './pricing-row/pricing-row.component';
import {FormsModule} from '@angular/forms';
import {FlexLayoutModule} from '@angular/flex-layout';
import {PipesModule} from '../../pipes/pipes.module';
import {CopyableNameModule} from '../copyable-name/copyable-name.module';
import {TranslateModule} from '@ngx-translate/core';

@NgModule({
    imports: [
        CoreModule,
        CommonModule,

        MatCardModule,
        MatCheckboxModule,
        MatExpansionModule,
        MatListModule,
        MatInputModule,
        MatButtonModule,
        MatIconModule,
        MatTooltipModule,
        MatSlideToggleModule,
        MatSnackBarModule,

        TranslateModule,

        FormsModule,
        FlexLayoutModule,
        PipesModule,
        CopyableNameModule,
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
