import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MapService } from './map.service';
import { HttpClientModule } from '@angular/common/http';
import { MapPositionComponent } from './map-position/map-position.component';
import { PipesModule } from '../../pipes/pipes.module';
import { CoreModule } from '../../core/core.module';
import { MapComponent } from './map/map.component';
import { NgZorroAntdModule } from 'ng-zorro-antd';
import { FlexLayoutModule } from '@angular/flex-layout';

@NgModule({
  imports: [
    CommonModule,
    HttpClientModule,
    FlexLayoutModule,

    NgZorroAntdModule,

    PipesModule,
    CoreModule
  ],
  declarations: [
    MapPositionComponent,
    MapComponent
  ],
  providers: [
    MapService
  ],
  exports: [
    MapPositionComponent,
    MapComponent
  ],
  entryComponents: [
    MapComponent
  ]
})
export class MapModule {
}
