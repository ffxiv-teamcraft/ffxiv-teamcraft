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
    MatSelectModule
} from '@angular/material';
import {RouterModule, Routes} from '@angular/router';
import {MaintenanceGuard} from '../maintenance/maintenance.guard';
import {PatreonGuard} from '../../core/guard/patreon.guard';
import {CustomLinkPopupComponent} from './custom-link-popup/custom-link-popup.component';
import {FormsModule} from '@angular/forms';
import {CommonComponentsModule} from '../../modules/common-components/common-components.module';

const routes: Routes = [{
    path: 'custom-links',
    component: CustomLinksComponent,
    canActivate: [MaintenanceGuard, PatreonGuard]
}];

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(routes),
        FormsModule,

        MatListModule,
        MatIconModule,
        MatButtonModule,
        MatSelectModule,
        MatDialogModule,
        MatInputModule,
        MatChipsModule,

        CoreModule,
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
