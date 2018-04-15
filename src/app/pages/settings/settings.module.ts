import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {SettingsComponent} from './settings/settings.component';
import {RouterModule, Routes} from '@angular/router';
import {TranslateModule} from '@ngx-translate/core';
import {MatButtonModule, MatCheckboxModule, MatFormFieldModule, MatMenuModule, MatSelectModule} from '@angular/material';
import {FormsModule} from '@angular/forms';
import {SettingsService} from './settings.service';
import {ItemLinkPipe} from './pipe/item-link.pipe';
import {FlexLayoutModule} from '@angular/flex-layout';
import {SimulatorLinkPipe} from './pipe/simulator-link.pipe';

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
    ],
    declarations: [
        SettingsComponent,
        ItemLinkPipe,
        SimulatorLinkPipe,
    ],
    providers: [
        SettingsService,
    ],
    exports: [
        ItemLinkPipe,
        SimulatorLinkPipe,
    ]
})
export class SettingsModule {
}
