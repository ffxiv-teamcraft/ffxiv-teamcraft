import { ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Alarm } from '../../../../core/alarms/alarm';
import { AlarmDisplay } from '../../../../core/alarms/alarm-display';
import { AlarmGroup } from '../../../../core/alarms/alarm-group';
import { EorzeanTimeService } from '../../../../core/eorzea/eorzean-time.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-alarm-button',
  templateUrl: './alarm-button.component.html',
  styleUrls: ['./alarm-button.component.less']
})
export class AlarmButtonComponent implements OnInit, OnDestroy {

  @Input()
  alarm: Alarm;

  @Input()
  alarmGroups: AlarmGroup[];

  @Output()
  toggleAlarm = new EventEmitter<AlarmDisplay>();

  @Output()
  addAlarmWithGroup = new EventEmitter<{ alarm: Alarm, group: AlarmGroup }>();

  private onDestroy$ = new Subject<void>();

  constructor(private cd: ChangeDetectorRef, private etime: EorzeanTimeService) {
  }

  ngOnInit(): void {
    this.etime.getEorzeanTime()
      .pipe(takeUntil(this.onDestroy$))
      .subscribe(() => {
        this.cd.detectChanges();
      });
  }

  ngOnDestroy(): void {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }
}
