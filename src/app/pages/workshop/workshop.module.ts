import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {WorkshopPanelComponent} from './workshop-panel/workshop-panel.component';
import {MatButtonModule, MatExpansionModule, MatIconModule, MatSnackBarModule, MatTooltipModule} from '@angular/material';
import {CoreModule} from '../../core/core.module';
import {ClipboardModule} from 'ngx-clipboard/dist';
import {RouterModule} from '@angular/router';

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
    ],
    declarations: [WorkshopPanelComponent],
    exports: [WorkshopPanelComponent]
})
export class WorkshopModule {
}
