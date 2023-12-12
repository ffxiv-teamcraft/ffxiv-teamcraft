import { ChangeDetectionStrategy, Component } from '@angular/core';
import { combineLatest, Observable, of } from 'rxjs';
import { filter, map, shareReplay, switchMap } from 'rxjs/operators';
import { FishContextService } from '../../service/fish-context.service';
import { GatheringNodesService } from '../../../../core/data/gathering-nodes.service';
import { AlarmsFacade } from '../../../../core/alarms/+state/alarms.facade';
import { PersistedAlarm } from '../../../../core/alarms/persisted-alarm';
import { AlarmDisplay } from '../../../../core/alarms/alarm-display';
import { AlarmGroup } from '../../../../core/alarms/alarm-group';
import { AuthFacade } from '../../../../+state/auth.facade';
import { LazyDataFacade } from '../../../../lazy-data/+state/lazy-data.facade';
import { LazyIconPipe } from '../../../../pipes/pipes/lazy-icon.pipe';
import { ItemNamePipe } from '../../../../pipes/pipes/item-name.pipe';
import { TranslateModule } from '@ngx-translate/core';
import { I18nPipe } from '../../../../core/i18n.pipe';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzWaveModule } from 'ng-zorro-antd/core/wave';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { AlarmButtonComponent } from '../../../../modules/alarm-button/alarm-button/alarm-button.component';
import { DbButtonComponent } from '../../../../core/db-button/db-button.component';
import { ItemIconComponent } from '../../../../modules/item-icon/item-icon/item-icon.component';
import { NgFor, NgIf, AsyncPipe } from '@angular/common';
import { FlexModule } from '@angular/flex-layout/flex';
import { NzCardModule } from 'ng-zorro-antd/card';

@Component({
    selector: 'app-fishing-spot-available-fishes',
    templateUrl: './fishing-spot-available-fishes.component.html',
    styleUrls: ['./fishing-spot-available-fishes.component.less', '../../common-db.less'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [NzCardModule, FlexModule, NgFor, ItemIconComponent, DbButtonComponent, NgIf, AlarmButtonComponent, NzButtonModule, NzWaveModule, NzToolTipModule, NzIconModule, AsyncPipe, I18nPipe, TranslateModule, ItemNamePipe, LazyIconPipe]
})
export class FishingSpotAvailableFishesComponent {
  public readonly fishes$: Observable<{ itemId: number, alarms: PersistedAlarm[], done: boolean }[] | undefined> = combineLatest([this.fishCtx.spotId$, this.lazyData.getEntry('fishingSpots'), this.authFacade.logTracking$]).pipe(
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
      this.alarmsFacade.deleteAlarm(display.alarm as PersistedAlarm);
    } else {
      this.alarmsFacade.addAlarms(display.alarm as PersistedAlarm);
    }
  }

  addAlarmWithGroup(alarm: PersistedAlarm, group: AlarmGroup) {
    this.alarmsFacade.addAlarmInGroup(alarm, group);
  }

  markAsDone(itemId: number, done: boolean): void {
    this.authFacade.markAsDoneInLog('gathering', itemId, done);
  }

  trackByEntry(index: number, entry: any): number {
    return entry.itemId;
  }
}
