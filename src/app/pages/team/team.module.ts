import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {TeamComponent} from './team/team.component';
import {RouterModule, Routes} from '@angular/router';
import {
    MatButtonModule,
    MatDialogModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTooltipModule
} from '@angular/material';
import {TranslateModule} from '@ngx-translate/core';
import {CoreModule} from '../../core/core.module';
import {NewTeamPopupComponent} from './new-team-popup/new-team-popup.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

const routing: Routes = [
    {
        path: '',
        component: TeamComponent
    }
];

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,

        TranslateModule,
        CoreModule,

        RouterModule.forChild(routing),

        MatExpansionModule,
        MatProgressSpinnerModule,
        MatDialogModule,
        MatSnackBarModule,
        MatListModule,
        MatIconModule,
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        MatTooltipModule,
    ],
    declarations: [
        TeamComponent,
        NewTeamPopupComponent
    ],
    entryComponents: [
        NewTeamPopupComponent
    ]
})
export class TeamModule {
}
