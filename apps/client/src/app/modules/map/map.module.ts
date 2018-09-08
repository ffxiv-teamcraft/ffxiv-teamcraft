import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MapService } from './map.service';
import { HttpClientModule } from '@angular/common/http';
import { MatButtonModule, MatIconModule, MatTooltipModule } from '@angular/material';
import { MapPositionComponent } from './map-position/map-position.component';
import { PipesModule } from '../../pipes/pipes.module';
import { CoreModule } from '../../core/core.module';
import { MapComponent } from './map/map.component';
import { NgZorroAntdModule } from 'ng-zorro-antd';

@NgModule({
  imports: [
    CommonModule,
    HttpClientModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,

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
    MapComponent
  ],
  entryComponents: [
    MapComponent
  ]
})
export class MapModule {
}
