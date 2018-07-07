import {Component, Input} from '@angular/core';
import {Alarm} from '../../../core/time/alarm';
import {MatDialog} from '@angular/material';
import {MapPopupComponent} from '../../map/map-popup/map-popup.component';
import {AlarmNotePopupComponent} from '../../../pages/alarms/alarm-note-popup/alarm-note-popup.component';

@Component({
    selector: 'app-alarm-sidebar-row',
    templateUrl: './alarm-sidebar-row.component.html',
    styleUrls: ['./alarm-sidebar-row.component.scss']
})
export class AlarmSidebarRowComponent {

    @Input()
    alarm: Alarm;

    @Input()
    alerted: boolean;

    @Input()
    spawned: boolean;

    @Input()
    timer: string;

    constructor(private dialog: MatDialog) {
    }

    openMap(): void {
        this.dialog.open(MapPopupComponent, {data: {coords: {x: this.alarm.coords[0], y: this.alarm.coords[1]}, id: this.alarm.zoneId}});
    }

    editNote(): void {
        this.dialog.open(AlarmNotePopupComponent, {data: this.alarm});
    }
}
