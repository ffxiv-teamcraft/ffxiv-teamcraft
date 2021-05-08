import { Component } from '@angular/core';
import { IpcService } from '../../../core/electron/ipc.service';
import { combineLatest, interval, Observable, ReplaySubject } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-fishing-reporter-overlay',
  templateUrl: './fishing-reporter-overlay.component.html',
  styleUrls: ['./fishing-reporter-overlay.component.less']
})
export class FishingReporterOverlayComponent {

  public state$: ReplaySubject<any> = new ReplaySubject<any>();

  public throwTime$: Observable<number> = combineLatest([interval(1000), this.state$]).pipe(
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

  constructor(private ipc: IpcService, private translate: TranslateService) {
    this.ipc.on('fishing-state', (event, data) => {
      this.state$.next(data);
    });
    this.ipc.send('fishing-state:get');
  }

  openSpotInMainWindow(spot: any): void {
    this.ipc.send('overlay:open-page', `/db/${this.translate.currentLang}/fishing-spot/${spot.id}`);
  }

  getErrors(state: any): string[] {
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
