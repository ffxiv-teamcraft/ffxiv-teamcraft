import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {AddItemComponent} from './add-item/add-item.component';
import {RouterModule, Routes} from '@angular/router';
import {DatabaseModule} from '../../core/database/database.module';
import {CoreModule} from '../../core/core.module';
import {TranslateModule} from '@ngx-translate/core';
import {PipesModule} from '../../pipes/pipes.module';
import {
    MatButtonModule,
    MatCardModule,
    MatDialogModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatSnackBarModule
} from '@angular/material';
import {FormsModule} from '@angular/forms';
import {CommonComponentsModule} from '../../modules/common-components/common-components.module';
import {MaintenanceGuard} from '../maintenance/maintenance.guard';

const routes: Routes = [{
    path: 'add-item/:importString',
    component: AddItemComponent,
    canActivate: [MaintenanceGuard]
}];

@NgModule({
    imports: [
        CommonModule,
        FormsModule,

        TranslateModule,

        RouterModule.forChild(routes),

        DatabaseModule,
        CoreModule,
        PipesModule,
        CommonComponentsModule,

        MatSelectModule,
        MatIconModule,
        MatButtonModule,
        MatDialogModule,
        MatSnackBarModule,
        MatInputModule,
        MatCardModule,
    ],
    declarations: [
        AddItemComponent
    ]
})
export class AddItemModule {
}
