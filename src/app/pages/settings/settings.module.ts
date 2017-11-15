import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {SettingsComponent} from './settings/settings.component';
import {RouterModule, Routes} from '@angular/router';
import {TranslateModule} from '@ngx-translate/core';
import {MatCheckboxModule, MatFormFieldModule, MatSelectModule} from '@angular/material';
import {FormsModule} from '@angular/forms';
import {SettingsService} from './settings.service';
import {ItemLinkPipe} from './pipe/item-link.pipe';

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

        RouterModule.forChild(routing),

        TranslateModule,

        MatSelectModule,
        MatFormFieldModule,
        MatCheckboxModule
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
