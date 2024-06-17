import { inject, Injectable } from '@angular/core';

import { select, Store } from '@ngrx/store';

import { AlarmsState } from './alarms.reducer';
import { alarmsQuery } from './alarms.selectors';
import {
  AddAlarms,
  AddAlarmsAndGroup,
  CreateAlarmGroup,
  DeleteAlarmGroup,
  DeleteAllAlarms,
  LoadAlarmGroup,
  LoadAlarms,
  RemoveAlarm,
  SetAlarmDone,
  SetAlarms,
  SetGroups,
  UpdateAlarm,
  UpdateAlarmGroup
} from './alarms.actions';
import { isPersistedAlarm, PersistedAlarm } from '../persisted-alarm';
import { filter, first, map, shareReplay, switchMap, tap } from 'rxjs/operators';
import { combineLatest, Observable, of } from 'rxjs';
import { AlarmDisplay } from '../alarm-display';
import { EorzeanTimeService } from '../../eorzea/eorzean-time.service';
import { AlarmsPageDisplay } from '../alarms-page-display';
import { AlarmGroupDisplay } from '../alarm-group-display';
import { AlarmGroup } from '../alarm-group';
import { SettingsService } from '../../../modules/settings/settings.service';
import { WeatherService } from '../../eorzea/weather.service';
import { mapIds } from '../../data/sources/map-ids';
import { AlarmDetails, GatheringNode } from '@ffxiv-teamcraft/types';
import { GatheringNodesService } from '../../data/gathering-nodes.service';
import * as semver from 'semver';
import { ProgressPopupService } from '../../../modules/progress-popup/progress-popup.service';
import { environment } from '../../../../environments/environment';
import { safeCombineLatest } from '../../rxjs/safe-combine-latest';
import { LazyDataFacade } from '../../../lazy-data/+state/lazy-data.facade';
import { LazyData } from '@ffxiv-teamcraft/data/model/lazy-data';
import { LazyPatchName } from '@ffxiv-teamcraft/data/model/lazy-patch-name';
import { AlarmStatus } from '../alarm-status';
import { AlarmStatusService } from '../alarm-status.service';
import { addSeconds, differenceInMinutes, differenceInSeconds } from 'date-fns';

@Injectable({
  providedIn: 'root'
})
export class AlarmsFacade {

  regenerating = false;

  loaded$ = this.store.pipe(select(alarmsQuery.getLoaded));

  allAlarms$ = this.store.pipe(
    select(alarmsQuery.getAllAlarms),
    map(alarms => {
      if (this.regenerating) {
        return [null];
      }
      if (environment.production && alarms[0] && semver.ltr(alarms[0].appVersion || '6.0.0', '8.6.0')) {
        this.regenerateAlarms(alarms);
        return [null];
      }
      return alarms;
    }),
    filter(alarms => alarms.length === 0 || !!alarms[0]),
    shareReplay(1)
  );

  allGroups$ = this.store.pipe(select(alarmsQuery.getAllGroups));

  externalGroup$ = this.store.pipe(select(alarmsQuery.getExternalGroup));

  externalGroupAlarms$ = this.store.pipe(select(alarmsQuery.getExternalGroupAlarms));

  alarmsPageDisplay$ = combineLatest([this.allAlarms$, this.allGroups$]).pipe(
    map(([alarms, groups]) => {
      return {
        groupedAlarms: groups
          .sort((a, b) => {
            if (a.index === b.index) {
              return a.name < b.name ? -1 : 1;
            }
            return a.index < b.index ? -1 : 1;
          })
          .map(group => {
            return {
              group: group,
              alarms: group.alarms.map(key => alarms.find(a => a.$key === key)).filter(a => !!a)
            };
          }),
        noGroup: alarms.filter(alarm => !groups.some(group => group.alarms.includes(alarm.$key)))
      };
    }),
    switchMap(preparedDisplay => {
      return this.etime.getEorzeanTime().pipe(
        map(date => {
          const display = new AlarmsPageDisplay();
          display.groupedAlarms = preparedDisplay.groupedAlarms
            .map(groupData => {
              return new AlarmGroupDisplay(groupData.group, this.createDisplayArray(groupData.alarms, date));
            });

          display.noGroup = this.createDisplayArray(preparedDisplay.noGroup, date);
          return display;
        })
      );
    }),
    shareReplay(1)
  );

