import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MapService} from './map.service';
import {HttpClientModule} from '@angular/common/http';
import {MapPopupComponent} from './map-popup/map-popup.component';
import {MatButtonModule, MatIconModule} from '@angular/material';
import {MapPositionComponent} from './map-position/map-position.component';
import {PipesModule} from '../../pipes/pipes.module';
import {CoreModule} from '../../core/core.module';

@NgModule({
    imports: [
        CommonModule,
        HttpClientModule,
        MatIconModule,
        MatButtonModule,
        PipesModule,
        CoreModule,
    ],
    declarations: [
        MapPopupComponent,
        MapPositionComponent
    ],
    providers: [
        MapService
    ],
    exports: [
        MapPositionComponent
    ],
    entryComponents: [
        MapPopupComponent
    ]
})
export class MapModule {
}
