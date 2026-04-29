import { Pipe, PipeTransform, inject } from '@angular/core';
import { AlarmDisplay } from './alarm-display';
import { PersistedAlarm } from './persisted-alarm';
import { AlarmsFacade } from './+state/alarms.facade';
import { combineLatest, Observable, of } from 'rxjs';
import { EorzeanTimeService } from '../eorzea/eorzean-time.service';
import { map, switchMap } from 'rxjs/operators';
import { LazyDataFacade } from '../../lazy-data/+state/lazy-data.facade';

@Pipe({
    name: 'alarmDisplay',
    pure: true,
    standalone: true
})
export class AlarmDisplayPipe implements PipeTransform {
  private alarmsFacade = inject(AlarmsFacade);
  private etime = inject(EorzeanTimeService);
  private lazyData = inject(LazyDataFacade);


  transform(alarm: Partial<PersistedAlarm>): Observable<AlarmDisplay> {
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
            const display = this.alarmsFacade.createDisplay(<PersistedAlarm>completeAlarm, date);
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