  alarmsSidebarDisplay$ = combineLatest([this.allAlarms$, this.allGroups$]).pipe(
    map(([alarms, groups]) => {
      return alarms
        .map(alarm => {
          const alarmGroups = groups.filter(g => g.alarms.some(key => key === alarm.$key));
          alarm.groupNames = alarmGroups.map(g => g.name).join(', ');
          if (!alarm.enabled || (alarmGroups?.length > 0 && alarmGroups.every(g => !g.enabled))) {
            return null;
          }
          return alarm;
        })
        .filter(alarm => !!alarm);
    }),
    switchMap(alarms => {
      return this.etime.getEorzeanTime().pipe(
        map(date => this.createDisplayArray(alarms, date))
      );
    }),
    shareReplay(1)
  );

  private statusCache: Record<string, { expires: Date, status: AlarmStatus }> = {};

  private itemPatch: LazyData['itemPatch'];

  private patches: LazyPatchName[] = [];

  private legendaryFish: LazyData['legendaryFish'];

  private alarmStatusService = inject(AlarmStatusService);

  constructor(private store: Store<{ alarms: AlarmsState }>, private etime: EorzeanTimeService,
              private settings: SettingsService, private weatherService: WeatherService,
              private lazyData: LazyDataFacade,
              private gatheringNodesService: GatheringNodesService, private progressService: ProgressPopupService) {
  }

  public isAlarmDone(alarm: PersistedAlarm, etime: Date): boolean {
    const doneStr = localStorage.getItem(`alarm:${alarm.$key}:done`);
    if (!doneStr) {
      return false;
    }
    const done = new Date(doneStr);
    const earthTime = this.etime.toEarthDate(etime).getTime();
    const durationEarthMinutes = 60 * (alarm.duration || 8) / EorzeanTimeService.EPOCH_TIME_FACTOR;
    const durationExpiration = new Date(done.getTime() + (durationEarthMinutes * 60 * 1000)).getTime();
    return earthTime < durationExpiration;
  }

  setAlarmDone(key: string): void {
    this.store.dispatch(new SetAlarmDone(key));
  }

  public addAlarms(...alarms: PersistedAlarm[]): void {
    this.store.dispatch(new AddAlarms(alarms));
  }

  public addAlarmInGroup(alarm: PersistedAlarm, group?: AlarmGroup): void {
    this.store.dispatch(new AddAlarms([alarm], group));
  }

  public addAlarmsAndGroup(alarms: PersistedAlarm[], groupName: string, redirect = false): void {
    this.store.dispatch(new AddAlarmsAndGroup(alarms, groupName, redirect));
  }

  public updateAlarm(alarm: PersistedAlarm): void {
    this.store.dispatch(new UpdateAlarm(alarm));
  }

  public deleteAlarm(alarm: PersistedAlarm): void {
    this.store.dispatch(new RemoveAlarm(alarm.$key));
  }

  public createGroup(name: string, index: number): void {
    this.store.dispatch(new CreateAlarmGroup(name, index));
  }

  public updateGroup(group: AlarmGroup): void {
    this.store.dispatch(new UpdateAlarmGroup(group));
  }

  public deleteGroup(key: string): void {
    this.store.dispatch(new DeleteAlarmGroup(key));
  }

  public loadExternalGroup(key: string): void {
    this.store.dispatch(new LoadAlarmGroup(key));
  }

  public deleteAllAlarms(): void {
    this.store.dispatch(new DeleteAllAlarms());
  }

  public getRegisteredAlarm(alarm: Partial<PersistedAlarm>): Observable<PersistedAlarm> {
    return this.allAlarms$.pipe(
      map(alarms => alarms.find(a => {
        if (alarm.itemId) {
          return a.itemId === alarm.itemId
            && a.zoneId === alarm.zoneId
            && a.type === alarm.type
            && a.fishEyes === alarm.fishEyes
            && a.nodeId === alarm.nodeId;
        } else if (alarm.type === -10) {
          return a.bnpcName === alarm.bnpcName;
        } else {
          // If it's a custom alarm
          return a.name === alarm.name && a.duration === alarm.duration && a.type === alarm.type;
        }
      }))
    );
  }

  public loadAlarms(): void {
    this.store.dispatch(new LoadAlarms());
    combineLatest([
      this.lazyData.getEntry('itemPatch'),
      this.lazyData.patches$,
      this.lazyData.getEntry('legendaryFish')
    ]).pipe(
      first()
    ).subscribe(([itemPatch, patches, legendaryFish]) => {
      this.itemPatch = itemPatch;
      this.patches = patches;
      this.legendaryFish = legendaryFish;
    });
  }

