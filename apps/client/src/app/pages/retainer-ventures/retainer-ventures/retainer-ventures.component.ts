import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Retainer, RetainersService } from '../../../core/electron/retainers.service';
import { map, switchMap, takeUntil, tap } from 'rxjs/operators';
import { combineLatest, Observable, of, Subject } from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TeamcraftGearset } from '../../../model/gearset/teamcraft-gearset';
import { GearsetsFacade } from '../../../modules/gearsets/+state/gearsets.facade';
import { StatsService } from '../../../modules/gearsets/stats.service';
import { BaseParam } from '../../../modules/gearsets/base-param';
import { UniversalisService } from '../../../core/api/universalis.service';
import { TeamcraftComponent } from '../../../core/component/teamcraft-component';
import * as _ from 'lodash';
import { XivapiService } from '@xivapi/angular-client';
import { AuthFacade } from '../../../+state/auth.facade';
import { requestsWithDelay } from '../../../core/rxjs/requests-with-delay';
import { SpendingEntry } from '../../currency-spending/spending-entry';
import { TranslateService } from '@ngx-translate/core';
import { InventoryService } from '../../../modules/inventory/inventory.service';
import { safeCombineLatest } from '../../../core/rxjs/safe-combine-latest';
import { LazyDataFacade } from '../../../lazy-data/+state/lazy-data.facade';
import { EnvironmentService } from '../../../core/environment.service';

@Component({
  selector: 'app-retainer-ventures',
  templateUrl: './retainer-ventures.component.html',
  styleUrls: ['./retainer-ventures.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
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

  form: FormGroup;

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
                  let prices = (mbRow.Prices || [])
                    .filter(item => item.IsHQ === false);
                  if (prices.length === 0) {
                    prices = (mbRow.History || [])
                      .filter(item => item.IsHQ === false);
                  }
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
    switchMap(([retainers, inventory, lzeyItemMeldingData]) => {
      return safeCombineLatest(retainers.map(retainer => {
        const gearset = new TeamcraftGearset();
        gearset.job = retainer.job;
        inventory.getRetainerGear(retainer.name)
          .forEach(item => {
            const itemMeldingData = lzeyItemMeldingData[item.itemId];
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
          this.statsService.getStats(gearset, retainer.level, 1),
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
    })
  );

  constructor(private retainersService: RetainersService, private inventoryFacade: InventoryService,
              private lazyData: LazyDataFacade, private fb: FormBuilder, private gearsetsFacade: GearsetsFacade,
              private statsService: StatsService, private universalis: UniversalisService,
              private xivapi: XivapiService, private authFacade: AuthFacade,
              public translate: TranslateService, private environment: EnvironmentService) {
    super();
    this.servers$ = this.xivapi.getServerList().pipe(
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

  selectRetainer(retainer: Retainer & { ilvl: number, gathering: number }): void {
    this.form.patchValue({
      job: retainer.job,
      level: retainer.level,
      ilvl: retainer.ilvl,
      gathering: retainer.gathering
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
