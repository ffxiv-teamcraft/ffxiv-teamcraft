import {Component, Input} from '@angular/core';
import {MatDialog} from '@angular/material';
import {MapPopupComponent} from '../map-popup/map-popup.component';

@Component({
    selector: 'app-map-position',
    templateUrl: './map-position.component.html',
    styleUrls: ['./map-position.component.scss']
})
export class MapPositionComponent {

    @Input()
    marker: { x: number, y: number };

    @Input()
    zoneId: number;

    constructor(private dialog: MatDialog) {
    }

    getMarker(): { x: number, y: number } {
        return {
            x: Math.round(this.marker.x),
            y: Math.round(this.marker.y)
        };
    }

    openMap(): void {
        this.dialog.open(MapPopupComponent, {data: {coords: this.marker, id: this.zoneId}});
    }

}
