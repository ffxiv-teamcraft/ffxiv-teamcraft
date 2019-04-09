import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MapData } from '../map-data';
import { Observable, ReplaySubject } from 'rxjs';
import { MapService } from '../map.service';
import { Vector2 } from '../../../core/tools/vector2';
import { switchMap } from 'rxjs/internal/operators/switchMap';

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
  markers: Vector2[] = [];

  mapData: Observable<MapData>;

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

  getMarkerPosition(map: MapData, marker: Vector2, offset = { x: 0, y: 0 }): { top: string, left: string } {
    const positionPercents = this.mapService.getPositionOnMap(map, marker);
    return { top: `${positionPercents.y + offset.y}%`, left: `${positionPercents.x + offset.y}%` };
  }

  getIcon(type: 0 | 1): string {
    return `./assets/icons/Aetheryte${type === 1 ? '_Shard' : ''}.png`;
  }

}
