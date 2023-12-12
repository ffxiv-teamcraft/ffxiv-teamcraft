import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SettingsService } from '../../../../modules/settings/settings.service';
import { map, shareReplay, startWith } from 'rxjs/operators';
import { FishContextService } from '../../service/fish-context.service';
import { Observable } from 'rxjs';
import { LazyRowPipe } from '../../../../pipes/pipes/lazy-row.pipe';
import { XivapiIconPipe } from '../../../../pipes/pipes/xivapi-icon.pipe';
import { I18nRowPipe } from '../../../../core/i18n/i18n-row.pipe';
import { TranslateModule } from '@ngx-translate/core';
import { I18nPipe } from '../../../../core/i18n.pipe';
import { NgIf, NgFor, AsyncPipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { FlexModule } from '@angular/flex-layout/flex';

interface FishDetailsStatsSummary {
  min?: number;
  max?: number;
  avg?: number;
  gathering?: number;
  snagging?: number;
}

@Component({
    selector: 'app-fish-details-container',
    templateUrl: './fish-details-container.component.html',
    styleUrls: ['./fish-details-container.component.less', '../../common-db.less'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [FlexModule, NzButtonModule, NzIconModule, NzToolTipModule, NzSelectModule, FormsModule, NgIf, NgFor, AsyncPipe, DecimalPipe, I18nPipe, TranslateModule, I18nRowPipe, XivapiIconPipe, LazyRowPipe]
})
export class FishDetailsContainerComponent {
  public readonly loading$ = this.fishCtx.statisticsByFish$.pipe(map((res) => res.loading));

  public readonly spotsLoading$ = this.fishCtx.spotsByFish$.pipe(map((res) => res.loading));

  public readonly spotIdFilter$ = this.fishCtx.spotId$.pipe(map((spotId) => spotId ?? -1));

  public readonly spots$ = this.fishCtx.spotsByFish$.pipe(map((res) => res.data));

  public readonly stats$: Observable<FishDetailsStatsSummary> = this.fishCtx.statisticsByFish$.pipe(
    map((res) => ({
      min: res.data?.stats.aggregate.min.size / 10,
      max: res.data?.stats.aggregate.max.size / 10,
      avg: res.data?.stats.aggregate.avg.size / 10,
      gathering: res.data?.stats.aggregate.min.gathering,
      snagging: res.data?.snagging
    })),
    startWith({}),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  constructor(public readonly settings: SettingsService, private readonly fishCtx: FishContextService) {
  }

  public setSpotIdFilter(spotId: number) {
    this.fishCtx.setSpotId(spotId === -1 ? undefined : spotId);
  }
}
