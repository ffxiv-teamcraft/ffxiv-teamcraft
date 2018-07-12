import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ProfileComponent} from './profile/profile.component';
import {RouterModule, Routes} from '@angular/router';
import {ProfileGuard} from './profile.guard';
import {DatabaseModule} from '../../core/database/database.module';
import {
    MatButtonModule,
    MatCardModule,
    MatCheckboxModule,
    MatDialogModule,
    MatGridListModule,
    MatIconModule,
    MatInputModule,
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
import {PatreonLinkPopupComponent} from './patreon-link-popup/patreon-link-popup.component';
import {NicknamePopupComponent} from './nickname-popup/nickname-popup.component';
import {StatsEditPopupComponent} from './stats-edit-popup/stats-edit-popup.component';
import {CommissionBoardModule} from '../commission-board/commission-board.module';

const routes: Routes = [{
    path: '',
    children: [
        {
            path: '',
            component: ProfileComponent,
            canActivate: [ProfileGuard, MaintenanceGuard]
        }, {
            path: 'profile/:id',
            component: PublicProfileComponent,
            canActivate: [MaintenanceGuard]
        }
    ]
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
        MatCheckboxModule,

        FlexLayoutModule,

        DatabaseModule,
        PipesModule,
        CoreModule,
        CommonComponentsModule,
        CommissionBoardModule
    ],
    declarations: [
        ProfileComponent,
        MasterbooksPopupComponent,
        ProfileHelpComponent,
        PublicProfileComponent,
        ChangeEmailPopupComponent,
        PatreonLinkPopupComponent,
        NicknamePopupComponent,
        StatsEditPopupComponent,
    ],
    providers: [
        ProfileGuard,
        MasterbookService,
    ],
    entryComponents: [
        MasterbooksPopupComponent,
        ProfileHelpComponent,
        ChangeEmailPopupComponent,
        PatreonLinkPopupComponent,
        NicknamePopupComponent,
        StatsEditPopupComponent,
    ]
})
export class ProfileModule {
}
