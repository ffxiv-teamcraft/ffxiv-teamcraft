import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { SettingsService } from '../../../../modules/settings/settings.service';
import { map } from 'rxjs/operators';
import { FishContextService } from '../../service/fish-context.service';
import { ItemNamePipe } from '../../../../pipes/pipes/item-name.pipe';
import { I18nPipe } from '../../../../core/i18n.pipe';
import { NzListModule } from 'ng-zorro-antd/list';
import { ItemIconComponent } from '../../../../modules/item-icon/item-icon/item-icon.component';
import { NgIf, AsyncPipe, DatePipe } from '@angular/common';
import { FlexModule } from '@angular/flex-layout/flex';
import { NzCardModule } from 'ng-zorro-antd/card';

@Component({
    selector: 'app-fish-user-ranking',
    templateUrl: './fish-user-ranking.component.html',
    styleUrls: ['./fish-user-ranking.component.less', '../../common-db.less'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [NzCardModule, FlexModule, NgIf, ItemIconComponent, NzListModule, AsyncPipe, DatePipe, I18nPipe, TranslateModule, ItemNamePipe]
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
