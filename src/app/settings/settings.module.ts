import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {SettingsComponent} from './settings/settings.component';
import {RouterModule, Routes} from '@angular/router';
import {TranslateModule} from '@ngx-translate/core';
import {MdFormFieldModule, MdSelectModule} from '@angular/material';
import {FormsModule} from '@angular/forms';
import {SettingsService} from './settings.service';
import { ItemLinkPipe } from './pipe/item-link.pipe';

const routing: Routes = [
    {
        path: 'settings',
        component: SettingsComponent
    }
];

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(routing),
        TranslateModule,
        MdSelectModule,
        MdFormFieldModule,
        FormsModule,
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
