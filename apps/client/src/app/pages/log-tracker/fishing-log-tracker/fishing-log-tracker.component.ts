import { Component } from '@angular/core';
import { AuthFacade } from '../../../+state/auth.facade';
import { AlarmsFacade } from '../../../core/alarms/+state/alarms.facade';
import { filter, map, tap } from 'rxjs/operators';
import { BehaviorSubject, combineLatest, Observable, ReplaySubject } from 'rxjs';
import { TrackerComponent } from '../tracker-component';
import { SettingsService } from '../../../modules/settings/settings.service';
import { FishingLogCacheService } from './fishing-log-cache.service';
import { NzModalService } from 'ng-zorro-antd/modal';
import { TranslateService } from '@ngx-translate/core';
import { TextQuestionPopupComponent } from '../../../modules/text-question-popup/text-question-popup/text-question-popup.component';
import { NzMessageService } from 'ng-zorro-antd/message';
import { LazyDataService } from '../../../core/data/lazy-data.service';

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

  public rawCompletion$ = this.authFacade.logTracking$.pipe(
    map(log => {
      return log.gathering.filter(id => this.lazyData.data.fishes.includes(id));
    })
  );

  constructor(private authFacade: AuthFacade, protected alarmsFacade: AlarmsFacade,
              public settings: SettingsService, private fishingLogCacheService: FishingLogCacheService,
              private modal: NzModalService, private translate: TranslateService,
              private message: NzMessageService, private lazyData: LazyDataService) {
    super(alarmsFacade);
  }

  public importFromCP(): void {
    this.modal.create({
      nzContent: TextQuestionPopupComponent,
      nzTitle: this.translate.instant('LOG_TRACKER.Import_from_carbuncleplushy'),
      nzFooter: null
    }).afterClose
      .pipe(
        filter(res => !!res)
      ).subscribe((res) => {

      try {
        const parsed = JSON.parse(res);
        if (!parsed.completed) {
          this.message.error(this.translate.instant('LOG_TRACKER.Import_from_carbuncleplushy_failed'));
          return;
        } else {
          parsed.completed.forEach(itemId => {
            this.authFacade.markAsDoneInLog('gathering', itemId, true);
          });
          this.message.success(this.translate.instant('LOG_TRACKER.Import_from_carbuncleplushy_success'));
        }
      } catch (e) {
        this.message.error(this.translate.instant('LOG_TRACKER.Import_from_carbuncleplushy_failed'));
      }
    });
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

  public markSpotAsDone(spot: any): void {
    for (const fish of spot.fishes) {
      this.authFacade.markAsDoneInLog('gathering', fish.itemId, true);
    }
  }

}
