import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FavoritesComponent} from './favorites/favorites.component';
import {CoreModule} from '../../core/core.module';
import {RouterModule, Routes} from '@angular/router';
import {CommonComponentsModule} from '../../modules/common-components/common-components.module';
import {MaintenanceGuard} from '../maintenance/maintenance.guard';
import {MatListModule} from '@angular/material';

const routes: Routes = [
    {
        path: 'favorites',
        component: FavoritesComponent,
        canActivate: [MaintenanceGuard]
    },
];

@NgModule({
    imports: [
        CommonModule,

        RouterModule.forChild(routes),

        MatListModule,

        CoreModule,
        CommonComponentsModule,
    ],
    declarations: [
        FavoritesComponent
    ]
})
export class FavoritesModule {
}
