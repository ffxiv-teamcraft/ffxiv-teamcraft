import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {SettingsComponent} from './settings/settings.component';
import {RouterModule, Routes} from '@angular/router';
import {TranslateModule} from '@ngx-translate/core';
import {
    MatButtonModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatMenuModule,
    MatProgressBarModule,
    MatSelectModule,
    MatSlideToggleModule
} from '@angular/material';
import {FormsModule} from '@angular/forms';
import {SettingsService} from './settings.service';
import {ItemLinkPipe} from './pipe/item-link.pipe';
import {FlexLayoutModule} from '@angular/flex-layout';

const routing: Routes = [
    {
        path: 'settings',
        component: SettingsComponent
    }
];

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        FlexLayoutModule,

        RouterModule.forChild(routing),

        TranslateModule,

        MatSelectModule,
        MatFormFieldModule,
        MatCheckboxModule,
        MatMenuModule,
        MatButtonModule,
        MatSlideToggleModule,
        MatProgressBarModule,
    ],
    declarations: [
        SettingsComponent,
        ItemLinkPipe,
    ],
    providers: [
        SettingsService,
    ],
    exports: [
        ItemLinkPipe,
    ]
})
export class SettingsModule {
}
