import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CustomLinksComponent} from './custom-links/custom-links.component';
import {CoreModule} from '../../core/core.module';
import {
    MatButtonModule,
    MatChipsModule,
    MatDialogModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatSelectModule,
    MatSnackBarModule,
    MatTooltipModule
} from '@angular/material';
import {RouterModule, Routes} from '@angular/router';
import {MaintenanceGuard} from '../maintenance/maintenance.guard';
import {PatreonGuard} from '../../core/guard/patreon.guard';
import {CustomLinkPopupComponent} from './custom-link-popup/custom-link-popup.component';
import {FormsModule} from '@angular/forms';
import {CommonComponentsModule} from '../../modules/common-components/common-components.module';
import {TranslateModule} from '@ngx-translate/core';
import {ClipboardModule} from 'ngx-clipboard';
import {TemplateModule} from '../template/template.module';

const routes: Routes = [{
    path: '',
    component: CustomLinksComponent,
    canActivate: [MaintenanceGuard, PatreonGuard]
}];

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(routes),
        FormsModule,

        TranslateModule,
        ClipboardModule,

        MatListModule,
        MatIconModule,
        MatButtonModule,
        MatSelectModule,
        MatDialogModule,
        MatInputModule,
        MatChipsModule,
        MatSnackBarModule,
        MatTooltipModule,

        CoreModule,
        TemplateModule,
        CommonComponentsModule,
    ],
    declarations: [
        CustomLinksComponent,
        CustomLinkPopupComponent
    ],
    entryComponents: [
        CustomLinkPopupComponent
    ]
})
export class CustomLinksModule {
}
