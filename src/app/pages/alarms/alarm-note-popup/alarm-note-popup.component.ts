import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {Alarm} from '../../../core/time/alarm';
import {AlarmService} from '../../../core/time/alarm.service';

@Component({
    selector: 'app-alarm-note-popup',
    templateUrl: './alarm-note-popup.component.html',
    styleUrls: ['./alarm-note-popup.component.scss']
})
export class AlarmNotePopupComponent {

    constructor(@Inject(MAT_DIALOG_DATA) public alarm: Alarm, private alarmService: AlarmService,
                private ref: MatDialogRef<AlarmNotePopupComponent>) {
    }

    public submit(): void {
        this.alarmService.setAlarmNote(this.alarm, this.alarm.note);
        this.ref.close();
    }

}
