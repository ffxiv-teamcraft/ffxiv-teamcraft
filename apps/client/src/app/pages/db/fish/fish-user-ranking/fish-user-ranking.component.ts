import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { SettingsService } from '../../../../modules/settings/settings.service';
import { map } from 'rxjs/operators';
import { FishContextService } from '../../service/fish-context.service';

@Component({
  selector: 'app-fish-user-ranking',
  templateUrl: './fish-user-ranking.component.html',
  styleUrls: ['./fish-user-ranking.component.less', '../../common-db.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FishUserRankingComponent {
  public readonly loading$ = this.fishCtx.rankingsByFish$.pipe(map((res) => res.loading));

  public readonly userRanking$ = this.fishCtx.rankingsByFish$.pipe(map((res) => res.data?.userRanking?.[0] ?? undefined));

  constructor(public readonly settings: SettingsService, public readonly fishCtx: FishContextService, public readonly translate: TranslateService) {
  }

  getRankIcon(rank: number): string {
    if (rank < 1 || rank > 3) {
      return '';
    }
    return ['gold', 'silver', 'bronze'][rank - 1];
  }
}
