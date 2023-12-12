import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BehaviorSubject, combineLatest, Observable, of } from 'rxjs';
import { debounceTime, filter, first, map, shareReplay, switchMap, tap } from 'rxjs/operators';
import { DataService } from '../../../core/api/data.service';
import { AlarmsFacade } from '../../../core/alarms/+state/alarms.facade';
import { PersistedAlarm } from '../../../core/alarms/persisted-alarm';
import { MapService } from '../../../modules/map/map.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AlarmGroup } from '../../../core/alarms/alarm-group';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { GatheringNodesService } from '../../../core/data/gathering-nodes.service';
import { GatheringNode } from '@ffxiv-teamcraft/types';
import { NzMessageService } from 'ng-zorro-antd/message';
import { UntypedFormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LazyDataFacade } from '../../../lazy-data/+state/lazy-data.facade';
import { chunk } from 'lodash';
import { safeCombineLatest } from '../../../core/rxjs/safe-combine-latest';
import { AlarmDetails, SpearfishingShadowSize, SpearfishingSpeed } from '@ffxiv-teamcraft/types';
import { AlarmDisplayPipe } from '../../../core/alarms/alarm-display.pipe';
import { LazyRowPipe } from '../../../pipes/pipes/lazy-row.pipe';
import { HooksetActionIdPipe } from '../../../pipes/pipes/hookset-action-id.pipe';
import { TugNamePipe } from '../../../pipes/pipes/tug-name.pipe';
import { XivapiIconPipe } from '../../../pipes/pipes/xivapi-icon.pipe';
import { NodeTypeIconPipe } from '../../../pipes/pipes/node-type-icon.pipe';
import { ActionNamePipe } from '../../../pipes/pipes/action-name.pipe';
import { ActionIconPipe } from '../../../pipes/pipes/action-icon.pipe';
import { ItemNamePipe } from '../../../pipes/pipes/item-name.pipe';
import { I18nPipe } from '../../../core/i18n.pipe';
import { PageLoaderComponent } from '../../../modules/page-loader/page-loader/page-loader.component';
import { FullpageMessageComponent } from '../../../modules/fullpage-message/fullpage-message/fullpage-message.component';
import { AlarmButtonComponent } from '../../../modules/alarm-button/alarm-button/alarm-button.component';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { SpearfishingSpeedComponent } from '../../../modules/spearfishing-speed-tooltip/spearfishing-speed/spearfishing-speed.component';
import { FishingBaitComponent } from '../../../modules/fishing-bait/fishing-bait/fishing-bait.component';
import { GatheringItemUsesComponent } from '../../../modules/node-details/gathering-item-uses/gathering-item-uses.component';
import { NodeDetailsComponent } from '../../../modules/node-details/node-details/node-details.component';
import { MapComponent } from '../../../modules/map/map/map.component';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { NzWaveModule } from 'ng-zorro-antd/core/wave';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { ItemIconComponent } from '../../../modules/item-icon/item-icon/item-icon.component';
import { NgFor, NgIf, NgTemplateOutlet, AsyncPipe } from '@angular/common';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { FlexModule } from '@angular/flex-layout/flex';

interface ResultRow {
  originalItemId: number,
  node: GatheringNode,
  alarms: AlarmDetails[]
}

@Component({
    selector: 'app-gathering-location',
    templateUrl: './gathering-location.component.html',
    styleUrls: ['./gathering-location.component.less'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [FormsModule, ReactiveFormsModule, FlexModule, NzButtonModule, NzIconModule, NzInputModule, NzSelectModule, NgFor, NgIf, ItemIconComponent, NzSwitchModule, NzToolTipModule, NzWaveModule, NzPaginationModule, NgTemplateOutlet, NzCardModule, MapComponent, NodeDetailsComponent, GatheringItemUsesComponent, FishingBaitComponent, SpearfishingSpeedComponent, NzTagModule, AlarmButtonComponent, FullpageMessageComponent, PageLoaderComponent, AsyncPipe, I18nPipe, TranslateModule, ItemNamePipe, ActionIconPipe, ActionNamePipe, NodeTypeIconPipe, XivapiIconPipe, TugNamePipe, HooksetActionIdPipe, LazyRowPipe, AlarmDisplayPipe]
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
      icon: './assets/icons/Reduce.png'
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

  alarms$: Observable<PersistedAlarm[]> = this.alarmsFacade.allAlarms$;

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
        filter((data) => data.every(Boolean)),
        first(),
        map(([items, index, scripIndex, aetherialReduce]) => {
          return items.filter(row => {
            return index[row.id] !== undefined;
          }).map(row => {
            return {
              ...row,
              scrip: scripIndex[row.id],
              reduction: aetherialReduce[row.id] > 0,
              types: index[row.id].types
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
              private fb: UntypedFormBuilder, private lazyData: LazyDataFacade) {

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
                return row.types.some(t => Math.abs(t) === +filters.type);
              });
            }
            return [res, filters];
          }),
          switchMap(([rows, filters]) => {
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
            ).pipe(
              map(rows => {
                return rows
                  .flat()
                  .filter((row: { node: GatheringNode }) => {
                    return filters.type === -1 || Math.abs(row.node.type) === +filters.type;
                  })
                  .sort((a: { node: GatheringNode }, b: { node: GatheringNode }) => b.node.level - a.node.level);
              })
            );
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

  public addAlarm(alarm: PersistedAlarm, group?: AlarmGroup): void {
    this.alarmsFacade.addAlarmInGroup(alarm, group);
  }

  public canCreateAlarmFromNode(alarms: PersistedAlarm[], node: GatheringNode): boolean {
    return alarms.find(alarm => {
      return node.matchingItemId === alarm.itemId
        && Math.floor(node.x) === Math.floor(alarm.coords.x)
        && node.zoneId === alarm.zoneId
        && node.type === alarm.type;
    }) === undefined;
  }

  public submitFilters(): void {
    this.filters$.next(this.filtersForm.getRawValue());
  }

  public resetFilters(): void {
    this.filtersForm.reset({
      type: -1,
      use: -1
    });
    this.submitFilters();
  }

  public saveCompactDisplay(value: boolean): void {
    localStorage.setItem('gathering-location:compact', value.toString());
    this.compactDisplay$.next(value);
  }

  trackByAlarm(index: number, alarm: Partial<PersistedAlarm>): string {
    return `${JSON.stringify(alarm.spawns)}:${JSON.stringify(alarm.weathers)}`;
  }

}
