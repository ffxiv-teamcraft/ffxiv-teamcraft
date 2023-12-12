import { Component } from '@angular/core';
import { IpcService } from '../../../core/electron/ipc.service';
import { combineLatest, interval, Observable, ReplaySubject } from 'rxjs';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { filter, map } from 'rxjs/operators';
import { FishingReporterState } from '../../../core/data-reporting/state/fishing-reporter-state';
import { LazyFishingSpot } from '@ffxiv-teamcraft/data/model/lazy-fishing-spot';
import { LazyRowPipe } from '../../../pipes/pipes/lazy-row.pipe';
import { LazyIconPipe } from '../../../pipes/pipes/lazy-icon.pipe';
import { WeatherIconPipe } from '../../../pipes/pipes/weather-icon.pipe';
import { XivapiIconPipe } from '../../../pipes/pipes/xivapi-icon.pipe';
import { ActionNamePipe } from '../../../pipes/pipes/action-name.pipe';
import { ItemNamePipe } from '../../../pipes/pipes/item-name.pipe';
import { I18nRowPipe } from '../../../core/i18n/i18n-row.pipe';
import { I18nPipe } from '../../../core/i18n.pipe';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzWaveModule } from 'ng-zorro-antd/core/wave';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { FlexModule } from '@angular/flex-layout/flex';
import { NgIf, NgFor, AsyncPipe, DecimalPipe, DatePipe } from '@angular/common';
import { OverlayContainerComponent } from '../../../modules/overlay-container/overlay-container/overlay-container.component';

@Component({
    selector: 'app-fishing-reporter-overlay',
    templateUrl: './fishing-reporter-overlay.component.html',
    styleUrls: ['./fishing-reporter-overlay.component.less'],
    standalone: true,
    imports: [OverlayContainerComponent, NgIf, FlexModule, NgFor, NzAlertModule, NzButtonModule, NzWaveModule, NzToolTipModule, NzIconModule, NzDividerModule, AsyncPipe, DecimalPipe, DatePipe, TranslateModule, I18nPipe, I18nRowPipe, ItemNamePipe, ActionNamePipe, XivapiIconPipe, WeatherIconPipe, LazyIconPipe, LazyRowPipe]
})
export class FishingReporterOverlayComponent {

  public state$: ReplaySubject<FishingReporterState> = new ReplaySubject<FishingReporterState>();

  public timeSinceThrown$: Observable<number> = combineLatest([interval(1000), this.state$]).pipe(
    map(([, state]) => {
      // If they never threw
      if (!state.throwData || !state.isFishing) {
        return 0;
      }
      // If they threw but no bite yet
      if (!state.biteData || state.throwData.timestamp > state.biteData.timestamp) {
        return Math.floor((Date.now() - state.throwData.timestamp) / 1000);
      }
      // If they threw and bite happened
      return Math.floor((state.biteData.timestamp - state.throwData.timestamp) / 1000);
    })
  );

  public throwTime$: Observable<number> = this.state$.pipe(
    map((state) => {
      // If they never threw
      if (!state.throwData || !state.isFishing) {
        return 0;
      }
      return state.throwData.etime;
    }),
    filter(Boolean)
  );

  public isIgnoredSpot$ = this.state$.pipe(
    map(state => state.spot?.id >= 10000)
  );

  constructor(private ipc: IpcService, private translate: TranslateService) {
    this.ipc.on('fishing-state', (event, data) => {
      this.state$.next(data);
    });
    this.ipc.send('fishing-state:get');
  }

  openSpotInMainWindow(spot: LazyFishingSpot): void {
    this.ipc.send('overlay:open-page', `/db/${this.translate.currentLang}/fishing-spot/${spot.id}`);
  }

  openTrainInMainWindow(trainId: string): void {
    this.ipc.send('overlay:open-page', `/fish-train/${trainId}`);
  }

  getErrors(state: FishingReporterState): string[] {
    const errors = [];
    if (!state.baitId) {
      errors.push('DB.FISH.OVERLAY.ERRORS.No_bait');
    }
    if (!state.stats) {
      errors.push('DB.FISH.OVERLAY.ERRORS.No_stats');
    }
    return errors;
  }

  getTugName(tug: number): string {
    return ['Medium', 'Big', 'Light'][tug];
  }

  getHooksetActionId(hookset: number): number {
    switch (hookset) {
      case 0:
        return 296;
      case 1:
        return 4103;
      case 2:
        return 4179;
    }
  }

  trackByValue(index: number, value: number): number {
    return value;
  }

}
