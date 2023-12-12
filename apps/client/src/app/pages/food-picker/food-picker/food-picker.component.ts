import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { debounceTime, filter, map, switchMap, tap } from 'rxjs/operators';
import { stats } from '../../../core/data/sources/stats';
import { TeamcraftComponent } from '../../../core/component/teamcraft-component';
import { ActivatedRoute, Router } from '@angular/router';
import { LazyDataFacade } from '../../../lazy-data/+state/lazy-data.facade';
import { I18nName, SearchFilter, SearchType } from '@ffxiv-teamcraft/types';
import { DataService } from '../../../core/api/data.service';
import { withLazyData } from '../../../core/rxjs/with-lazy-data';
import { LazyIconPipe } from '../../../pipes/pipes/lazy-icon.pipe';
import { I18nRowPipe } from '../../../core/i18n/i18n-row.pipe';
import { TranslateModule } from '@ngx-translate/core';
import { I18nPipe } from '../../../core/i18n.pipe';
import { MarketboardIconComponent } from '../../../modules/marketboard/marketboard-icon/marketboard-icon.component';
import { I18nNameComponent } from '../../../core/i18n/i18n-name/i18n-name.component';
import { ItemIconComponent } from '../../../modules/item-icon/item-icon/item-icon.component';
import { DbButtonComponent } from '../../../core/db-button/db-button.component';
import { NzListModule } from 'ng-zorro-antd/list';
import { FormsModule } from '@angular/forms';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NgIf, NgFor, AsyncPipe } from '@angular/common';
import { FlexModule } from '@angular/flex-layout/flex';

@Component({
    selector: 'app-food-picker',
    templateUrl: './food-picker.component.html',
    styleUrls: ['./food-picker.component.less'],
    standalone: true,
    imports: [FlexModule, NgIf, NzSelectModule, FormsModule, NgFor, NzListModule, DbButtonComponent, ItemIconComponent, I18nNameComponent, MarketboardIconComponent, AsyncPipe, I18nPipe, TranslateModule, I18nRowPipe, LazyIconPipe]
})
export class FoodPickerComponent extends TeamcraftComponent {

  public availableStats = stats;

  public stats$ = this.route.queryParamMap.pipe(
    map(query => {
      if (query.get('stats')) {
        const parsedStats = query.get('stats').split(',');
        return parsedStats.map(name => stats.find(s => s.en === name)).filter(s => !!s);
      }
      return [];
    })
  );

  public results$: Observable<any[]>;

  public loading = false;

  constructor(private dataService: DataService, private lazyData: LazyDataFacade,
              private route: ActivatedRoute, private router: Router) {
    super();

    this.results$ = this.stats$.pipe(
      filter(pickedStats => {
        return pickedStats.length > 0 && pickedStats.every(s => s !== null);
      }),
      debounceTime(500),
      switchMap((pickedStats) => {
        this.loading = true;

        const filters = pickedStats.map(stat => {
          return {
            name: `bonuses.${stat.id}.NQ`,
            minMax: true,
            value: { min: 0, max: 9999 }
          } as SearchFilter;
        });

        return this.dataService.search('', SearchType.ITEM, filters).pipe(
          map(searchResult => ({ searchResult, pickedStats }))
        );
      }),
      withLazyData(this.lazyData, 'foods', 'medicines'),
      map(([{ searchResult, pickedStats }, foods, medicines]) => {
        return searchResult
          .map(item => {
            const itemDetails = [...foods, ...medicines].find(f => f.ID === item.itemId);
            if (!itemDetails) {
              return undefined;
            }
            return {
              id: item.itemId,
              bonuses: Object.values<any>(itemDetails.Bonuses).sort((a, b) => {
                return pickedStats.findIndex(s => s.id === a.ID) - pickedStats.findIndex(s => s.id === b.ID);
              })
            };
          })
          .filter(Boolean)
          .sort((a, b) => {
            return this.sortBy(a, b, 'Max', pickedStats) || this.sortBy(a, b, 'Value', pickedStats);
          });
      }),
      tap(() => this.loading = false)
    );
  }

  private getSortedBonusesByPickedStats(bonuses: any[], pickedStats: Array<I18nName & { filterName: string, id: number }>): any[] {
    return [...bonuses].sort((a, b) => {
      if (pickedStats.some(s => s.id === a.ID)) {
        return -1;
      }
      if (pickedStats.some(s => s.id === b.ID)) {
        return 1;
      }
      return 0;
    });
  }

  sortBy(a: any, b: any, prop: 'Value' | 'Max', pickedStats: Array<I18nName & { filterName: string, id: number }>): 1 | 0 | -1 {
    const aSortedBonuses = this.getSortedBonusesByPickedStats(a.bonuses, pickedStats);
    const bSortedBonuses = this.getSortedBonusesByPickedStats(b.bonuses, pickedStats);
    if (aSortedBonuses[0][prop] > bSortedBonuses[0][prop]) {
      return -1;
    } else if (aSortedBonuses[0][prop] < bSortedBonuses[0][prop]) {
      return 1;
    } else if (aSortedBonuses[1] && bSortedBonuses[1]) {
      if (aSortedBonuses[1][prop] > bSortedBonuses[1][prop]) {
        return -1;
      } else if (aSortedBonuses[1][prop] < bSortedBonuses[1][prop]) {
        return 1;
      }
    }
    return 0;
  }

  updateStats(pickedStats: any[]): void {
    if (pickedStats.length === 0) {
      this.router.navigate([], {
        queryParams: {},
        relativeTo: this.route,
        queryParamsHandling: 'merge'
      });
    } else {
      this.router.navigate([], {
        queryParams: {
          stats: pickedStats.map(s => s.en).join(',')
        },
        relativeTo: this.route
      });

    }
  }

}
