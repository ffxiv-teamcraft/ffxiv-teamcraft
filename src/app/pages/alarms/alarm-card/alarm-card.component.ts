import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Alarm } from '../../../core/time/alarm';
import { MapService } from '../../../modules/map/map.service';
import { MapData } from '../../../modules/map/map-data';
import { Observable } from 'rxjs';
import { AlarmNotePopupComponent } from '../alarm-note-popup/alarm-note-popup.component';
import { MatDialog } from '@angular/material';
import { I18nToolsService } from '../../../core/tools/i18n-tools.service';
import { LocalizedDataService } from '../../../core/data/localized-data.service';
import { EorzeanTimeService } from '../../../core/time/eorzean-time.service';
import { SettingsService } from '../../settings/settings.service';

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

    constructor(private mapService: MapService, private dialog: MatDialog,
                private i18n: I18nToolsService, private l12n: LocalizedDataService,
                private etime: EorzeanTimeService, private settings: SettingsService) {
    }

    deleteAlarm(): void {
        this.delete.emit();
    }

    generateAlarmMacro(): string {
        return `/alarm "${this.i18n.getName(this.l12n.getItem(this.alarm.itemId))}" et ${
            this.alarm.spawn < 10 ? '0' : ''}${this.alarm.spawn}00 ${
            Math.ceil(this.etime.toEarthTime(this.settings.alarmHoursBefore * 60) / 60)}`;
    }

    getClassIcon(): string {
        return AlarmCardComponent.icons[this.alarm.type];
    }

    editNote(): void {
        this.dialog.open(AlarmNotePopupComponent, { data: this.alarm });
    }

    ngOnInit(): void {
        this.map = this.mapService.getMapById(this.alarm.zoneId);
    }
}
