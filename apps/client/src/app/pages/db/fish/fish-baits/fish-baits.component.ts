import { ChangeDetectionStrategy, Component } from '@angular/core';
import { I18nToolsService } from '../../../../core/tools/i18n-tools.service';
import { SettingsService } from '../../../../modules/settings/settings.service';
import { combineLatest, Observable, of } from 'rxjs';
import { map, shareReplay, switchMap } from 'rxjs/operators';
import { FishContextService } from '../../service/fish-context.service';
import { EChartsOption } from 'echarts';
import { LazyDataFacade } from '../../../../lazy-data/+state/lazy-data.facade';

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
      const baitNames$ = combineLatest(Object.values(res.data.byId).map((item) =>
        this.i18n.getNameObservable('items', item.id).pipe(map((name) => ({ id: item.id, name })))
      ));
      const baitIcons$ = combineLatest(Object.values(res.data.byId).map((item) =>
        this.lazyData.getRow('itemIcons', item.id).pipe(map((icon) => ({ id: item.id, icon })))
      ));
      return combineLatest([baitNames$, baitIcons$]).pipe(
        map(([names, icons]) => {
          return Object.values(res.data.byId)
            .sort((a, b) => b.occurrences - a.occurrences)
            .slice(0, 10)
            .map((bait) => ({
              name: names.find((i) => i.id === bait.id)?.name ?? '--',
              value: bait.occurrences,
              baitId: bait.id,
              icon: icons.find(i => i.id === bait.id)?.icon ?? ''
            }))
            .sort((a, b) => b.value - a.value);
        })
      );
    }),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  options$: Observable<EChartsOption> = this.baitsChartData$.pipe(
    map(entries => {
      return {
        tooltip: {
          trigger: 'item'
        },
        avoidLabelOverlap: true,
        backgroundColor: '#191E25',
        series: [
          {
            type: 'pie',
            radius: '40%',
            data: entries.map(entry => {
              return {
                name: entry.name,
                value: entry.value
              };
            }),
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            }
          }
        ]
      };
    })
  );

  constructor(
    private readonly i18n: I18nToolsService,
    private readonly lazyData: LazyDataFacade,
    public readonly settings: SettingsService,
    public readonly fishCtx: FishContextService
  ) {
  }
}
