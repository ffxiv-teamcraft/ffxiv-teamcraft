import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IslandWorkshopComponent } from './island-workshop/island-workshop.component';
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';
import { TranslateModule } from '@ngx-translate/core';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { RouterModule, Routes } from '@angular/router';
import { NzTableModule } from 'ng-zorro-antd/table';
import { ItemIconModule } from '../../modules/item-icon/item-icon.module';
import { CoreModule } from '../../core/core.module';
import { FlexModule } from '@angular/flex-layout';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { FormsModule } from '@angular/forms';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { WorkshopPlanningComponent } from './workshop-planning/workshop-planning.component';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzSwitchModule } from 'ng-zorro-antd/switch';

const routes: Routes = [
  {
    path: '',
    component: IslandWorkshopComponent
  }
]


@NgModule({
  declarations: [
    IslandWorkshopComponent,
    WorkshopPlanningComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    NzPageHeaderModule,
    TranslateModule,
    NzAlertModule,
    RouterModule.forChild(routes),
    NzTableModule,
    ItemIconModule,
    CoreModule,
    FlexModule,
    NzCheckboxModule,
    NzSelectModule,
    NzCardModule,
    NzInputModule,
    NzInputNumberModule,
    NzDividerModule,
    NzEmptyModule,
    NzSwitchModule
  ]
})
export class IslandWorkshopModule { }
