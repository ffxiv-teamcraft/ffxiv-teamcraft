import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {AddItemComponent} from './add-item/add-item.component';
import {RouterModule, Routes} from '@angular/router';
import {DatabaseModule} from '../../core/database/database.module';
import {CoreModule} from '../../core/core.module';
import {TranslateModule} from '@ngx-translate/core';
import {MatProgressSpinnerModule} from '@angular/material';
import {FormsModule} from '@angular/forms';
import {MaintenanceGuard} from '../maintenance/maintenance.guard';

const routes: Routes = [{
    path: '',
    children: [
        {
            path: ':importString',
            component: AddItemComponent,
            canActivate: [MaintenanceGuard]
        }
    ]
}];

@NgModule({
    imports: [
        CommonModule,
        FormsModule,

        TranslateModule,

        RouterModule.forChild(routes),

        DatabaseModule,
        CoreModule,

        MatProgressSpinnerModule,
    ],
    declarations: [
        AddItemComponent
    ]
})
export class AddItemModule {
}
