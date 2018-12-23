import { ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MapService } from './map.service';
import { HttpClientModule } from '@angular/common/http';
import { MapPositionComponent } from './map-position/map-position.component';
import { PipesModule } from '../../pipes/pipes.module';
import { CoreModule } from '../../core/core.module';
import { MapComponent } from './map/map.component';
import { NgZorroAntdModule } from 'ng-zorro-antd';
import { FlexLayoutModule } from '@angular/flex-layout';
import { XivapiClientModule } from '@xivapi/angular-client';
import { NavigationMapComponent } from './navigation-map/navigation-map.component';

@NgModule({
  imports: [
    CommonModule,
    HttpClientModule,
    FlexLayoutModule,
    XivapiClientModule,

    NgZorroAntdModule,

    PipesModule,
    CoreModule
  ],
  declarations: [
    MapPositionComponent,
    MapComponent,
    NavigationMapComponent
  ],
  exports: [
    MapPositionComponent,
    MapComponent
  ],
  entryComponents: [
    MapComponent,
    NavigationMapComponent
  ]
})
export class MapModule {

  static forRoot(): ModuleWithProviders {
    return {
      ngModule: MapModule,
      providers: [
        MapService
      ]
    };
  }
}
