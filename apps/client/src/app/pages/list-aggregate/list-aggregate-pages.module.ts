import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ListAggregateComponent } from './list-aggregate/list-aggregate.component';
import { RouterModule, Routes } from '@angular/router';
import { ListAggregateHomeComponent } from './list-aggregate-home/list-aggregate-home.component';
import { NzTransferModule } from 'ng-zorro-antd/transfer';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { TranslateModule } from '@ngx-translate/core';
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { FormsModule } from '@angular/forms';
import { ListModule } from '../../modules/list/list.module';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { ListAggregateModule } from '../../modules/list-aggregate/list-aggregate.module';

const routes: Routes = [
  {
    path: '',
    component: ListAggregateHomeComponent
  },
  {
    path: 'saved/:aggregateId',
    component: ListAggregateComponent
  },
  {
    path: 'saved/:aggregateId/:panelTitle',
    component: ListAggregateComponent
  },
  {
    path: ':listIds/:layoutId',
    component: ListAggregateComponent
  },
  {
    path: ':listIds/:layoutId/:panelTitle',
    component: ListAggregateComponent
  }
];

@NgModule({
  declarations: [
    ListAggregateComponent,
    ListAggregateHomeComponent
  ],
  imports: [
    CommonModule,
    FormsModule,

    RouterModule.forChild(routes),
    NzTransferModule,
    NzTableModule,
    NzTagModule,
    TranslateModule,
    NzPageHeaderModule,
    NzInputModule,
    NzSelectModule,
    NzButtonModule,
    ListModule,
    NzAlertModule,
    NzIconModule
  ]
})
export class ListAggregatePagesModule {
}
