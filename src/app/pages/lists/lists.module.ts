import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ListsComponent} from './lists/lists.component';
import {CoreModule} from '../../core/core.module';
import {CommonComponentsModule} from '../../modules/common-components/common-components.module';
import {RouterModule, Routes} from '@angular/router';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {
    MatButtonModule, MatDialogModule, MatIconModule, MatInputModule, MatListModule, MatSelectModule,
    MatTooltipModule
} from '@angular/material';
import {MaintenanceGuard} from '../maintenance/maintenance.guard';
import {MergeListsPopupComponent} from './merge-lists-popup/merge-lists-popup.component';

const routes: Routes = [
    {
        path: 'lists',
        component: ListsComponent,
        canActivate: [MaintenanceGuard]
    },
];

@NgModule({
    imports: [
        CommonModule,
        ReactiveFormsModule,
        FormsModule,

        RouterModule.forChild(routes),

        MatInputModule,
        MatButtonModule,
        MatSelectModule,
        MatIconModule,
        MatDialogModule,
        MatListModule,
        MatTooltipModule,

        CoreModule,
        CommonComponentsModule,
    ],
    declarations: [
        ListsComponent,
        MergeListsPopupComponent
    ],
    entryComponents: [
        MergeListsPopupComponent
    ]
})
export class ListsModule {
}
