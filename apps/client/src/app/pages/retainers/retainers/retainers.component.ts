import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { interval, Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { Retainer, RetainersService } from '../../../core/electron/retainers.service';
import { SettingsService } from '../../../modules/settings/settings.service';

@Component({
  selector: 'app-retainers',
  templateUrl: './retainers.component.html',
  styleUrls: ['./retainers.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RetainersComponent {

  retainers$: Observable<Retainer[]> = this.retainersService.retainers$.pipe(
    switchMap(retainers => {
      return interval(1000).pipe(
        map(() => {
          return Object.values<Retainer>(retainers)
            .filter(retainer => !!retainer.name)
            .sort((a, b) => a.order - b.order)
            .map(retainer => {
              return {
                ...retainer,
                taskDone: retainer.taskComplete <= Date.now() / 1000,
                remainingTime: retainer.taskComplete - Math.floor(Date.now() / 1000)
              };
            });
        })
      );
    })
  );

  constructor(private retainersService: RetainersService, public translate: TranslateService,
              public settings: SettingsService) {
  }

}
