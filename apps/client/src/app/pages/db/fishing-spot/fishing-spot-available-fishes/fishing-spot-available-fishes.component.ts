import { ChangeDetectionStrategy, Component } from '@angular/core';
import { combineLatest, Observable, of } from 'rxjs';
import { filter, map, shareReplay, switchMap } from 'rxjs/operators';
import { FishContextService } from '../../service/fish-context.service';
import { GatheringNodesService } from '../../../../core/data/gathering-nodes.service';
import { AlarmsFacade } from '../../../../core/alarms/+state/alarms.facade';
import { Alarm } from '../../../../core/alarms/alarm';
import { AlarmDisplay } from '../../../../core/alarms/alarm-display';
import { AlarmGroup } from '../../../../core/alarms/alarm-group';
import { AuthFacade } from '../../../../+state/auth.facade';
import { LazyDataFacade } from '../../../../lazy-data/+state/lazy-data.facade';

@Component({
  selector: 'app-fishing-spot-available-fishes',
  templateUrl: './fishing-spot-available-fishes.component.html',
  styleUrls: ['./fishing-spot-available-fishes.component.less', '../../common-db.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FishingSpotAvailableFishesComponent {
  public readonly fishes$: Observable<{ itemId: number, alarms: Alarm[], done: boolean }[] | undefined> = combineLatest([this.fishCtx.spotId$, this.lazyData.getEntry('fishingSpots'), this.authFacade.logTracking$]).pipe(
    filter(([spotId]) => spotId >= 0),
    switchMap(([spotId, spots, logs]) => {
      const fishIds = spots.find((s) => s.id === spotId)?.fishes?.filter((f) => f > 0);
      if (fishIds.length === 0) {
        return of([]);
      }
      return combineLatest(fishIds.map(itemId => {
        return this.gatheringNodesService.getItemNodes(itemId, true).pipe(
          map(nodes => {
            const spotNode = nodes.find(n => n.id === spotId);
            return {
              itemId,
              alarms: this.alarmsFacade.generateAlarms(spotNode),
              done: logs.gathering.includes(itemId)
            };
          })
        );
      }));
    }),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  public alarmGroups$ = this.alarmsFacade.allGroups$;

  constructor(private readonly lazyData: LazyDataFacade, private readonly fishCtx: FishContextService,
              private alarmsFacade: AlarmsFacade, private gatheringNodesService: GatheringNodesService,
              private authFacade: AuthFacade) {
  }

  toggleAlarm(display: AlarmDisplay): void {
    if (display.registered) {
      this.alarmsFacade.deleteAlarm(display.alarm);
    } else {
      this.alarmsFacade.addAlarms(display.alarm);
    }
  }

  addAlarmWithGroup(alarm: Alarm, group: AlarmGroup) {
    this.alarmsFacade.addAlarmInGroup(alarm, group);
  }

  markAsDone(itemId: number, done: boolean): void {
    this.authFacade.markAsDoneInLog('gathering', itemId, done);
  }

  trackByEntry(index: number, entry: any): number {
    return entry.itemId;
  }
}
