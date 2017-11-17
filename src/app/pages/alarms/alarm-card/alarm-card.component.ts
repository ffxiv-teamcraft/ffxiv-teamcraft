import {Component, Input, OnInit} from '@angular/core';
import {Alarm} from '../../../core/time/alarm';

@Component({
    selector: 'app-alarm-card',
    templateUrl: './alarm-card.component.html',
    styleUrls: ['./alarm-card.component.scss']
})
export class AlarmCardComponent implements OnInit {

    @Input()
    alarm: Alarm;

    constructor() {
    }

    ngOnInit() {
    }

}
