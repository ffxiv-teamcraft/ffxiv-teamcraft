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

  @Input()
  aetheryteZIndex = 5;

  mapData$: Observable<MapData>;

  position: Vector2 = { x: 0, y: 0 };

  @Output()
  loaded: EventEmitter<void> = new EventEmitter<void>();

  constructor(private mapService: MapService) {
  }

  ngOnInit() {
    this.mapData$ = this.mapId$.pipe(
      switchMap(mapId => {
        return this.mapService.getMapById(mapId);
      })
    );
  }

  getMarkerStyle(map: MapData, marker: MapMarker, aetheryte = false): any {
    const positionPercents = this.mapService.getPositionOnMap(map, marker);
    marker.size = marker.size || {
      x: 32,
      y: 32
    };

    if (!marker.iconType) {
      marker.size = {
        x: 0,
        y: 0
      };
    }
    return {
      top: `${positionPercents.y}%`,
      left: `${positionPercents.x}%`,
      'margin-top': `-${marker.size.y / 2}px`,
      'margin-left': `-${marker.size.x / 2}px`,
      'z-index': marker.zIndex || aetheryte ? this.aetheryteZIndex : 5,
      ...(marker.additionalStyle || {})
    };
  }

  getMapRangeStyle(map: MapData, mapRange: any): any {
    const positionPercents = this.mapService.getPositionOnMap(map, mapRange.position);
    return {
      top: `${positionPercents.y}%`,
      left: `${positionPercents.x}%`,
      'z-index': 10
    };
  }

  getIcon(type: number): string {
    return `./assets/icons/Aetheryte${type === 1 ? '_Shard' : ''}.png`;
  }

}
