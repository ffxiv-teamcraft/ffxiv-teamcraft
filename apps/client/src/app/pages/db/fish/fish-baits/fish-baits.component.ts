import { ChangeDetectionStrategy, Component } from '@angular/core';
import { I18nToolsService } from '../../../../core/tools/i18n-tools.service';
import { SettingsService } from '../../../../modules/settings/settings.service';
import { combineLatest, Observable, of } from 'rxjs';
import { map, shareReplay, switchMap } from 'rxjs/operators';
import { FishContextService } from '../../service/fish-context.service';
import { EChartsOption } from 'echarts';
import { LazyDataFacade } from '../../../../lazy-data/+state/lazy-data.facade';
import { formatNumber } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';

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
      const legendData = entries.map(entry => {
        return {
          name: entry.name,
          icon: `image://https://xivapi.com${entry.icon}`
        };
      });
      return <EChartsOption>{
        tooltip: {
          trigger: 'item'
        },
        avoidLabelOverlap: true,
        backgroundColor: '#191E25',
        legend: {
          type: 'scroll',
          orient: 'vertical',
          right: 10,
          top: 20,
          bottom: 20,
          icon: 'circle',
          data: legendData,
          formatter: name => {
            const total = entries.find(e => e.name === name)?.value;
            return `${name}: ${formatNumber(total, this.translate.currentLang, '1.0-0')}`;
          }
        },
        series: [
          {
            type: 'pie',
            radius: ['30%', '50%'],
            data: entries.map(entry => {
              return {
                name: entry.name,
                value: entry.value
              };
            }),
            center: ['40%', '50%'],
            label: {
              show: false
            },
            labelLine: {
              show: false
            },
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
    public readonly fishCtx: FishContextService,
    private readonly translate: TranslateService
  ) {
  }
}
