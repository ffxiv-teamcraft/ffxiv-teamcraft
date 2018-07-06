import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {TeamComponent} from './team.component';
import {RouterModule, Routes} from '@angular/router';
import {MatExpansionModule, MatProgressSpinnerModule} from '@angular/material';
import {TranslateModule} from '@ngx-translate/core';
import {CoreModule} from '../../core/core.module';

const routing: Routes = [
    {
        path: 'teams',
        component: TeamComponent
    }
];

@NgModule({
    imports: [
        CommonModule,

        TranslateModule,
        CoreModule,

        RouterModule.forChild(routing),

        MatExpansionModule,
        MatProgressSpinnerModule,
    ],
    declarations: [TeamComponent]
})
export class TeamModule {
}
