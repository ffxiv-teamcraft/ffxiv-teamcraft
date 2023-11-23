import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { SettingsService } from '../../../../modules/settings/settings.service';
import { map, startWith } from 'rxjs/operators';
import { FishContextService } from '../../service/fish-context.service';
import { CharacterNamePipe } from '../../../../pipes/pipes/character-name.pipe';
import { ItemNamePipe } from '../../../../pipes/pipes/item-name.pipe';
import { I18nPipe } from '../../../../core/i18n.pipe';
import { ItemIconComponent } from '../../../../modules/item-icon/item-icon/item-icon.component';
import { UserAvatarComponent } from '../../../../modules/user-avatar/user-avatar/user-avatar.component';
import { NzListModule } from 'ng-zorro-antd/list';
import { NgIf, NgFor, AsyncPipe, DatePipe } from '@angular/common';
import { FlexModule } from '@angular/flex-layout/flex';
import { NzCardModule } from 'ng-zorro-antd/card';

@Component({
    selector: 'app-fish-top-users',
    templateUrl: './fish-top-users.component.html',
    styleUrls: ['./fish-top-users.component.less', '../../common-db.less'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [NzCardModule, FlexModule, NgIf, NzListModule, NgFor, UserAvatarComponent, ItemIconComponent, AsyncPipe, DatePipe, I18nPipe, TranslateModule, ItemNamePipe, CharacterNamePipe]
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
