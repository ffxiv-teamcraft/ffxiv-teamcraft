import { ChangeDetectionStrategy, Component } from '@angular/core';
import { I18nToolsService } from '../../../../core/tools/i18n-tools.service';
import { SettingsService } from '../../../../modules/settings/settings.service';
import { combineLatest, of } from 'rxjs';
import { debounceTime, map, shareReplay, startWith, switchMap } from 'rxjs/operators';
import { FishContextService } from '../../service/fish-context.service';

@Component({
  selector: 'app-fish-baits',
  templateUrl: './fish-baits.component.html',
  styleUrls: ['./fish-baits.component.less', '../../common-db.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FishBaitsComponent {
  public readonly loading$ = this.fishCtx.hoursByFish$.pipe(map((res) => res.loading));

  public readonly baitsChartData$ = this.fishCtx.baitsByFish$.pipe(
    switchMap((res) => {
      if (!res.data) return of([]);
      const baitNames = Object.values(res.data.byId).map((item) =>
        this.i18n.getNameObservable('items', item.id).pipe(map((name) => ({ id: item.id, name })))
      );
      return combineLatest([...baitNames]).pipe(
        map((names) => {
          return Object.values(res.data.byId).map((bait) => ({
            name: names.find((i) => i.id === bait.id)?.name ?? '--',
            value: bait.occurrences,
            baitId: bait.id
          }))
            .sort((a, b) => b.value - a.value);
        }),
        debounceTime(100)
      );
    }),
    startWith([]),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  constructor(
    private readonly i18n: I18nToolsService,
    public readonly settings: SettingsService,
    public readonly fishCtx: FishContextService
  ) {
  }
}
