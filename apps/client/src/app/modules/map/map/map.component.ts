import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MapData } from '../map-data';
import { Observable, ReplaySubject } from 'rxjs';
import { MapService } from '../map.service';
import { switchMap } from 'rxjs/operators';
import { MapMarker } from '../map-marker';
import { Vector2 } from '@ffxiv-teamcraft/types';
import { I18nRowPipe } from '../../../core/i18n/i18n-row.pipe';
import { TranslateModule } from '@ngx-translate/core';
import { I18nPipe } from '../../../core/i18n.pipe';
import { AetheryteNamePipe } from '../../../pipes/pipes/aetheryte-name.pipe';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { RouterLink } from '@angular/router';
import { ExtendedModule } from '@angular/flex-layout/extended';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { DbButtonComponent } from '../../../core/db-button/db-button.component';
import { NgStyle, AsyncPipe, DecimalPipe } from '@angular/common';
import { DialogComponent } from '../../../core/dialog.component';

@Component({
    selector: 'app-map',
    templateUrl: './map.component.html',
    styleUrls: ['./map.component.less'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [DbButtonComponent, NzToolTipModule, NgStyle, ExtendedModule, RouterLink, NzButtonModule, NzIconModule, AsyncPipe, DecimalPipe, AetheryteNamePipe, I18nPipe, TranslateModule, I18nRowPipe]
})
export class MapComponent extends DialogComponent implements OnInit {

  public unknownPosition = false;

  @Input()
  small = false;

  @Input()
  hideDbButton = false;

  @Input()
  aetheryteZIndex = 5;

  mapData$: Observable<MapData>;

  position: Vector2 = { x: 0, y: 0 };

  @Output()
  loaded: EventEmitter<void> = new EventEmitter<void>();

  private mapId$: ReplaySubject<number> = new ReplaySubject<number>();

  constructor(private mapService: MapService) {
    super();
  }

  private _mapId: number;

  public get mapId(): number {
    return this._mapId;
  }

  @Input()
  public set mapId(id: number) {
    this._mapId = id;
    this.mapId$.next(id);
  }

  _markers: MapMarker[] = [];

  get markers(): MapMarker[] {
    return this._markers;
  }

  @Input()
  set markers(markers: MapMarker[] | null) {
    if (markers) {
      this._markers = markers;
      this.unknownPosition = markers.every(marker => !marker?.x && !marker?.y);
    }
  }

  ngOnInit() {
    this.patchData();
    this.mapData$ = this.mapId$.pipe(
      switchMap(mapId => {
        return this.mapService.getMapById(mapId);
      })
    );
  }

  getMarkerStyle(map: MapData, marker: MapMarker, aetheryte = false): any {
    const positionPercents = this.mapService.getPositionPercentOnMap(map, marker);
    return {
      top: `${positionPercents.y}%`,
      left: `${positionPercents.x}%`,
      transform: 'translate(-50%, -50%);',
      'z-index': marker.zIndex || (aetheryte ? this.aetheryteZIndex : 5),
      ...(marker.additionalStyle || {})
    };
  }

  getRadiusStyle(map: MapData, marker: MapMarker): any {
    const positionPercents = this.mapService.getPositionPercentOnMap(map, marker);
    return {
      top: `${positionPercents.y}%`,
      left: `${positionPercents.x}%`,
      width: `${250 * marker.radius / (map.size_factor * 20.48)}%`,
      transform: 'translate(-50%, -50%);'
    };
  }

  getSubtitleStyle(map: MapData, marker: MapMarker, aetheryte = false): any {
    return {
      ...this.getMarkerStyle(map, marker, aetheryte),
      ...marker.subtitleStyle
    };
  }

  getIcon(type: number): string {
    return `./assets/icons/Aetheryte${type === 1 ? '_Shard' : ''}.png`;
  }

  trackByMarker(index: number, marker: MapMarker): string {
    return marker ? `${marker.x}:${marker.y}:${marker.iconType}` : index.toString();
  }

}
