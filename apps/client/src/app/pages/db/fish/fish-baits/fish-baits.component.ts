import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LocalizedLazyDataService } from 'apps/client/src/app/core/data/localized-lazy-data.service';
import { I18nToolsService } from 'apps/client/src/app/core/tools/i18n-tools.service';
import { SettingsService } from 'apps/client/src/app/modules/settings/settings.service';
import { mapValues } from 'lodash';
import { forkJoin, of } from 'rxjs';
import { map, shareReplay, startWith, switchMap, take } from 'rxjs/operators';
import { FishContextService } from '../../service/fish-context.service';

@Component({
  selector: 'app-fish-baits',
  templateUrl: './fish-baits.component.html',
  styleUrls: ['./fish-baits.component.less', '../../common-db.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FishBaitsComponent {
  public readonly loading$ = this.fishCtx.hoursByFish$.pipe(map((res) => res.loading));

  public readonly baitsChartData$ = this.fishCtx.baitsByFish$.pipe(
    switchMap((res) => {
      if (!res.data) return of([]);
      const baitNames = mapValues(res.data.byId, (key) => this.i18n.resolveName(this.l12n.getItem(key.id)).pipe(take(1)));
      // TODO: Combinelatest instead of forkjoin
      return forkJoin(baitNames).pipe(
        map((names) => {
          return Object.values(res.data.byId).map((bait) => ({ name: names[bait.id] ?? '--', value: bait.occurrences, baitId: bait.id }));
        })
      );
    }),
    startWith([]),
    shareReplay(1)
  );

  constructor(
    private readonly l12n: LocalizedLazyDataService,
    private readonly i18n: I18nToolsService,
    public readonly settings: SettingsService,
    public readonly fishCtx: FishContextService
  ) {}
}
