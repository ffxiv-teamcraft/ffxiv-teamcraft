import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CommissionBoardComponent} from './commission-board/commission-board.component';
import {RouterModule, Routes} from '@angular/router';
import {MaintenanceGuard} from '../maintenance/maintenance.guard';
import {CoreModule} from '../../core/core.module';
import {TranslateModule} from '@ngx-translate/core';
import {MatExpansionModule, MatTabsModule} from '@angular/material';
import {MyRequestsComponent} from './my-requests/my-requests.component';
import {MyCraftsComponent} from './my-crafts/my-crafts.component';
import {BoardComponent} from './board/board.component';

const routes: Routes = [{
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
        }
    ]
}];

@NgModule({
    imports: [
        CommonModule,

        TranslateModule,

        RouterModule.forChild(routes),

        MatTabsModule,
        MatExpansionModule,

        CoreModule,
    ],
    declarations: [
        CommissionBoardComponent,
        MyRequestsComponent,
        MyCraftsComponent,
        BoardComponent
    ]
})
export class CommissionBoardModule {
}
