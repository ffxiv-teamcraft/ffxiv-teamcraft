import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { debounceTime, filter, map, mergeMap, tap } from 'rxjs/operators';
import { DataService } from '../../../core/api/data.service';
import { BellNodesService } from '../../../core/data/bell-nodes.service';
import { AlarmsFacade } from '../../../core/alarms/+state/alarms.facade';
import { Alarm } from '../../../core/alarms/alarm';
import { MapService } from '../../../modules/map/map.service';
import { LocalizedDataService } from '../../../core/data/localized-data.service';
import { GarlandToolsService } from '../../../core/api/garland-tools.service';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { AlarmGroup } from '../../../core/alarms/alarm-group';

@Component({
  selector: 'app-gathering-location',
  templateUrl: './gathering-location.component.html',
  styleUrls: ['./gathering-location.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GatheringLocationComponent {

  query$: BehaviorSubject<string> = new BehaviorSubject<string>('');

  results$: Observable<any[]>;

  alarmsLoaded$: Observable<boolean> = this.alarmsFacade.loaded$;

  alarms$: Observable<Alarm[]> = this.alarmsFacade.allAlarms$;

  alarmGroups$: Observable<AlarmGroup[]> = this.alarmsFacade.allGroups$;

  loading = false;

  showIntro = true;

  compactDisplay = false;

  constructor(private dataService: DataService, private bell: BellNodesService, private alarmsFacade: AlarmsFacade,
              private mapService: MapService, private l12n: LocalizedDataService, private gt: GarlandToolsService,
              private router: Router, private route: ActivatedRoute) {

    this.compactDisplay = localStorage.getItem('gathering-location:compact') === 'true';

    this.results$ = this.query$.pipe(
      debounceTime(500),
      tap((query) => {
        this.router.navigate([], {
          queryParamsHandling: 'merge',
          queryParams: { query: query.length > 0 ? query : null },
          relativeTo: this.route
        });
        this.showIntro = query.length === 0;
        this.loading = true;
      }),
      filter(query => query.length > 0),
      mergeMap(query => this.dataService.searchGathering(query)),
      map(items => {
        return this.bell.getAllNodes(...items);
      }),
      tap(() => this.loading = false)
    );

    this.route.queryParams
      .subscribe(params => {
        this.query$.next(params.query || '');
      });
  }

  public getNodeSpawns(node: any): string {
    if (node.spawnTimes === undefined || node.spawnTimes.length === 0) {
      return '';
    }
    return node.spawnTimes.reduce((res, current) => `${res}${current}:00 - ${(current + node.uptime / 60) % 24}:00, `, ``).slice(0, -2);
  }

  public addAlarm(node: any, group?: AlarmGroup): void {
    const alarm: Partial<Alarm> = this.generateAlarm(node);
    this.mapService.getMapById(alarm.mapId)
      .pipe(
        map((mapData) => {
          if (mapData !== undefined) {
            return this.mapService.getNearestAetheryte(mapData, alarm.coords);
          } else {
            return undefined;
          }
        }),
        map(aetheryte => {
          if (aetheryte !== undefined && aetheryte.aethernetCoords !== undefined) {
            alarm.aetheryte = aetheryte;
          }
          return alarm;
        })
      ).subscribe((result: Alarm) => {
      if (group) {
        alarm.groupId = group.$key;
      }
      this.alarmsFacade.addAlarms(result);
    });
  }

  public canCreateAlarm(alarms: Alarm[], node: any): boolean {
    const generatedAlarm = this.generateAlarm(node);
    return alarms.find(alarm => {
      return alarm.itemId === generatedAlarm.itemId
        && alarm.zoneId === generatedAlarm.zoneId;
    }) === undefined;
  }

  public saveCompactDisplay(value: boolean): void {
    localStorage.setItem('gathering-location:compact', value.toString());
  }

  public generateAlarm(node: any): Partial<Alarm> {
    const alarm: any = {
      itemId: node.itemId,
      icon: node.icon,
      duration: node.uptime / 60,
      mapId: node.mapId,
      zoneId: node.zoneid,
      type: node.type,
      coords: {
        x: node.x,
        y: node.y
      },
      spawns: node.spawnTimes,
      folklore: node.folklore,
      reduction: node.reduction || false,
      ephemeral: node.ephemeral || false,
      nodeContent: node.items,
      weathers: node.weathers || [],
      weathersFrom: node.weathersFrom || [],
      snagging: node.snagging || false,
      fishEyes: node.fishEyes || false,
      predators: node.predators || []
    };
    if (node.slot) {
      alarm.slot = +node.slot;
    }
    if (node.gig) {
      alarm.gig = node.gig;
    }
    if (node.baits) {
      alarm.baits = node.baits;
    }
    return alarm;
  }

}
