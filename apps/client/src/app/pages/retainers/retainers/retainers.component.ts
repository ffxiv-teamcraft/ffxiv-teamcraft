import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { groupBy } from 'lodash';
import { combineLatest, interval, Observable } from 'rxjs';
import { map, shareReplay, switchMap, tap } from 'rxjs/operators';
import { AuthFacade } from '../../../+state/auth.facade';
import { Retainer, RetainersService } from '../../../core/electron/retainers.service';
import { SettingsService } from '../../../modules/settings/settings.service';

@Component({
  selector: 'app-retainers',
  templateUrl: './retainers.component.html',
  styleUrls: ['./retainers.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RetainersComponent {

  public loading = true;

  display$: Observable<{ characterName: string, retainers: Retainer[] }[]> = combineLatest([this.retainersService.retainers$, this.auth.characterEntries$]).pipe(
    map(([retainers, characters]) => {
      const indexed = groupBy(retainers, 'character');
      return Object.entries(indexed)
        .map(([contentId, charRetainers]) => {
          const characterEntry = characters.find(c => c.contentId === contentId);
          return {
            characterName: characterEntry ? characterEntry.character.Character.Name : 'Unknown',
            retainers: charRetainers
          };
        });
    }),
    shareReplay(1),
    switchMap(display => {
      return interval(1000).pipe(
        map(() => {
          return display
            .map(row => {
              row.retainers = row.retainers.filter(retainer => !!retainer.name && retainer.level > 0)
                .sort((a, b) => a.order - b.order)
                .map(retainer => {
                  return {
                    ...retainer,
                    taskDone: retainer.taskComplete <= Date.now() / 1000,
                    remainingTime: retainer.taskComplete - Math.floor(Date.now() / 1000)
                  };
                });
              return row;
            });
        })
      );
    }),
    tap(() => this.loading = false)
  );

  constructor(private retainersService: RetainersService, public translate: TranslateService,
              public settings: SettingsService, private auth: AuthFacade) {
  }

  resetRetainers(): void {
    this.retainersService.resetRetainers();
  }

}
