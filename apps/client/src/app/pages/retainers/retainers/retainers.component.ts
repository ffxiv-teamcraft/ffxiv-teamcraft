import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
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
    map(retainers => {
      return Object.values<Retainer>(retainers)
        .filter(retainer => !!retainer.name)
        .sort((a, b) => a.order - b.order)
        .map(retainer => {
          return {
            ...retainer,
            taskComplete: retainer.taskComplete * 1000,
            taskDone: retainer.taskComplete <= Date.now() / 1000
          };
        });
    })
  );

  constructor(private retainersService: RetainersService, public translate: TranslateService,
              public settings: SettingsService) {
  }

}
