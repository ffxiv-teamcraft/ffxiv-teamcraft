import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule, Routes} from '@angular/router';
import {HomeComponent} from './home/home.component';
import {CoreModule} from '../../core/core.module';
import {DonationModule} from '../../modules/donation/donation.module';
import {MatButtonModule, MatCardModule, MatExpansionModule, MatGridListModule, MatIconModule} from '@angular/material';
import {MaintenanceGuard} from '../maintenance/maintenance.guard';

const routes: Routes = [
    {
        path: '',
        redirectTo: '/home',
        pathMatch: 'full'
    },
    {
        path: 'home',
        component: HomeComponent,
        canActivate: [MaintenanceGuard]
    },
];

@NgModule({
    imports: [
        CommonModule,
        CoreModule,

        RouterModule.forChild(routes),

        DonationModule,
        MatExpansionModule,
        MatButtonModule,
        MatGridListModule,
        MatCardModule,
        MatIconModule,
    ],
    declarations: [
        HomeComponent
    ]
})
export class HomeModule {
}
