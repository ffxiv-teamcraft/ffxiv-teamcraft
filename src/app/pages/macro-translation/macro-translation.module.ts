import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MacroTranslationComponent} from './macro-translation/macro-translation.component';
import {RouterModule, Routes} from '@angular/router';
import {MaintenanceGuard} from '../maintenance/maintenance.guard';
import {MatButtonModule, MatIconModule, MatInputModule, MatSelectModule, MatTabsModule} from '@angular/material';
import {TranslateModule} from '@ngx-translate/core';
import {FormsModule} from '@angular/forms';

const routes: Routes = [
    {
        path: '',
        component: MacroTranslationComponent,
        canActivate: [MaintenanceGuard]
    },
];

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(routes),

        TranslateModule,
        MatInputModule,
        MatIconModule,
        MatSelectModule,
        MatTabsModule,
        FormsModule,
        MatButtonModule
    ],
    declarations: [MacroTranslationComponent]
})
export class MacroTranslationModule {
}
