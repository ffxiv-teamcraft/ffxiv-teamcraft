import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Retainer, RetainersService } from '../../../core/electron/retainers.service';
import { map, shareReplay, switchMap, takeUntil, tap } from 'rxjs/operators';
import { combineLatest, Observable, of, Subject } from 'rxjs';
import { UntypedFormBuilder, UntypedFormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TeamcraftGearset } from '../../../model/gearset/teamcraft-gearset';
import { GearsetsFacade } from '../../../modules/gearsets/+state/gearsets.facade';
import { StatsService } from '../../../modules/gearsets/stats.service';
import { BaseParam } from '@ffxiv-teamcraft/types';
import { UniversalisService } from '../../../core/api/universalis.service';
import { TeamcraftComponent } from '../../../core/component/teamcraft-component';
import * as _ from 'lodash';
import { AuthFacade } from '../../../+state/auth.facade';
import { requestsWithDelay } from '../../../core/rxjs/requests-with-delay';
import { SpendingEntry } from '../../currency-spending/spending-entry';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { InventoryService } from '../../../modules/inventory/inventory.service';
import { safeCombineLatest } from '../../../core/rxjs/safe-combine-latest';
import { LazyDataFacade } from '../../../lazy-data/+state/lazy-data.facade';
import { EnvironmentService } from '../../../core/environment.service';
import { JobUnicodePipe } from '../../../pipes/pipes/job-unicode.pipe';
import { LazyIconPipe } from '../../../pipes/pipes/lazy-icon.pipe';
import { ItemNamePipe } from '../../../pipes/pipes/item-name.pipe';
import { I18nRowPipe } from '../../../core/i18n/i18n-row.pipe';
import { I18nPipe } from '../../../core/i18n.pipe';
import { MarketboardIconComponent } from '../../../modules/marketboard/marketboard-icon/marketboard-icon.component';
import { DbButtonComponent } from '../../../core/db-button/db-button.component';
import { ItemIconComponent } from '../../../modules/item-icon/item-icon/item-icon.component';
import { PageLoaderComponent } from '../../../modules/page-loader/page-loader/page-loader.component';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzWaveModule } from 'ng-zorro-antd/core/wave';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NgIf, NgFor, AsyncPipe, DecimalPipe } from '@angular/common';
import { FlexModule } from '@angular/flex-layout/flex';