  public createDisplay<T extends AlarmDetails | PersistedAlarm = PersistedAlarm>(alarm: T, etime: Date): AlarmDisplay<T> {
    const display = new AlarmDisplay(alarm);
    const status = { ...this.getStatus(alarm, etime) };
    display.spawned = this.isSpawned(alarm, etime);
    display.played = this.isPlayed(alarm, etime);
    if (isPersistedAlarm(alarm)) {
      display.done = this.isAlarmDone(alarm, etime);
      display.groupNames = alarm.groupNames || '';
    }
    if (Math.abs(alarm.type) < 4) {
      display.dbType = 'node';
    } else if (alarm.type === 4) {
      display.dbType = 'spearfishing-spot';
    } else {
      display.dbType = 'fishing-spot';
    }
    if (display.spawned) {
      display.remainingTime = differenceInSeconds(status.nextSpawn.despawn, etime) / 60;
    } else {
      display.remainingTime = differenceInSeconds(status.nextSpawn.date, etime) / 60;
    }
    display.remainingTime = this.etime.toEarthTime(display.remainingTime);
    display.nextSpawnTime = this.etime.toEarthTime(differenceInSeconds(status.secondNextSpawn.date, etime) / 60);
    display.status = status;
    display.weather = status.nextSpawn.weather;
    return display;
  }

  public createDisplayArray<T extends AlarmDetails | PersistedAlarm = PersistedAlarm>(alarms: T[], date: Date): AlarmDisplay<T>[] {
    return this.sortAlarmDisplays(alarms.filter(alarm => alarm.spawns !== undefined || alarm.weathers !== undefined)
      .map(alarm => {
        return this.createDisplay(alarm, date);
      }));
  }

  public getStatus(alarm: AlarmDetails, etime: Date): AlarmStatus {
    const cacheKey = `${alarm.itemId}-${alarm.bnpcName}-${alarm.zoneId}-${(alarm.spawns || []).join(',')}-${(alarm.weathers || []).join(',')}`;
    if (this.statusCache[cacheKey] === undefined || this.statusCache[cacheKey].expires.getTime() < Date.now()) {
      const status = this.alarmStatusService.getAlarmStatus(alarm, etime);
      this.statusCache[cacheKey] = {
        status,
        expires: addSeconds(this.etime.toEarthDate(status.spawned ? status.nextSpawn.despawn : status.nextSpawn.date), 3)
      };
    }
    return this.statusCache[cacheKey].status;
  }

  public generateAlarms(node: GatheringNode): AlarmDetails[] {
    // If no spawns and no weather, no alarms.
    if (!node?.spawns?.length && !node?.weathers?.length) {
      return [];
    }
    const alarm: AlarmDetails = {
      itemId: node.matchingItemId,
      nodeId: node.id,
      duration: node.duration ? node.duration / 60 : 0,
      mapId: node.map,
      zoneId: mapIds.find((m) => m.id === node.map)?.zone || node.zoneId,
      areaId: node.zoneId,
      type: node.type,
      coords: {
        x: node.x,
        y: node.y,
        z: node.z || 0
      },
      spawns: node.spawns,
      folklore: node?.folklore,
      reduction: node.isReduction || false,
      ephemeral: node.ephemeral || false,
      nodeContent: node.items,
      weathers: node.weathers || [],
      weathersFrom: node.weathersFrom || [],
      snagging: node.snagging || false,
      predators: node.predators || []
    };
    if (node.speed) {
      alarm.speed = node.speed;
      alarm.shadowSize = node.shadowSize;
    }
    if (node.baits) {
      alarm.baits = node.baits;
    }
    if (node.hookset) {
      alarm.hookset = node.hookset;
    }
    return this.applyFishEyes(alarm) as AlarmDetails[];
  }

  public regenerateAlarm(alarm: Partial<PersistedAlarm>): Observable<PersistedAlarm> {
    return this.gatheringNodesService.getItemNodes(alarm.itemId).pipe(
      map(nodes => {
        const nodeForThisAlarm = nodes.find(n => {
          if (alarm.nodeId) {
            return n.id === alarm.nodeId;
          }
          return alarm.mapId === n.map;
        }) || nodes[0];
        if (nodeForThisAlarm) {
          const alarms = this.generateAlarms(nodeForThisAlarm);
          const regenerated = (alarms.find(a => a.fishEyes === alarm.fishEyes) || alarms[0]) as PersistedAlarm;
          if (!regenerated) {
            return null;
          }
          regenerated.userId = alarm.userId;
          regenerated.$key = alarm.$key;
          regenerated.appVersion = environment.version;
          regenerated.enabled = alarm.enabled;
          Object.assign(alarm, regenerated);
          return regenerated as PersistedAlarm;
        }
      })
    );
  }

