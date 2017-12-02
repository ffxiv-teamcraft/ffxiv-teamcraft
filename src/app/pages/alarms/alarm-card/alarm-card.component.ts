import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Alarm} from '../../../core/time/alarm';
import {MapService} from '../../../modules/map/map.service';
import {MapData} from '../../../modules/map/map-data';
import {Observable} from 'rxjs/Observable';

@Component({
    selector: 'app-alarm-card',
    templateUrl: './alarm-card.component.html',
    styleUrls: ['./alarm-card.component.scss']
})
export class AlarmCardComponent implements OnInit {

    @Input()
    alarm: Alarm;

    @Input()
    spawned: boolean;

    @Input()
    alerted: boolean;

    @Input()
    timer: string;

    @Output()
    delete: EventEmitter<void> = new EventEmitter<void>();

    map: Observable<MapData>;

    constructor(private mapService: MapService) {
    }

    getPosition(): Observable<{ x: number, y: number }> {
        return this.map.map(map => {
            return this.mapService.getPositionOnMap(map, {x: this.alarm.coords[0], y: this.alarm.coords[1]});
        });
    }

    deleteAlarm(): void {
        this.delete.emit();
    }

    ngOnInit(): void {
        this.map = this.mapService.getMapById(this.alarm.zoneId)
    }
}
