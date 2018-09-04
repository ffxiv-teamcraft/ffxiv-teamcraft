import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GatheringLocationComponent } from './gathering-location/gathering-location.component';
import { NgZorroAntdModule } from 'ng-zorro-antd';
import { TranslateModule } from '@ngx-translate/core';
import { CoreModule } from '../../core/core.module';
import { RouterModule, Routes } from '@angular/router';
import { MapModule } from '../../modules/map/map.module';
import { PipesModule } from '../../pipes/pipes.module';
import { ItemIconModule } from '../../modules/item-icon/item-icon.module';

const routes: Routes = [
  {
    path: '',
    component: GatheringLocationComponent
  }
];

@NgModule({
  imports: [
    CommonModule,
    CoreModule,

    RouterModule.forChild(routes),

    TranslateModule,

    MapModule,
    PipesModule,
    ItemIconModule,

    NgZorroAntdModule
  ],
  declarations: [GatheringLocationComponent]
})
export class GatheringLocationModule {
}
