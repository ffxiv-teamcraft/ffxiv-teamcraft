import {ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Alarm} from '../../../core/time/alarm';
import {MapService} from '../../../modules/map/map.service';
import {MapData} from '../../../modules/map/map-data';
import {Observable} from 'rxjs';

@Component({
    selector: 'app-alarm-card',
    templateUrl: './alarm-card.component.html',
    styleUrls: ['./alarm-card.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AlarmCardComponent implements OnInit {

    public static icons = [
        './assets/icons/Mineral_Deposit.png',
        './assets/icons/MIN.png',
        './assets/icons/Mature_Tree.png',
        './assets/icons/BTN.png',
        'https://garlandtools.org/db/images/FSH.png'];

    @Input()
    alarm: Alarm;

    @Input()
    spawned: boolean;

    @Input()
    alerted: boolean;

    @Input()
    timer: string;

    @Input()
    compact: boolean;

    @Output()
    delete: EventEmitter<void> = new EventEmitter<void>();

    map: Observable<MapData>;

    constructor(private mapService: MapService) {
    }

    deleteAlarm(): void {
        this.delete.emit();
    }

    getClassIcon(): string {
        return AlarmCardComponent.icons[this.alarm.type];
    }

    ngOnInit(): void {
        this.map = this.mapService.getMapById(this.alarm.zoneId);
    }
}