@Component({
    selector: 'app-retainer-ventures',
    templateUrl: './retainer-ventures.component.html',
    styleUrls: ['./retainer-ventures.component.less'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [FlexModule, NgIf, NzAlertModule, NgFor, NzSelectModule, FormsModule, NzFormModule, ReactiveFormsModule, NzGridModule, NzInputNumberModule, NzButtonModule, NzWaveModule, NzIconModule, PageLoaderComponent, ItemIconComponent, DbButtonComponent, MarketboardIconComponent, AsyncPipe, DecimalPipe, I18nPipe, TranslateModule, I18nRowPipe, ItemNamePipe, LazyIconPipe, JobUnicodePipe]
})
export class RetainerVenturesComponent extends TeamcraftComponent implements OnInit {

  loading = false;

  filters$: Subject<any> = new Subject<any>();

  jobList$ = this.lazyData.getEntry('jobName').pipe(
    map(jobName => {
      return Object.keys(jobName)
        .map(key => +key)
        .filter(key => key < 8 || key > 15);
    })
  );

  servers$: Observable<string[]>;

  form: UntypedFormGroup;

  results$: Observable<SpendingEntry[]> = this.filters$.pipe(
    tap(() => this.loading = true),
    switchMap(filters => {
      return combineLatest([
        this.lazyData.getEntry('retainerTasks'),
        this.lazyData.getRow('jobAbbr', filters.job),
        this.lazyData.getEntry('jobCategories')
      ]).pipe(
        map(([retainerTasks, jobAbbr, jobCategories]) => {
          return retainerTasks
            .filter(task => {
              return jobCategories[task.category].jobs.includes(jobAbbr.en)
                && task.lvl <= filters.level
                && task.reqIlvl <= filters.ilvl
                && task.reqGathering <= filters.gathering;
            })
            .map(task => {
              return {
                ...task,
                obtainedAmount: task.quantities
                  .filter(q => filters[q.stat] >= q.value)
                  .sort((a, b) => b.quantity - a.quantity)[0]?.quantity
              };
            });
        }),
        switchMap(tasks => {
          const batches = _.chunk(tasks, 100)
            .map((chunk: any) => {
              return this.universalis.getServerPrices(
                filters.server,
                ...chunk.map(entry => entry.item)
              );
            });
          return requestsWithDelay(batches, 250).pipe(
            map(res => {
              return [].concat.apply([], res)
                .filter(mbRow => {
                  return mbRow.History && mbRow.History.length > 0 || mbRow.Prices && mbRow.Prices.length > 0;
                });
            }),
            map((res) => {
              return tasks
                .filter(task => {
                  return res.some(r => r.ItemId === task.item);
                })
                .map(entry => {
                  const mbRow = res.find(r => r.ItemId === entry.item);
                  const prices = (mbRow.History || [])
                    .filter(item => item.IsHQ === false);
                  const price = prices
                    .sort((a, b) => a.PricePerUnit - b.PricePerUnit)[0];
                  return {
                    ...entry,
                    itemID: entry.item,
                    price: price?.PricePerUnit || 0,
                    rate: price?.PricePerUnit || 0
                  };
                })
                .filter(entry => entry.price)
                .sort((a, b) => {
                  const aPrice = a.price * a.obtainedAmount;
                  const bPrice = b.price * b.obtainedAmount;
                  const priceDiff = bPrice - aPrice;
                  if (priceDiff === 0) {
                    return b.rate * b.obtainedAmount - a.rate * a.obtainedAmount;
                  }
                  return priceDiff;
                })
                .slice(0, 50);
            })
          );
        })
      );
    }),
    tap(() => this.loading = false)
  );

  private sortedRetainers$ = this.retainersService.retainers$.pipe(
    map(retainers => {
      return Object.values<Retainer>(retainers)
        .filter(retainer => !!retainer.name)
        .sort((a, b) => a.order - b.order);
    })
  );

  retainersWithStats$ = combineLatest([this.sortedRetainers$, this.inventoryFacade.inventory$, this.lazyData.getEntry('itemMeldingData')]).pipe(
    switchMap(([retainers, inventory, lazyItemMeldingData]) => {
      return safeCombineLatest(retainers.map(retainer => {
        const gearset = new TeamcraftGearset();
        gearset.job = retainer.job;
        inventory.getRetainerGear(retainer.name)
          .forEach(item => {
            const itemMeldingData = lazyItemMeldingData[item.itemId];
            const materias = item.materias || [];
            while (materias.length < itemMeldingData.slots) {
              materias.push(0);
            }
            if (itemMeldingData.overmeld) {
              while (materias.length < 5) {
                materias.push(0);
              }
            }
            gearset[this.gearsetsFacade.getPropertyName(item.slot)] = {
              itemId: item.itemId,
              hq: item.hq,
              materias: materias,
              canOvermeld: itemMeldingData.overmeld,
              materiaSlots: itemMeldingData.slots,
              baseParamModifier: itemMeldingData.modifier
            };
          });
        return combineLatest([
          gearset.mainHand ? this.statsService.getStats(gearset, retainer.level, 1) : of([]),
          this.statsService.getAvgIlvl(gearset)
        ]).pipe(
          map(([stats, avgIlvl]) => {
            return {
              ...retainer,
              gathering: stats.find(stat => stat.id === BaseParam.GATHERING)?.value || 0,
              perception: stats.find(stat => stat.id === BaseParam.PERCEPTION)?.value || 0,
              ilvl: avgIlvl
            };
          })
        );
      }));
    }),
    shareReplay(1)
  );

  retainersMissingStats$ = this.retainersWithStats$.pipe(
    map(retainers => {
      return retainers.filter(r => r.ilvl === 0);
    })
  );

  constructor(private retainersService: RetainersService, private inventoryFacade: InventoryService,
              private lazyData: LazyDataFacade, private fb: UntypedFormBuilder, private gearsetsFacade: GearsetsFacade,
              private statsService: StatsService, private universalis: UniversalisService,
              private authFacade: AuthFacade,
              public translate: TranslateService, private environment: EnvironmentService) {
    super();
    this.servers$ = this.lazyData.servers$.pipe(
      map(servers => {
        return servers.sort();
      })
    );
    this.form = this.fb.group({
      job: [null, Validators.required],
      level: [null, [Validators.required, Validators.min(1), Validators.max(this.environment.maxLevel)]],
      ilvl: [null, Validators.required],
      gathering: [null],
      perception: [null],
      server: [null, Validators.required]
    }, {
      validators: control => {
        if (!control.get('gathering').value && [16, 17, 18].includes(control.get('job').value)) {
          return { required: true };
        }
        return null;
      }
    });
  }

  selectRetainer(retainer: Retainer & { ilvl: number, gathering: number, perception: number }): void {
    this.form.patchValue({
      job: retainer.job,
      level: retainer.level,
      ilvl: retainer.ilvl,
      gathering: retainer.gathering,
      perception: retainer.perception
    });
  }

  ngOnInit(): void {
    this.authFacade.loggedIn$.pipe(
      switchMap(loggedIn => {
        if (loggedIn) {
          return this.authFacade.mainCharacter$.pipe(
            map(character => character.Server)
          );
        } else {
          return of(null);
        }
      }),
      takeUntil(this.onDestroy$)
    ).subscribe(server => {
      if (server !== null) {
        this.form.patchValue({ server });
      }
    });
  }

}
