import { Alarm } from '../../core/alarms/alarm';
import { AlarmDisplay } from '../../core/alarms/alarm-display';
import { AlarmGroup } from '../../core/alarms/alarm-group';
import { Observable } from 'rxjs';
import { AlarmsFacade } from '../../core/alarms/+state/alarms.facade';

export class TrackerComponent {

  public alarmsLoaded$: Observable<boolean>;
  public alarms$: Observable<Alarm[]>;
  public alarmGroups$: Observable<AlarmGroup[]>;

  public alarmsCache: any = {};

  constructor(protected alarmsFacade: AlarmsFacade) {
    this.alarmsLoaded$ = this.alarmsFacade.loaded$;
    this.alarms$ = this.alarmsFacade.allAlarms$;
  }

  public getAlarm(node: any): Partial<Alarm> | null {
    if (!node.timed && (node.weathers === undefined || node.weathers.length === 0)) {
      return null;
    }
    if (this.alarmsCache[`${node.itemId}-${node.type}`] === undefined) {
      this.alarmsCache[`${node.itemId}-${node.type}`] = {
        itemId: node.itemId,
        icon: node.icon,
        duration: node.uptime / 60 || 8,
        zoneId: node.zoneid,
        areaId: node.areaid,
        slot: +node.slot,
        type: node.type,
        coords: {
          x: node.x,
          y: node.y
        },
        folklore: node.folklore,
        reduction: node.reduction,
        ephemeral: node.ephemeral,
        nodeContent: node.items,
        spawns: node.spawnTimes,
        mapId: node.mapId,
        baits: node.baits || [],
        weathers: node.weathers,
        weathersFrom: node.weathersFrom,
        snagging: node.snagging,
        fishEyes: node.fishEyes,
        predators: node.predators || []
      };
    }
    return this.alarmsCache[`${node.itemId}-${node.type}`];
  }

  public toggleAlarm(display: AlarmDisplay): void {
    if (display.registered) {
      this.alarmsFacade.deleteAlarm(display.alarm);
    } else {
      this.alarmsFacade.addAlarms(display.alarm);
    }
  }

  public addAlarmWithGroup(alarm: Partial<Alarm>, group: AlarmGroup) {
    alarm.groupId = group.$key;
    this.alarmsFacade.addAlarms(<Alarm>alarm);
  }
}
