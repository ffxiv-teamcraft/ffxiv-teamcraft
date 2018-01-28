import {Component, Input, OnInit} from '@angular/core';
import {MapData} from '../map-data';
import {Observable} from 'rxjs/Observable';
import {MapService} from '../map.service';
import {MathTools} from '../../../tools/math-tools';

@Component({
    selector: 'app-map',
    templateUrl: './map.component.html',
    styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit {

    @Input()
    mapId: number;

    @Input()
    markers: { x: number, y: number }[] = [];

    mapData: Observable<MapData>;

    constructor(private mapService: MapService) {
    }

    ngOnInit() {
        this.mapData = this.mapService.getMapById(this.mapId)
    }

    getPosition(map: MapData, marker: { x: number, y: number }, offset = { x: 0, y: 0 }): { top: string, left: string } {
        const positionPercents = this.mapService.getPositionOnMap(map, marker);
        return {top: `${positionPercents.y + offset.y}%`, left: `${positionPercents.x + offset.y}%`};
    }

    getIcon(type: 0 | 1): string {
        return `/assets/icons/Aetheryte${type === 1 ? '_Shard' : ''}.png`;
    }

}
