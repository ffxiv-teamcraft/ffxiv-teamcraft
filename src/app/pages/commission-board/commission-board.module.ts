import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CommissionBoardComponent} from './commission-board/commission-board.component';
import {RouterModule, Routes} from '@angular/router';
import {MaintenanceGuard} from '../maintenance/maintenance.guard';
import {CoreModule} from '../../core/core.module';
import {TranslateModule} from '@ngx-translate/core';
import {MyRequestsComponent} from './my-requests/my-requests.component';
import {MyCraftsComponent} from './my-crafts/my-crafts.component';
import {BoardComponent} from './board/board.component';
import {CommissionCreationPopupComponent} from './commission-creation-popup/commission-creation-popup.component';
import {CommissionPanelComponent} from './commission-panel/commission-panel.component';
import {CommissionDetailsComponent} from './commission-details/commission-details.component';
import {FormsModule} from '@angular/forms';
import {PipesModule} from '../../pipes/pipes.module';
import {SettingsModule} from '../settings/settings.module';
import {TooltipModule} from '../../modules/tooltip/tooltip.module';
import {CommissionChatComponent} from './commission-chat/commission-chat.component';
import {RatingPopupComponent} from './rating-popup/rating-popup.component';
import {HistoryComponent} from './history/history.component';
import {RatingComponent} from './rating/rating.component';
import {
    MatBadgeModule,
    MatButtonModule,
    MatCardModule,
    MatChipsModule,
    MatDialogModule,
    MatExpansionModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatMenuModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatTabsModule,
    MatTooltipModule,
    MatCheckboxModule
} from '@angular/material';

const routes: Routes = [
    {
        path: 'commissions',
        component: CommissionBoardComponent,
        canActivate: [MaintenanceGuard],
        children: [
            {
                path: 'board',
                component: BoardComponent,
            },
            {
                path: 'my-requests',
                component: MyRequestsComponent,
            },
            {
                path: 'my-crafts',
                component: MyCraftsComponent,
            },
            {
                path: 'history',
                component: HistoryComponent,
            }
        ]
    },
    {
        path: 'commission/:serverName/:id',
        component: CommissionDetailsComponent,
        canActivate: [MaintenanceGuard]
    },
    {
        path: 'commission/:serverName/:id/chat/:crafterId',
        component: CommissionChatComponent,
        canActivate: [MaintenanceGuard]
    }
];

@NgModule({
    imports: [
        CommonModule,
        FormsModule,

        TranslateModule,

        RouterModule.forChild(routes),

        MatTabsModule,
        MatExpansionModule,
        MatDialogModule,
        MatInputModule,
        MatButtonModule,
        MatCardModule,
        MatProgressSpinnerModule,
        MatChipsModule,
        MatListModule,
        MatIconModule,
        MatTooltipModule,
        MatMenuModule,
        MatBadgeModule,
        MatProgressBarModule,
        MatCheckboxModule,

        CoreModule,
        PipesModule,
        SettingsModule,
        TooltipModule,
    ],
    declarations: [
        CommissionBoardComponent,
        MyRequestsComponent,
        MyCraftsComponent,
        BoardComponent,
        CommissionCreationPopupComponent,
        CommissionPanelComponent,
        CommissionDetailsComponent,
        CommissionChatComponent,
        RatingPopupComponent,
        HistoryComponent,
        RatingComponent
    ],
    entryComponents: [
        CommissionCreationPopupComponent,
        RatingPopupComponent
    ],
    exports: [
        RatingComponent
    ]
})
export class CommissionBoardModule {
}