  public regenerateAlarms(_alarms?: PersistedAlarm[]): void {
    let alarms$ = of(_alarms);
    if (!_alarms) {
      alarms$ = this.allAlarms$;
    }
    const operation$ = safeCombineLatest([alarms$, this.allGroups$]).pipe(
      first(),
      switchMap(([alarms, groups]) => {
        this.regenerating = true;
        const newGroups = groups.map(group => {
          const clone = new AlarmGroup(group.name, group.index);
          clone.userId = group.userId;
          clone.alarms = group.alarms;
          clone.$key = group.$key;
          clone.appVersion = environment.version;
          clone.enabled = group.enabled;
          return clone;
        });
        return safeCombineLatest(alarms.map(alarm => {
          if ((<any>alarm).groupId) {
            const group = newGroups.find(g => g.$key === (<any>alarm).groupId);
            if (group && !group.alarms.includes(alarm.$key)) {
              group.alarms.push(alarm.$key);
            }
          }
          // If custom alarm, return it
          if (alarm.name || alarm.type === -10) {
            alarm.appVersion = environment.version;
            return of(alarm);
          }
          return this.regenerateAlarm(alarm);
        })).pipe(
          map(res => res.filter(alarm => !!alarm)),
          tap(newAlarms => {
            const deletedAlarms = alarms.filter(a => !newAlarms.some(na => na.$key === a.$key));
            deletedAlarms.forEach(da => {
              this.store.dispatch(new RemoveAlarm(da.$key));
            });
            this.store.dispatch(new SetAlarms(newAlarms));
            this.store.dispatch(new SetGroups(newGroups));
            this.regenerating = false;
          })
        );
      })
    );
    this.progressService.showProgress(operation$, 1, 'ALARMS.Regenerating_alarms').subscribe();
  }

  private sortAlarmDisplays<T extends AlarmDetails | PersistedAlarm = PersistedAlarm>(alarms: AlarmDisplay<T>[]): AlarmDisplay<T>[] {
    return alarms.sort((a, b) => {
      if (a.spawned && a.done) {
        return 1;
      }
      if (b.spawned && b.done) {
        return -1;
      }
      if (a.spawned && b.spawned) {
        if (Math.abs(a.remainingTime - b.remainingTime) < 10) {
          return b.alarm.itemId - a.alarm.itemId;
        }
        return a.remainingTime - b.remainingTime;
      }
      if (a.spawned) {
        return -1;
      }
      if (b.spawned) {
        return 1;
      }
      if (Math.abs(a.remainingTime - b.remainingTime) < 10) {
        return b.alarm.itemId - a.alarm.itemId;
      }
      return a.remainingTime - b.remainingTime;
    });
  }

  /**
   * Checks if a given alarm is spawned at a given time.
   * @param alarm
   * @param time
   */
  private isSpawned(alarm: AlarmDetails, time: Date): boolean {
    const status = this.getStatus(alarm, time);
    return status.spawned;
  }

  /**
   * Checks if a given alarm is played at a given time.
   *
   * Being played means that the alarm has been played but the node isn't spawned yet.
   * @param alarm
   * @param time
   */
  private isPlayed(alarm: AlarmDetails, time: Date): boolean {
    const status = this.getStatus(alarm, time);
    return differenceInMinutes(status.nextSpawn.date, time) < this.settings.alarmHoursBefore * 60;
  }

  private applyFishEyes(alarm: AlarmDetails): AlarmDetails[] {
    const patch = this.itemPatch && this.itemPatch[alarm.itemId];
    const expansion = this.patches.find(p => p.id === patch)?.ex;
    const isLegendary = this.legendaryFish && this.legendaryFish[alarm.itemId];
    // The changes only apply to fishes pre-ShB and non-legendary
    if (expansion < 3 && alarm.weathers?.length > 0 && alarm.spawns && !isLegendary) {
      const { spawns, ...alarmWithFishEyesEnabled } = alarm;
      return [alarm, { ...alarmWithFishEyesEnabled, fishEyes: true, spawns: [] }];
    }
    return [alarm];
  }
}
