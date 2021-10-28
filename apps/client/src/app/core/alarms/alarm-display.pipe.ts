import { Pipe, PipeTransform } from '@angular/core';
import { AlarmDisplay } from './alarm-display';
import { Alarm } from './alarm';
import { AlarmsFacade } from './+state/alarms.facade';
import { combineLatest, Observable, of } from 'rxjs';
import { EorzeanTimeService } from '../eorzea/eorzean-time.service';
import { map, switchMap } from 'rxjs/operators';
import { LazyDataFacade } from '../../lazy-data/+state/lazy-data.facade';

@Pipe({
  name: 'alarmDisplay',
  pure: true
})
export class AlarmDisplayPipe implements PipeTransform {

  constructor(private alarmsFacade: AlarmsFacade, private etime: EorzeanTimeService,
              private lazyData: LazyDataFacade) {
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
      switchMap(([registeredAlarm, date]) => {
        let alarm$ = of(alarm);
        if (alarm.mapId === undefined && alarm.zoneId !== undefined) {
          alarm$ = this.lazyData.getEntry('maps').pipe(
            map(maps => {
              alarm.mapId = +Object.keys(maps)
                .find((key) => maps[key].placename_id === alarm.zoneId);
              return alarm;
            })
          );
        }
        return alarm$.pipe(
          map(completeAlarm => {
            const display = this.alarmsFacade.createDisplay(<Alarm>completeAlarm, date);
            display.registered = registeredAlarm !== undefined;
            if (display.registered) {
              display.alarm.$key = registeredAlarm.$key;
            }
            return display;
          })
        );
      })
    );
  }

}
