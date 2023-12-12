import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SettingsService } from '../../../../modules/settings/settings.service';
import { combineLatest } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { FishContextService } from '../../service/fish-context.service';
import { TugNamePipe } from '../../../../pipes/pipes/tug-name.pipe';
import { XivapiIconPipe } from '../../../../pipes/pipes/xivapi-icon.pipe';
import { ActionNamePipe } from '../../../../pipes/pipes/action-name.pipe';
import { ActionIconPipe } from '../../../../pipes/pipes/action-icon.pipe';
import { TranslateModule } from '@ngx-translate/core';
import { I18nPipe } from '../../../../core/i18n.pipe';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NgFor, AsyncPipe, DecimalPipe } from '@angular/common';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { FlexModule } from '@angular/flex-layout/flex';
import { NzCardModule } from 'ng-zorro-antd/card';

@Component({
    selector: 'app-fish-hooksets',
    templateUrl: './fish-hooksets.component.html',
    styleUrls: ['./fish-hooksets.component.less', '../../common-db.less'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [NzCardModule, FlexModule, NzDividerModule, NgFor, NzGridModule, AsyncPipe, DecimalPipe, I18nPipe, TranslateModule, ActionIconPipe, ActionNamePipe, XivapiIconPipe, TugNamePipe]
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

  constructor(public readonly settings: SettingsService, public readonly fishCtx: FishContextService) {
  }
}
