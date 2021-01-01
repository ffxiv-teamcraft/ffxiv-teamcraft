import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { debounceTime, filter, map, mergeMap, tap } from 'rxjs/operators';
import { DataService } from '../../../core/api/data.service';
import { AlarmsFacade } from '../../../core/alarms/+state/alarms.facade';
import { Alarm } from '../../../core/alarms/alarm';
import { MapService } from '../../../modules/map/map.service';
import { LocalizedDataService } from '../../../core/data/localized-data.service';
import { GarlandToolsService } from '../../../core/api/garland-tools.service';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { AlarmGroup } from '../../../core/alarms/alarm-group';
import { TranslateService } from '@ngx-translate/core';
import { GatheringNodesService } from '../../../core/data/gathering-nodes.service';
import { GatheringNode } from '../../../core/data/model/gathering-node';

@Component({
  selector: 'app-gathering-location',
  templateUrl: './gathering-location.component.html',
  styleUrls: ['./gathering-location.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GatheringLocationComponent {

  query$: BehaviorSubject<string> = new BehaviorSubject<string>('');

  results$: Observable<{ originalItemId: number, node: GatheringNode, alarms: Alarm[] }[]>;

  alarmsLoaded$: Observable<boolean> = this.alarmsFacade.loaded$;

  alarms$: Observable<Alarm[]> = this.alarmsFacade.allAlarms$;

  alarmGroups$: Observable<AlarmGroup[]> = this.alarmsFacade.allGroups$;

  loading = false;

  showIntro = true;

  compactDisplay = false;

  constructor(private dataService: DataService, private alarmsFacade: AlarmsFacade,
              private mapService: MapService, private l12n: LocalizedDataService, private gt: GarlandToolsService,
              private router: Router, private route: ActivatedRoute, public translate: TranslateService,
              private gatheringNodesService: GatheringNodesService) {

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
      map(itemIds => {
        return itemIds.map(itemId => {
          return this.gatheringNodesService.getItemNodes(itemId).map(node => {
            return {
              originalItemId: itemId,
              node: node,
              alarms: this.alarmsFacade.generateAlarms(node)
            };
          });
        }).flat();
      }),
      tap(() => this.loading = false)
    );

    this.route.queryParams
      .subscribe(params => {
        this.query$.next(params.query || '');
      });
  }

  public addAlarm(alarm: Alarm, group?: AlarmGroup): void {
    if (group) {
      alarm.groupId = group.$key;
    }
    this.alarmsFacade.addAlarms(alarm);
  }

  public canCreateAlarmFromNode(alarms: Alarm[], node: GatheringNode): boolean {
    return alarms.find(alarm => {
      return node.matchingItemId === alarm.itemId
        && node.zoneId === alarm.zoneId
        && node.type === alarm.type;
    }) === undefined;
  }

  public canCreateAlarm(alarms: Alarm[], alarm: Alarm): boolean {
    return alarms.find(a => {
      return alarm.itemId === a.itemId
        && alarm.zoneId === a.zoneId
        && alarm.type === a.type
        && alarm.fishEyes === a.fishEyes;
    }) === undefined;
  }

  public saveCompactDisplay(value: boolean): void {
    localStorage.setItem('gathering-location:compact', value.toString());
  }

  public generateAlarms(node: any): Partial<Alarm>[] {
    const alarm: any = {
      itemId: node.itemId,
      icon: node.icon,
      duration: node.uptime ? node.uptime / 60 : 0,
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
    if (node.hookset) {
      alarm.hookset = node.hookset;
    }
    return this.alarmsFacade.applyFishEyes(alarm);
  }

  trackByAlarm(index: number, alarm: Partial<Alarm>): string {
    return `${JSON.stringify(alarm.spawns)}:${JSON.stringify(alarm.weathers)}`;
  }

}
