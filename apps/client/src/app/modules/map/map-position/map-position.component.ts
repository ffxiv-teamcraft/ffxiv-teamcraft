import { Component, Input } from '@angular/core';
import { MatDialog } from '@angular/material';
import { MapPopupComponent } from '../map-popup/map-popup.component';
import { Vector2 } from '../../../core/tools/vector2';

@Component({
  selector: 'app-map-position',
  templateUrl: './map-position.component.html',
  styleUrls: ['./map-position.component.less']
})
export class MapPositionComponent {

  @Input()
  marker: Vector2;

  @Input()
  zoneId: number;

  constructor(private dialog: MatDialog) {
  }

  getMarker(): Vector2 {
    return {
      x: Math.round(this.marker.x),
      y: Math.round(this.marker.y)
    };
  }

  openMap(): void {
    this.dialog.open(MapPopupComponent, { data: { coords: this.marker, id: this.zoneId } });
  }

}
