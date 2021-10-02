import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SettingsService } from 'apps/client/src/app/modules/settings/settings.service';
import { combineLatest } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { FishContextService } from '../../service/fish-context.service';

@Component({
  selector: 'app-fish-hooksets',
  templateUrl: './fish-hooksets.component.html',
  styleUrls: ['./fish-hooksets.component.less', '../../common-db.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FishHooksetsComponent {
  public readonly loading$ = combineLatest([this.fishCtx.hooksetsByFish$, this.fishCtx.tugsByFish$]).pipe(map(([hook, tug]) => hook.loading || tug.loading));

  public readonly hooksets$ = this.fishCtx.hooksetsByFish$.pipe(
    map((res) => {
      if (!res.data) return [];
      return Object.values(res.data.byId)
        .sort((a, b) => b.occurrences - a.occurrences)
        .map((entry) => ({
          hookset: entry.id === 1 ? 4103 : 4179,
          percent: (100 * entry.occurrences) / res.data.total,
          amount: entry.occurrences
        }));
    }),
    startWith([])
  );

  public readonly tugs$ = this.fishCtx.tugsByFish$.pipe(
    map((res) => {
      if (!res.data) return [];
      return Object.values(res.data.byId)
        .sort((a, b) => b.occurrences - a.occurrences)
        .map((entry) => ({
          tug: entry.id,
          percent: (100 * entry.occurrences) / res.data.total,
          amount: entry.occurrences
        }));
    }),
    startWith([])
  );

  constructor(public readonly settings: SettingsService, public readonly fishCtx: FishContextService) {}
}
