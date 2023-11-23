import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { I18nToolsService } from '../../../../core/tools/i18n-tools.service';
import { combineLatest, of } from 'rxjs';
import { filter, first, map, switchMap } from 'rxjs/operators';
import { Datagrid, FishContextService } from '../../service/fish-context.service';
import { LazyDataFacade } from '../../../../lazy-data/+state/lazy-data.facade';
import { AuthFacade } from '../../../../+state/auth.facade';
import { FishDataService } from '../../service/fish-data.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { FishingSpotDatagridComponent } from '../fishing-spot-datagrid/fishing-spot-datagrid.component';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzWaveModule } from 'ng-zorro-antd/core/wave';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { ItemIconComponent } from '../../../../modules/item-icon/item-icon/item-icon.component';
import { NgIf, AsyncPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { FlexModule } from '@angular/flex-layout/flex';
import { NzCardModule } from 'ng-zorro-antd/card';

@Component({
    selector: 'app-fishing-spot-bait-datagrid',
    templateUrl: './fishing-spot-bait-datagrid.component.html',
    styleUrls: [
        './fishing-spot-bait-datagrid.component.less'
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [NzCardModule, FlexModule, NzSwitchModule, FormsModule, NgIf, ItemIconComponent, NzButtonModule, NzWaveModule, NzToolTipModule, NzPopconfirmModule, NzIconModule, FishingSpotDatagridComponent, AsyncPipe, TranslateModule]
})
export class FishingSpotBaitDatagridComponent {
  @Input()
  public activeFish?: number | undefined;

  @Output()
  public readonly activeFishChange = new EventEmitter<number | undefined>();

  public readonly loading$ = this.fishCtx.baitsBySpotByFish$.pipe(map((res) => res.loading));

  public readonly table$ = combineLatest([this.fishCtx.baitsBySpotByFish$, this.fishCtx.spotId$, this.lazyData.getEntry('fishingSpots')]).pipe(
    filter(([res]) => !!res.data),
    switchMap(([res, spotId, spots]) => {
      const fishes: number[] = spots.find((spot) => spot.id === spotId)?.fishes ?? [];
      const data = {
        ...res.data,
        data: res.data.data.sort((a, b) => fishes.indexOf(a.rowId) - fishes.indexOf(b.rowId))
      };
      return combineLatest([
        of(data),
        ...res.data.colDefs.map((i) => {
          if (i.colId === -1) {
            return of({
              id: i.colId,
              name: this.translate.instant('DB.FISHING_SPOT.Miss')
            });
          }
          return this.i18n.getNameObservable('items', i.colId).pipe(map((name) => ({ id: i.colId, name })));
        })
      ]);
    }),
    map(([data, ...names]: [Datagrid, ...{ id: number; name: string }[]]) => {
      return {
        ...data,
        colDefs: data.colDefs.sort((a, b) => {
          const aName = names.find((i) => i.id === a.colId);
          const bName = names.find((i) => i.id === b.colId);
          if (!aName?.name) return 1;
          if (!bName?.name) return -1;
          return aName.name.localeCompare(bName.name);
        })
      };
    })
  );

  showMisses$ = this.fishCtx.showMisses$;

  public isAllaganChecker$ = this.authFacade.user$.pipe(
    map(user => user.allaganChecker || user.admin)
  );

  constructor(
    private readonly fishCtx: FishContextService,
    private readonly lazyData: LazyDataFacade,
    private readonly i18n: I18nToolsService,
    private readonly translate: TranslateService,
    private readonly authFacade: AuthFacade,
    private readonly fishDataService: FishDataService,
    private readonly message: NzMessageService
  ) {
  }

  deleteBait(id: number): void {
    this.fishCtx.spotId$.pipe(
      first(),
      switchMap(spotId => {
        return this.fishDataService.deleteBaitFromSpot(id, spotId);
      })
    ).subscribe(() => {
      this.message.success(this.translate.instant('DB.FISHING_SPOT.Bait_removed'));
      this.fishCtx.refresh();
    });
  }
}
