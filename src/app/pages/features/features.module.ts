import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FeaturesComponent} from './features/features.component';
import {RouterModule, Routes} from '@angular/router';
import {MatExpansionModule} from '@angular/material';
import {TranslateModule} from '@ngx-translate/core';
import {MaintenanceGuard} from '../maintenance/maintenance.guard';

const routes: Routes = [
    {
        path: 'features',
        component: FeaturesComponent,
        canActivate: [MaintenanceGuard]
    },
];

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(routes),
        TranslateModule,

        MatExpansionModule,
    ],
    declarations: [
        FeaturesComponent
    ]
})
export class FeaturesModule {
}
