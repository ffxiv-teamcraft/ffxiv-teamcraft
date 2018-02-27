import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ListsComponent} from './lists/lists.component';
import {CoreModule} from '../../core/core.module';
import {CommonComponentsModule} from '../../modules/common-components/common-components.module';
import {RouterModule, Routes} from '@angular/router';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {
    MatButtonModule,
    MatDialogModule, MatExpansionModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatSelectModule, MatSnackBarModule,
    MatTooltipModule
} from '@angular/material';
import {MaintenanceGuard} from '../maintenance/maintenance.guard';
import {MergeListsPopupComponent} from './merge-lists-popup/merge-lists-popup.component';
import {BulkRegeneratePopupComponent} from './bulk-regenerate-popup/bulk-regenerate-popup.component';
import {WorkshopModule} from '../workshop/workshop.module';
import {ClipboardModule} from 'ngx-clipboard/dist';

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

        ClipboardModule,

        RouterModule.forChild(routes),

        MatInputModule,
        MatButtonModule,
        MatSelectModule,
        MatIconModule,
        MatDialogModule,
        MatListModule,
        MatTooltipModule,
        MatProgressBarModule,
        MatProgressSpinnerModule,
        MatSnackBarModule,
        MatExpansionModule,

        CoreModule,
        CommonComponentsModule,
        WorkshopModule,
    ],
    declarations: [
        ListsComponent,
        MergeListsPopupComponent,
        BulkRegeneratePopupComponent,
    ],
    entryComponents: [
        MergeListsPopupComponent,
        BulkRegeneratePopupComponent,
    ]
})
export class ListsModule {
}
