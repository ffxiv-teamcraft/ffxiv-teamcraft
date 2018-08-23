import { Component, Inject, OnInit } from '@angular/core';
import { MapService } from '../map.service';
import { MapData } from '../map-data';
import { MAT_DIALOG_DATA } from '@angular/material';
import { Observable } from 'rxjs';
import { Vector2 } from '../../../core/tools/vector2';
import { publishReplay, refCount } from 'rxjs/operators';

@Component({
  selector: 'app-map-popup',
  templateUrl: './map-popup.component.html',
  styleUrls: ['./map-popup.component.scss']
})
export class MapPopupComponent implements OnInit {

  mapData: Observable<MapData>;

  constructor(@Inject(MAT_DIALOG_DATA) public data: { coords: Vector2, id: number }, private mapService: MapService) {
  }

  ngOnInit() {
    this.mapData = this.mapService.getMapById(this.data.id).pipe(
      publishReplay(1),
      refCount()
    );
  }

}
