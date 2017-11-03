import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule, Routes} from '@angular/router';
import {HomeComponent} from './home/home.component';
import {CoreModule} from '../../core/core.module';
import {DonationModule} from '../../modules/donation/donation.module';
import {MatButtonModule, MatExpansionModule} from '@angular/material';

const routes: Routes = [
    {
        path: '',
        redirectTo: '/home',
        pathMatch: 'full'
    },
    {
        path: 'home',
        component: HomeComponent
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
    ],
    declarations: [
        HomeComponent
    ]
})
export class HomeModule {
}
