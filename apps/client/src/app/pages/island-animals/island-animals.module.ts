import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IslandAnimalsComponent } from './island-animals/island-animals.component';
import { RouterModule, Routes } from '@angular/router';
import { NzTableModule } from 'ng-zorro-antd/table';
import { TranslateModule } from '@ngx-translate/core';
import { PipesModule } from '../../pipes/pipes.module';
import { MapModule } from '../../modules/map/map.module';
import { CoreModule } from '../../core/core.module';
import { AlarmButtonModule } from '../../modules/alarm-button/alarm-button.module';
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';

const routes: Routes = [
  {
    path: '',
    component: IslandAnimalsComponent
  }
];

@NgModule({
  declarations: [
    IslandAnimalsComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    NzTableModule,
    TranslateModule,
    PipesModule,
    MapModule,
    CoreModule,
    AlarmButtonModule,
    NzPageHeaderModule
  ]
})
export class IslandAnimalsModule {
}
