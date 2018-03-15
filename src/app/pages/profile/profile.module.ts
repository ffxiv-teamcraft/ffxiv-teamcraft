import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ProfileComponent} from './profile/profile.component';
import {RouterModule, Routes} from '@angular/router';
import {ProfileGuard} from './profile.guard';
import {DatabaseModule} from '../../core/database/database.module';
import {
    MatButtonModule,
    MatCardModule,
    MatDialogModule,
    MatGridListModule,
    MatIconModule, MatInputModule,
    MatListModule,
    MatProgressSpinnerModule,
    MatTooltipModule
} from '@angular/material';
import {TranslateModule} from '@ngx-translate/core';
import {MasterbookService} from './masterbook.service';
import {MasterbooksPopupComponent} from './masterbooks-popup/masterbooks-popup.component';
import {PipesModule} from '../../pipes/pipes.module';
import {CoreModule} from '../../core/core.module';
import {MaintenanceGuard} from '../maintenance/maintenance.guard';
import {ProfileHelpComponent} from './profile-help/profile-help.component';
import {PublicProfileComponent} from './public-profile/public-profile.component';
import {CommonComponentsModule} from '../../modules/common-components/common-components.module';
import {FlexLayoutModule} from '@angular/flex-layout';
import {ChangeEmailPopupComponent} from './change-email-popup/change-email-popup.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

const routes: Routes = [{
    path: 'profile',
    component: ProfileComponent,
    canActivate: [ProfileGuard, MaintenanceGuard]
}, {
    path: 'profile/:id',
    component: PublicProfileComponent,
    canActivate: [MaintenanceGuard]
}];

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,

        RouterModule.forChild(routes),
        TranslateModule,

        MatTooltipModule,
        MatProgressSpinnerModule,
        MatGridListModule,
        MatCardModule,
        MatButtonModule,
        MatIconModule,
        MatDialogModule,
        MatListModule,
        MatInputModule,

        FlexLayoutModule,

        DatabaseModule,
        PipesModule,
        CoreModule,
        CommonComponentsModule,
    ],
    declarations: [
        ProfileComponent,
        MasterbooksPopupComponent,
        ProfileHelpComponent,
        PublicProfileComponent,
        ChangeEmailPopupComponent,
    ],
    providers: [
        ProfileGuard,
        MasterbookService,
    ],
    entryComponents: [
        MasterbooksPopupComponent,
        ProfileHelpComponent,
        ChangeEmailPopupComponent,
    ]
})
export class ProfileModule {
}
