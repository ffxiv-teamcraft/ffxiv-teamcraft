import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MapService } from './map.service';
import { HttpClientModule } from '@angular/common/http';
import { MapPopupComponent } from './map-popup/map-popup.component';
import { MatButtonModule, MatIconModule, MatTooltipModule } from '@angular/material';
import { MapPositionComponent } from './map-position/map-position.component';
import { PipesModule } from '../../pipes/pipes.module';
import { CoreModule } from '../../core/core.module';
import { MapComponent } from './map/map.component';

@NgModule({
  imports: [
    CommonModule,
    HttpClientModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    PipesModule,
    CoreModule
  ],
  declarations: [
    MapPopupComponent,
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
    MapPopupComponent
  ]
})
export class MapModule {
}
