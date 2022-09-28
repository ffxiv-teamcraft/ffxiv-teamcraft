import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BehaviorSubject, combineLatest, Observable, of } from 'rxjs';
import { debounceTime, filter, first, map, shareReplay, switchMap, tap } from 'rxjs/operators';
import { DataService } from '../../../core/api/data.service';
import { AlarmsFacade } from '../../../core/alarms/+state/alarms.facade';
import { Alarm } from '../../../core/alarms/alarm';
import { MapService } from '../../../modules/map/map.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AlarmGroup } from '../../../core/alarms/alarm-group';
import { TranslateService } from '@ngx-translate/core';
import { GatheringNodesService } from '../../../core/data/gathering-nodes.service';
import { GatheringNode } from '../../../core/data/model/gathering-node';
import { NzMessageService } from 'ng-zorro-antd/message';
import { SpearfishingShadowSize } from '../../../core/data/model/spearfishing-shadow-size';
import { SpearfishingSpeed } from '../../../core/data/model/spearfishing-speed';
import { FormBuilder } from '@angular/forms';
import { LazyDataFacade } from '../../../lazy-data/+state/lazy-data.facade';
import { chunk } from 'lodash';
import { safeCombineLatest } from '../../../core/rxjs/safe-combine-latest';
import { SettingsService } from '../../../modules/settings/settings.service';

interface ResultRow {
  originalItemId: number,
  node: GatheringNode,
  alarms: Alarm[]
}

