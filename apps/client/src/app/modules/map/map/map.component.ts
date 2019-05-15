import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MapData } from '../map-data';
import { Observable, ReplaySubject } from 'rxjs';
import { MapService } from '../map.service';
import { switchMap } from 'rxjs/operators';
import { MapMarker } from '../map-marker';
import { Vector2 } from '../../../core/tools/vector2';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.less']
})
export class MapComponent implements OnInit {

  @Input()
  public set mapId(id: number) {
    this._mapId = id;
    this.mapId$.next(id);
  }

  public get mapId(): number {
    return this._mapId;
  }

  private mapId$: ReplaySubject<number> = new ReplaySubject<number>();

  private _mapId: number;

  @Input()
  markers: MapMarker[] = [];

  @Input()
  hideDbButton = false;

  mapData: Observable<MapData>;

  position: Vector2 = { x: 0, y: 0 };

  @Output()
  loaded: EventEmitter<void> = new EventEmitter<void>();

  constructor(private mapService: MapService) {
  }

  ngOnInit() {
    this.mapData = this.mapId$.pipe(
      switchMap(mapId => {
        return this.mapService.getMapById(mapId);
      })
    );
  }

  getMarkerStyle(map: MapData, marker: MapMarker, offset = { x: 0, y: 0 }): any {
    const positionPercents = this.mapService.getPositionOnMap(map, marker);
    return {
      top: `${positionPercents.y + offset.y}%`,
      left: `${positionPercents.x + offset.y}%`,
      'z-index': marker.zIndex || 5,
      ...(marker.additionalStyle || {})
    };
  }

  getIcon(type: number): string {
    return `./assets/icons/Aetheryte${type === 1 ? '_Shard' : ''}.png`;
  }

}
