import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {BetaDisclaimerPopupComponent} from './beta-disclaimer-popup/beta-disclaimer-popup.component';
import {TranslateModule} from '@ngx-translate/core';
import {MatButtonModule, MatDialogModule} from '@angular/material';
import {CoreModule} from '../../core/core.module';

@NgModule({
    imports: [
        CommonModule,

        TranslateModule,

        MatDialogModule,
        MatButtonModule,

        CoreModule,
    ],
    declarations: [
        BetaDisclaimerPopupComponent
    ],
    exports: [
        BetaDisclaimerPopupComponent
    ],
    entryComponents: [
        BetaDisclaimerPopupComponent
    ]
})
export class BetaDisclaimerModule {
}
