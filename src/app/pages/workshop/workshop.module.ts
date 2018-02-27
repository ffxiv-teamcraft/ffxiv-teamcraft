import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatButtonModule, MatExpansionModule, MatIconModule, MatSnackBarModule, MatTooltipModule} from '@angular/material';
import {CoreModule} from '../../core/core.module';
import {ClipboardModule} from 'ngx-clipboard/dist';
import {RouterModule} from '@angular/router';
import {CommonComponentsModule} from '../../modules/common-components/common-components.module';

@NgModule({
    imports: [
        CommonModule,
        RouterModule,

        MatExpansionModule,
        MatSnackBarModule,

        ClipboardModule,
        MatTooltipModule,
        MatIconModule,
        MatButtonModule,

        CoreModule,
        CommonComponentsModule,
    ],
    declarations: [],
    exports: []
})
export class WorkshopModule {
}