@Component({
  selector: 'app-gathering-location',
  templateUrl: './gathering-location.component.html',
  styleUrls: ['./gathering-location.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GatheringLocationComponent {

  SpearfishingSpeed = SpearfishingSpeed;

  SpearfishingShadowSize = SpearfishingShadowSize;

  nodeTypes = [
    'Mining',
    'Quarrying',
    'Logging',
    'Harvesting',
    'Fishing',
    'Spearfishing'
  ];

  uses = [
    {
      needsTranslate: true,
      value: 'Reduction',
      icon: 'https://www.garlandtools.org/db/images/item/Reduce.png'
    },
    {
      value: 25200
    },
    {
      value: 33914
    }
  ];

  query$: BehaviorSubject<string> = new BehaviorSubject<string>('');

  results$: Observable<{ rows: ResultRow[], total: number }>;

  alarmsLoaded$: Observable<boolean> = this.alarmsFacade.loaded$;

  alarms$: Observable<Alarm[]> = this.alarmsFacade.allAlarms$;

  alarmGroups$: Observable<AlarmGroup[]> = this.alarmsFacade.allGroups$;

  loading = false;

  showIntro = true;

  compactDisplay$ = new BehaviorSubject<boolean>(localStorage.getItem('gathering-location:compact') === 'true');

  filtersForm = this.fb.group({
    type: [-1],
    use: [-1]
  });

  filters$ = new BehaviorSubject<any>(this.filtersForm.getRawValue());

  itemsSearchIndex$ = of(this.dataService.searchLang).pipe(
    switchMap(lang => {
      let index$ = this.lazyData.getSearchIndex('items');
      if (lang === 'ko') {
        index$ = this.lazyData.getSearchIndex('koItems');
      } else if (lang === 'zh') {
        index$ = this.lazyData.getSearchIndex('zhItems');
      }
      return combineLatest([
        index$,
        this.lazyData.getEntry('gatheringSearchIndex'),
        this.lazyData.getEntry('scripIndex'),
        this.lazyData.getEntry('aetherialReduce')
      ]).pipe(
        first(),
        map(([items, index, scripIndex, aetherialReduce]) => {
          return items.filter(row => {
            return index[row.id] !== undefined;
          }).map(row => {
            return {
              ...row,
              scrip: scripIndex[row.id],
              reduction: aetherialReduce[row.id] > 0,
              type: index[row.id].type
            };
          });
        }),
        shareReplay({ bufferSize: 1, refCount: true })
      );
    })
  );

  // It's page # not index, starting at 1
  page$ = new BehaviorSubject<number>(1);

  pageSize = 12;

  constructor(private dataService: DataService, private alarmsFacade: AlarmsFacade,
              private mapService: MapService, private router: Router,
              private route: ActivatedRoute, public translate: TranslateService,
              private gatheringNodesService: GatheringNodesService, private message: NzMessageService,
              private fb: FormBuilder, private lazyData: LazyDataFacade,
              private settings: SettingsService) {

    const resultsData$ = combineLatest([
      this.query$,
      this.filters$
    ]).pipe(
      debounceTime(500),
      tap(([query, filters]) => {
        const queryParams: any = {
          query: query.length > 0 ? query : null
        };
        if (filters.type > -1) {
          queryParams.type = filters.type;
        } else {
          queryParams.type = null;
        }
        if (filters.use !== -1) {
          queryParams.use = filters.use;
        } else {
          queryParams.use = null;
        }
        this.router.navigate([], {
          queryParamsHandling: 'merge',
          queryParams,
          relativeTo: this.route
        });
        this.showIntro = query.length === 0 && Object.values<number>(filters).every(e => e === -1);
        this.loading = true;
      }),
      filter(([query, filters]) => query.length > 0 || Object.values(filters).some(v => v !== -1)),
      switchMap(([query, filters]) => {
        return this.itemsSearchIndex$.pipe(
          map(searchIndex => {
            let res = searchIndex;
            if (query) {
              res = searchIndex.filter(row => {
                return (row.name[this.dataService.searchLang] || row.name.en).toLowerCase().includes(query.toLowerCase());
              });
            }

            if (filters.use !== -1) {
              res = res.filter(row => {
                if (filters.use === 'Reduction') {
                  return row.reduction;
                } else {
                  return row.scrip === +filters.use;
                }
              });
            }
            if (filters.type !== -1) {
              res = res.filter(row => {
                return Math.abs(row.type) === +filters.type;
              });
            }
            return res;
          }),
          switchMap(rows => {
            return safeCombineLatest(rows.map(row => {
                const itemId = row.id;
                return this.gatheringNodesService.getItemNodes(itemId).pipe(
                  map(nodes => {
                    return nodes.map(node => {
                      return {
                        originalItemId: itemId,
                        node: node,
                        alarms: this.alarmsFacade.generateAlarms(node)
                      };
                    });
                  })
                );
              })
            );
          }),
          map(nodes => {
            return nodes.flat().sort((a, b) => b.node.level - a.node.level);
          })
        );
      }),
      tap(() => {
        this.loading = false;
        this.page$.next(1);
      }),
      map(res => {
        return {
          data: chunk(res, this.pageSize) || [],
          total: res.length
        };
      })
    );

    this.results$ = combineLatest([resultsData$, this.page$]).pipe(
      map(([results, page]) => {
        return {
          rows: results.data[page - 1] || [],
          total: results.total
        };
      })
    );

    this.route.queryParams
      .pipe(first())
      .subscribe(params => {
        this.query$.next(params.query || '');
        if (params.use || params.type) {
          this.filtersForm.patchValue({
            use: params.use || -1,
            type: +params.type || -1
          });
          this.submitFilters();
        }
      });
  }

  public addAlarm(alarm: Alarm, group?: AlarmGroup): void {
    this.alarmsFacade.addAlarmInGroup(alarm, group);
  }

  public canCreateAlarmFromNode(alarms: Alarm[], node: GatheringNode): boolean {
    return alarms.find(alarm => {
      return node.matchingItemId === alarm.itemId
        && Math.floor(node.x) === Math.floor(alarm.coords.x)
        && node.zoneId === alarm.zoneId
        && node.type === alarm.type;
    }) === undefined;
  }

  public canCreateAlarm(alarms: Alarm[], alarm: Alarm): boolean {
    return alarms.find(a => {
      return alarm.itemId === a.itemId
        && Math.floor(alarm.coords.x) === Math.floor(a.coords.x)
        && alarm.zoneId === a.zoneId
        && alarm.type === a.type
        && alarm.fishEyes === a.fishEyes;
    }) === undefined;
  }

  public submitFilters(): void {
    this.filters$.next(this.filtersForm.getRawValue());
  }

  public resetFilters(): void {
    this.filtersForm.reset();
    this.submitFilters();
  }

  public saveCompactDisplay(value: boolean): void {
    localStorage.setItem('gathering-location:compact', value.toString());
    this.compactDisplay$.next(value);
  }

  trackByAlarm(index: number, alarm: Partial<Alarm>): string {
    return `${JSON.stringify(alarm.spawns)}:${JSON.stringify(alarm.weathers)}`;
  }

}
