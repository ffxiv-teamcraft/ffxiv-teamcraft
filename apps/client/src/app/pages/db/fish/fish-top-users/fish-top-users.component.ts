import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { SettingsService } from 'apps/client/src/app/modules/settings/settings.service';
import { map, startWith } from 'rxjs/operators';
import { FishContextService } from '../../service/fish-context.service';

@Component({
  selector: 'app-fish-top-users',
  templateUrl: './fish-top-users.component.html',
  styleUrls: ['./fish-top-users.component.less', '../../common-db.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FishTopUsersComponent {
  public readonly loading$ = this.fishCtx.rankingsByFish$.pipe(map((res) => res.loading));

  public readonly rankings$ = this.fishCtx.rankingsByFish$.pipe(
    map((res) => res.data?.rankings ?? []),
    startWith([])
  );

  constructor(public readonly settings: SettingsService, public readonly fishCtx: FishContextService, public readonly translate: TranslateService) {
  }

  getRankIcon(rank: number): string {
    if (rank < 1 || rank > 3) {
      return '';
    }
    return ['gold', 'silver', 'bronze'][rank - 1];
  }
}
