import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { debounceTime, filter, map, switchMap, tap } from 'rxjs/operators';
import { DataService } from '../../../core/api/data.service';
import { AlarmsFacade } from '../../../core/alarms/+state/alarms.facade';
import { Alarm } from '../../../core/alarms/alarm';
import { MapService } from '../../../modules/map/map.service';
import { GarlandToolsService } from '../../../core/api/garland-tools.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AlarmGroup } from '../../../core/alarms/alarm-group';
import { TranslateService } from '@ngx-translate/core';
import { GatheringNodesService } from '../../../core/data/gathering-nodes.service';
import { GatheringNode } from '../../../core/data/model/gathering-node';
import { NzMessageService } from 'ng-zorro-antd/message';

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

  compactDisplay$ = new BehaviorSubject<boolean>(localStorage.getItem('gathering-location:compact') === 'true');

  constructor(private dataService: DataService, private alarmsFacade: AlarmsFacade,
              private mapService: MapService, private gt: GarlandToolsService,
              private router: Router, private route: ActivatedRoute, public translate: TranslateService,
              private gatheringNodesService: GatheringNodesService, private message: NzMessageService) {

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
      switchMap(query => this.dataService.searchGathering(query)),
      switchMap(itemIds => {
        return combineLatest(itemIds.map(itemId => {
            return this.gatheringNodesService.getItemNodes(itemId).pipe(
              map(nodes => {
                return nodes.map(node => {
                  return {
                    originalItemId: itemId,
                    node: node,
                    alarms: this.alarmsFacade.generateAlarms(node)
                  };
                });
              })
            );
          })
        ).pipe(
          map(nodes => nodes.flat())
        );
      }),
      tap((results) => {
        this.loading = false;
        if (results.length > 25 && !this.compactDisplay$.value) {
          this.compactDisplay$.next(true);
          this.message.info(this.translate.instant('GATHERING_LOCATIONS.Switched_to_compact'));
        }
      })
    );

    this.route.queryParams
      .subscribe(params => {
        this.query$.next(params.query || '');
      });
  }

  public addAlarm(alarm: Alarm, group?: AlarmGroup): void {
    this.alarmsFacade.addAlarmInGroup(alarm, group);
  }

  public canCreateAlarmFromNode(alarms: Alarm[], node: GatheringNode): boolean {
    return alarms.find(alarm => {
      return node.matchingItemId === alarm.itemId
        && Math.floor(node.x) === Math.floor(alarm.coords.x)
        && node.zoneId === alarm.zoneId
        && node.type === alarm.type;
    }) === undefined;
  }

  public canCreateAlarm(alarms: Alarm[], alarm: Alarm): boolean {
    return alarms.find(a => {
      return alarm.itemId === a.itemId
        && Math.floor(alarm.coords.x) === Math.floor(a.coords.x)
        && alarm.zoneId === a.zoneId
        && alarm.type === a.type
        && alarm.fishEyes === a.fishEyes;
    }) === undefined;
  }

  public saveCompactDisplay(value: boolean): void {
    localStorage.setItem('gathering-location:compact', value.toString());
    this.compactDisplay$.next(value);
  }

  trackByAlarm(index: number, alarm: Partial<Alarm>): string {
    return `${JSON.stringify(alarm.spawns)}:${JSON.stringify(alarm.weathers)}`;
  }

}
