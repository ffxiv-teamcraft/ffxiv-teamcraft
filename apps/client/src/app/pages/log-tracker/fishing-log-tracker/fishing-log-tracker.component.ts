import { Component } from '@angular/core';
import { AuthFacade } from '../../../+state/auth.facade';
import { AlarmsFacade } from '../../../core/alarms/+state/alarms.facade';
import { filter, map, tap } from 'rxjs/operators';
import { BehaviorSubject, combineLatest, Observable, ReplaySubject } from 'rxjs';
import { TrackerComponent } from '../tracker-component';
import { SettingsService } from '../../../modules/settings/settings.service';
import { FishingLogCacheService } from './fishing-log-cache.service';
import { NzModalService } from 'ng-zorro-antd/modal';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { TextQuestionPopupComponent } from '../../../modules/text-question-popup/text-question-popup/text-question-popup.component';
import { NzMessageService } from 'ng-zorro-antd/message';
import { SpearfishingShadowSize, SpearfishingSpeed } from '@ffxiv-teamcraft/types';
import { AlarmDisplayPipe } from '../../../core/alarms/alarm-display.pipe';
import { LazyRowPipe } from '../../../pipes/pipes/lazy-row.pipe';
import { HooksetActionIdPipe } from '../../../pipes/pipes/hookset-action-id.pipe';
import { TugNamePipe } from '../../../pipes/pipes/tug-name.pipe';
import { WeatherIconPipe } from '../../../pipes/pipes/weather-icon.pipe';
import { XivapiIconPipe } from '../../../pipes/pipes/xivapi-icon.pipe';
import { NodeTypeIconPipe } from '../../../pipes/pipes/node-type-icon.pipe';
import { IfMobilePipe } from '../../../pipes/pipes/if-mobile.pipe';
import { ActionNamePipe } from '../../../pipes/pipes/action-name.pipe';
import { ActionIconPipe } from '../../../pipes/pipes/action-icon.pipe';
import { ItemNamePipe } from '../../../pipes/pipes/item-name.pipe';
import { I18nRowPipe } from '../../../core/i18n/i18n-row.pipe';
import { TimerPipe } from '../../../core/eorzea/timer.pipe';
import { I18nPipe } from '../../../core/i18n.pipe';
import { FullpageMessageComponent } from '../../../modules/fullpage-message/fullpage-message/fullpage-message.component';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { SpearfishingSpeedComponent } from '../../../modules/spearfishing-speed-tooltip/spearfishing-speed/spearfishing-speed.component';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { FishingBaitComponent } from '../../../modules/fishing-bait/fishing-bait/fishing-bait.component';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { ItemRarityDirective } from '../../../core/item-rarity/item-rarity.directive';
import { ItemIconComponent } from '../../../modules/item-icon/item-icon/item-icon.component';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { MapComponent } from '../../../modules/map/map/map.component';
import { DbButtonComponent } from '../../../core/db-button/db-button.component';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { FormsModule } from '@angular/forms';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { ClipboardDirective } from '../../../core/clipboard.directive';
import { NzWaveModule } from 'ng-zorro-antd/core/wave';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { FlexModule } from '@angular/flex-layout/flex';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NgIf, NgFor, AsyncPipe, JsonPipe } from '@angular/common';

@Component({
    selector: 'app-fishing-log-tracker',
    templateUrl: './fishing-log-tracker.component.html',
    styleUrls: ['./fishing-log-tracker.component.less'],
    standalone: true,
    imports: [NgIf, NzTabsModule, FlexModule, NzButtonModule, NzWaveModule, ClipboardDirective, NzSwitchModule, FormsModule, NgFor, NzMenuModule, DbButtonComponent, MapComponent, NzPopconfirmModule, NzIconModule, NzGridModule, ItemIconComponent, ItemRarityDirective, NzToolTipModule, NzDropDownModule, FishingBaitComponent, NzTagModule, SpearfishingSpeedComponent, NzDividerModule, FullpageMessageComponent, AsyncPipe, JsonPipe, I18nPipe, TranslateModule, TimerPipe, I18nRowPipe, ItemNamePipe, ActionIconPipe, ActionNamePipe, IfMobilePipe, NodeTypeIconPipe, XivapiIconPipe, WeatherIconPipe, TugNamePipe, HooksetActionIdPipe, LazyRowPipe, AlarmDisplayPipe]
})
export class FishingLogTrackerComponent extends TrackerComponent {

  SpearfishingSpeed = SpearfishingSpeed;

  SpearfishingShadowSize = SpearfishingShadowSize;

  public display$: Observable<any[]> = this.fishingLogCacheService.display$.pipe(
    tap(() => this.loading = false)
  );

  public type$: BehaviorSubject<number> = new BehaviorSubject<number>(0);

  public spotId$: ReplaySubject<number> = new ReplaySubject<number>();

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
      return log.gathering;
    })
  );

  constructor(private authFacade: AuthFacade, protected alarmsFacade: AlarmsFacade,
              public settings: SettingsService, private fishingLogCacheService: FishingLogCacheService,
              private modal: NzModalService, private translate: TranslateService,
              private message: NzMessageService) {
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
        console.error(e);
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
