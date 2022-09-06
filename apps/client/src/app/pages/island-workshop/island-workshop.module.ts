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

const routes: Routes = [
  {
    path: '',
    component: IslandWorkshopComponent
  }
]


@NgModule({
  declarations: [
    IslandWorkshopComponent
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
    NzCardModule
  ]
})
export class IslandWorkshopModule { }
