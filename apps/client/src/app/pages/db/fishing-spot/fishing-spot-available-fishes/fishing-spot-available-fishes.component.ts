import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LazyDataService } from 'apps/client/src/app/core/data/lazy-data.service';
import { combineLatest, Observable } from 'rxjs';
import { filter, map, shareReplay } from 'rxjs/operators';
import { FishContextService } from '../../service/fish-context.service';
import { GatheringNodesService } from '../../../../core/data/gathering-nodes.service';
import { AlarmsFacade } from 'apps/client/src/app/core/alarms/+state/alarms.facade';
import { Alarm } from 'apps/client/src/app/core/alarms/alarm';
import { AlarmDisplay } from '../../../../core/alarms/alarm-display';
import { AlarmGroup } from '../../../../core/alarms/alarm-group';
import { AuthFacade } from 'apps/client/src/app/+state/auth.facade';

@Component({
  selector: 'app-fishing-spot-available-fishes',
  templateUrl: './fishing-spot-available-fishes.component.html',
  styleUrls: ['./fishing-spot-available-fishes.component.less', '../../common-db.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FishingSpotAvailableFishesComponent {
  public readonly fishes$: Observable<{ itemId: number, alarms: Alarm[], done: boolean }[] | undefined> = combineLatest([this.fishCtx.spotId$, this.lazyData.fishingSpots$, this.authFacade.logTracking$]).pipe(
    filter(([spotId]) => spotId >= 0),
    map(([spotId, spots, logs]) => {
      const fishIds = spots.find((s) => s.id === spotId)?.fishes?.filter((f) => f > 0);
      return fishIds.map(itemId => {
        const nodes = this.gatheringNodesService.getItemNodes(itemId, true);
        const spotNode = nodes.find(n => n.id === spotId);
        return {
          itemId,
          alarms: this.alarmsFacade.generateAlarms(spotNode),
          done: logs.gathering.includes(itemId)
        };
      });
    }),
    shareReplay(1)
  );

  public alarmGroups$ = this.alarmsFacade.allGroups$;

  constructor(private readonly lazyData: LazyDataService, private readonly fishCtx: FishContextService,
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
