import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SettingsService } from '../../../../modules/settings/settings.service';
import { map } from 'rxjs/operators';
import { FishContextService } from '../../service/fish-context.service';
import { TugNamePipe } from '../../../../pipes/pipes/tug-name.pipe';
import { XivapiIconPipe } from '../../../../pipes/pipes/xivapi-icon.pipe';
import { ActionNamePipe } from '../../../../pipes/pipes/action-name.pipe';
import { ActionIconPipe } from '../../../../pipes/pipes/action-icon.pipe';
import { TranslateModule } from '@ngx-translate/core';
import { I18nPipe } from '../../../../core/i18n.pipe';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { AsyncPipe, DecimalPipe } from '@angular/common';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { FlexModule } from '@angular/flex-layout/flex';
import { NzCardModule } from 'ng-zorro-antd/card';
import { LazyRowPipe } from '../../../../pipes/pipes/lazy-row.pipe';
import { I18nRowPipe } from '../../../../core/i18n/i18n-row.pipe';

@Component({
  selector: 'app-fish-lures',
  templateUrl: './fish-lures.component.html',
  styleUrls: ['./fish-lures.component.less', '../../common-db.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [NzCardModule, FlexModule, NzDividerModule, NzGridModule, AsyncPipe, DecimalPipe, I18nPipe, TranslateModule, ActionIconPipe, ActionNamePipe, XivapiIconPipe, TugNamePipe, LazyRowPipe, I18nRowPipe]
})
export class FishLuresComponent {
  public readonly loading$ = this.fishCtx.luresByFish$.pipe(map((lures) => lures.loading));

  public readonly lures$ = this.fishCtx.luresByFish$.pipe(
    map((res) => {
      let totalLures = 0;
      let totalALure = 0;
      let totalMLure = 0;
      const aLureData = {
        1: 0,
        2: 0,
        3: 0
      };
      const mLureData = {
        1: 0,
        2: 0,
        3: 0
      };
      res.data.lures_per_fish_per_spot.forEach(row => {
        if (row.aLure > 0) {
          totalALure += row.occurences;
          totalLures += row.occurences;
          aLureData[row.aLure] += row.occurences;
        }
        if (row.mLure > 0) {
          totalMLure += row.occurences;
          totalLures += row.occurences;
          mLureData[row.mLure] += row.occurences;
        }
      });
      return {
        percentALure: 100 * totalALure / (totalLures || 1),
        totalALure,
        percentMLure: 100 * totalMLure / (totalLures || 1),
        totalMLure,
        aLure: aLureData,
        aLurePercent: {
          1: 100 * aLureData[1] / (totalLures || 1),
          2: 100 * aLureData[2] / (totalLures || 1),
          3: 100 * aLureData[3] / (totalLures || 1)
        },
        mLure: mLureData,
        mLurePercent: {
          1: 100 * mLureData[1] / (totalLures || 1),
          2: 100 * mLureData[2] / (totalLures || 1),
          3: 100 * mLureData[3] / (totalLures || 1)
        }
      };
    })
  );

  constructor(public readonly settings: SettingsService, public readonly fishCtx: FishContextService) {
  }
}
