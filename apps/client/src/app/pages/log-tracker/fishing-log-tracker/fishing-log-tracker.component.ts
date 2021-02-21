import { Component } from '@angular/core';
import { AuthFacade } from '../../../+state/auth.facade';
import { AlarmsFacade } from '../../../core/alarms/+state/alarms.facade';
import { map, tap } from 'rxjs/operators';
import { BehaviorSubject, combineLatest, Observable, ReplaySubject } from 'rxjs';
import { TrackerComponent } from '../tracker-component';
import { SettingsService } from '../../../modules/settings/settings.service';
import { FishingLogCacheService } from './fishing-log-cache.service';

@Component({
  selector: 'app-fishing-log-tracker',
  templateUrl: './fishing-log-tracker.component.html',
  styleUrls: ['./fishing-log-tracker.component.less']
})
export class FishingLogTrackerComponent extends TrackerComponent {

  public type$: BehaviorSubject<number> = new BehaviorSubject<number>(0);

  public spotId$: ReplaySubject<number> = new ReplaySubject<number>();

  public display$: Observable<any[]> = this.fishingLogCacheService.display$.pipe(
    tap(() => this.loading = false)
  );

  public tabsDisplay$: Observable<any> = combineLatest([this.display$, this.type$]).pipe(
    map(([display, type]) => display[type])
  );

  public pageDisplay$: Observable<any[]> = combineLatest([this.tabsDisplay$, this.spotId$]).pipe(
    map(([display, spotId]) => {
      const area = display.tabs.find(a => a.spots.some(spot => spot.id === spotId));
      if (area !== undefined) {
        return area.spots.find(spot => spot.id === spotId);
      }
      return null;
    })
  );

  public loading = true;

  public hideCompleted = this.settings.hideCompletedLogEntries;

  constructor(private authFacade: AuthFacade, protected alarmsFacade: AlarmsFacade,
              public settings: SettingsService, private fishingLogCacheService: FishingLogCacheService) {
    super(alarmsFacade);
  }

  public getFshIcon(index: number): string {
    return [
      './assets/icons/angling.png',
      './assets/icons/spearfishing.png'
    ][index];
  }

  public markAsDone(itemId: number, done: boolean): void {
    this.authFacade.markAsDoneInLog('gathering', itemId, done);
  }

}
