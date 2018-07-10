import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {PublicListsComponent} from './public-lists/public-lists.component';
import {RouterModule, Routes} from '@angular/router';
import {
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatSelectModule
} from '@angular/material';
import {CoreModule} from '../../core/core.module';
import {DatabaseModule} from '../../core/database/database.module';
import {CommonComponentsModule} from '../../modules/common-components/common-components.module';
import {FormsModule} from '@angular/forms';
import {MaintenanceGuard} from '../maintenance/maintenance.guard';

const routes: Routes = [{
    path: '',
    component: PublicListsComponent,
    canActivate: [MaintenanceGuard]
}];

@NgModule({
    imports: [
        CommonModule,
        FormsModule,

        CoreModule,
        DatabaseModule,
        CommonComponentsModule,

        RouterModule.forChild(routes),

        MatListModule,
        MatButtonModule,
        MatSelectModule,
        MatIconModule,
        MatInputModule,
        MatProgressSpinnerModule,
        MatPaginatorModule,
    ],
    declarations: [PublicListsComponent]
})
export class PublicListsModule {
}
