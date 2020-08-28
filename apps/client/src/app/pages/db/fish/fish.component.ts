import { Component, Input, TemplateRef } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { mapValues } from 'lodash';
import { BehaviorSubject, combineLatest, forkJoin, of } from 'rxjs';
import { distinctUntilChanged, map, startWith, switchMap, shareReplay } from 'rxjs/operators';
import { LazyDataService } from '../../../core/data/lazy-data.service';
import { LocalizedLazyDataService } from '../../../core/data/localized-lazy-data.service';
import { mapIds } from '../../../core/data/sources/map-ids';
import { weatherIndex } from '../../../core/data/sources/weather-index';
import { EorzeanTimeService } from '../../../core/eorzea/eorzean-time.service';
import { I18nToolsService } from '../../../core/tools/i18n-tools.service';
import { SettingsService } from '../../../modules/settings/settings.service';
import { FishContextService } from '../service/fish-context.service';

@Component({
  selector: 'app-fish',
  templateUrl: './fish.component.html',
  styleUrls: ['./fish.component.less'],
})
export class FishComponent {
  public loading$ = new BehaviorSubject<boolean>(false);

  @Input()
  public set xivapiFish(fish: { ID?: number }) {
    if (fish?.ID >= 0) this.fishCtx.setFishId(fish.ID);
  }

  @Input() usedForTpl: TemplateRef<any>;

  @Input() obtentionTpl: TemplateRef<any>;

  public readonly spotIdFilter$ = this.fishCtx.spotId$.pipe(map((spotId) => spotId ?? -1));

  public readonly rankings$ = this.fishCtx.rankingsByFish$.pipe(map((res) => res.data?.rankings ?? undefined));

  public readonly userRanking$ = this.fishCtx.rankingsByFish$.pipe(map((res) => res.data?.userRanking?.[0] ?? undefined));

  constructor(public translate: TranslateService, public settings: SettingsService, public readonly fishCtx: FishContextService) {}

  getRankIcon(rank: number): string {
    if (rank < 1 || rank > 3) {
      return '';
    }
    return ['gold', 'silver', 'bronze'][rank - 1];
  }

  public setSpotIdFilter(spotId: number) {
    this.fishCtx.setSpotId(spotId === -1 ? undefined : spotId);
  }
}
