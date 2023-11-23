import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LazyDataFacade } from '../../../lazy-data/+state/lazy-data.facade';
import { map } from 'rxjs/operators';
import { animalsSpawnData } from '../animals-spawn-data';
import { PersistedAlarm } from '../../../core/alarms/persisted-alarm';
import { Observable } from 'rxjs';
import { AlarmGroup } from '../../../core/alarms/alarm-group';
import { AlarmsFacade } from '../../../core/alarms/+state/alarms.facade';
import { AlarmDisplay } from '../../../core/alarms/alarm-display';
import { WeatherIconPipe } from '../../../pipes/pipes/weather-icon.pipe';
import { XivapiIconPipe } from '../../../pipes/pipes/xivapi-icon.pipe';
import { TranslateModule } from '@ngx-translate/core';
import { AlarmButtonComponent } from '../../../modules/alarm-button/alarm-button/alarm-button.component';
import { ItemIconComponent } from '../../../modules/item-icon/item-icon/item-icon.component';
import { MapPositionComponent } from '../../../modules/map/map-position/map-position.component';
import { I18nNameComponent } from '../../../core/i18n/i18n-name/i18n-name.component';
import { NgFor, NgIf, AsyncPipe } from '@angular/common';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';

@Component({
    selector: 'app-island-animals',
    templateUrl: './island-animals.component.html',
    styleUrls: ['./island-animals.component.less'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [NzPageHeaderModule, NzTableModule, NgFor, I18nNameComponent, MapPositionComponent, ItemIconComponent, NgIf, AlarmButtonComponent, AsyncPipe, TranslateModule, XivapiIconPipe, WeatherIconPipe]
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
          const alarm: Partial<PersistedAlarm> = {
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

  alarms$: Observable<PersistedAlarm[]> = this.alarmsFacade.allAlarms$;

  alarmGroups$: Observable<AlarmGroup[]> = this.alarmsFacade.allGroups$;

  constructor(private lazyData: LazyDataFacade, private alarmsFacade: AlarmsFacade) {
  }

  public addAlarm(display: AlarmDisplay, group?: AlarmGroup): void {
    if (display.registered) {
      this.alarmsFacade.deleteAlarm(display.alarm as PersistedAlarm);
    } else {
      this.alarmsFacade.addAlarmInGroup(display.alarm as PersistedAlarm, group);
    }
  }

  public addAlarmWithGroup(alarm: PersistedAlarm, group: AlarmGroup): void {
    this.alarmsFacade.addAlarmInGroup(alarm, group);
  }

}
