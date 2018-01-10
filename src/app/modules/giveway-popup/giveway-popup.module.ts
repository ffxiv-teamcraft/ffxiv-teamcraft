import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {GivewayPopupComponent} from './giveway-popup/giveway-popup.component';
import {TranslateModule} from '@ngx-translate/core';
import {MatButtonModule, MatDialogModule} from '@angular/material';

@NgModule({
    imports: [
        CommonModule,

        MatButtonModule,
        MatDialogModule,

        TranslateModule,
    ],
    declarations: [GivewayPopupComponent],
    entryComponents: [GivewayPopupComponent]
})
export class GivewayPopupModule {
}
