import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LazyDataFacade } from '../../../lazy-data/+state/lazy-data.facade';
import { map } from 'rxjs/operators';
import { animalsSpawnData } from '../animals-spawn-data';
import { Alarm } from '../../../core/alarms/alarm';
import { Observable } from 'rxjs';
import { AlarmGroup } from '../../../core/alarms/alarm-group';
import { AlarmsFacade } from '../../../core/alarms/+state/alarms.facade';

@Component({
  selector: 'app-island-animals',
  templateUrl: './island-animals.component.html',
  styleUrls: ['./island-animals.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IslandAnimalsComponent {

  public animalsWithData$ = this.lazyData.getEntry('islandAnimals').pipe(
    map(animals => {
      return Object.values(animals).map(animal => {
        return {
          ...animal,
          ...(animalsSpawnData[animal.id] || {})
        };
      });
    }),
    map(animals => {
      return animals.map((animal) => {
        if (animal.spawn !== undefined || animal.weather !== undefined) {
          const alarm: Partial<Alarm> = {
            type: -10,
            mapId: 772,
            zoneId: 2566,
            coords: { x: animal.x, y: animal.y, z: 0 },
            icon: animal.icon,
            bnpcName: animal.bnpcName
          };
          if (animal.spawn !== undefined) {
            alarm.spawns = [animal.spawn];
            alarm.duration = animal.duration;
          }
          if (animal.weather !== undefined) {
            alarm.weathers = [animal.weather];
          }
          (animal as any).alarm = alarm;
        }
        return animal;
      });
    })
  );

  alarms$: Observable<Alarm[]> = this.alarmsFacade.allAlarms$;

  alarmGroups$: Observable<AlarmGroup[]> = this.alarmsFacade.allGroups$;

  constructor(private lazyData: LazyDataFacade, private alarmsFacade: AlarmsFacade) {
  }

  public addAlarm(alarm: Alarm, group?: AlarmGroup): void {
    this.alarmsFacade.addAlarmInGroup(alarm, group);
  }

}
