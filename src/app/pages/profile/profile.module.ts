import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ProfileComponent} from './profile/profile.component';
import {RouterModule, Routes} from '@angular/router';
import {ProfileGuard} from './profile.guard';
import {DatabaseModule} from '../../core/database/database.module';
import {
    MatButtonModule,
    MatCardModule, MatDialogModule,
    MatGridListModule,
    MatIconModule, MatListModule,
    MatProgressSpinnerModule,
    MatTooltipModule
} from '@angular/material';
import {TranslateModule} from '@ngx-translate/core';
import {MasterbookService} from './masterbook.service';
import {MasterbooksPopupComponent} from './masterbooks-popup/masterbooks-popup.component';
import {PipesModule} from '../../pipes/pipes.module';
import {CoreModule} from '../../core/core.module';

const routes: Routes = [{
    path: 'profile',
    component: ProfileComponent,
    canActivate: [ProfileGuard]
}];

@NgModule({
    imports: [
        CommonModule,

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

        DatabaseModule,
        PipesModule,
        CoreModule,
    ],
    declarations: [
        ProfileComponent,
        MasterbooksPopupComponent
    ],
    providers: [
        ProfileGuard,
        MasterbookService,
    ],
    entryComponents: [
        MasterbooksPopupComponent
    ]
})
export class ProfileModule {
}
