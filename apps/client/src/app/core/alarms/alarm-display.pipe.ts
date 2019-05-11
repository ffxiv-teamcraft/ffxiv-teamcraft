import { Pipe, PipeTransform } from '@angular/core';
import { AlarmDisplay } from './alarm-display';
import { Alarm } from './alarm';
import { AlarmsFacade } from './+state/alarms.facade';
import { combineLatest, Observable, of } from 'rxjs';
import { EorzeanTimeService } from '../eorzea/eorzean-time.service';
import { map } from 'rxjs/operators';

@Pipe({
  name: 'alarmDisplay',
  pure: true
})
export class AlarmDisplayPipe implements PipeTransform {

  constructor(private alarmsFacade: AlarmsFacade, private etime: EorzeanTimeService) {
  }

  transform(alarm: Partial<Alarm>): Observable<AlarmDisplay> {
    if (!alarm) {
      return of(null);
    }
    return combineLatest([
        this.alarmsFacade.getRegisteredAlarm(alarm),
        this.etime.getEorzeanTime()
      ]
    ).pipe(
      map(([registeredAlarm, date]) => {
        const display = this.alarmsFacade.createDisplay(<Alarm>alarm, date);
        display.registered = registeredAlarm !== undefined;
        if (display.registered) {
          display.alarm.$key = registeredAlarm.$key;
        }
        return display;
      })
    );
  }

}
