import { Component, Inject } from '@angular/core';
import { INVENTORY_OPTIMIZER, InventoryOptimizer } from '../optimizations/inventory-optimizer';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { filter, map, startWith, switchMap, switchMapTo, tap } from 'rxjs/operators';
import { InventoryOptimization } from '../inventory-optimization';
import { InventoryItem } from '../../../model/user/inventory/inventory-item';
import * as _ from 'lodash';
import { uniq, uniqBy } from 'lodash';
import { ContainerType } from '../../../model/user/inventory/container-type';
import { NzMessageService } from 'ng-zorro-antd/message';
import { TranslateService } from '@ngx-translate/core';
import { HasTooFew } from '../optimizations/has-too-few';
import { ConsolidateStacks } from '../optimizations/consolidate-stacks';
import { UnwantedMaterials } from '../optimizations/unwanted-materials';
import { SettingsService } from '../../../modules/settings/settings.service';
import { CanBeBought } from '../optimizations/can-be-bought';
import { InventoryService } from '../../../modules/inventory/inventory.service';
import { LazyDataFacade } from '../../../lazy-data/+state/lazy-data.facade';
import { safeCombineLatest } from '../../../core/rxjs/safe-combine-latest';

@Component({
  selector: 'app-inventory-optimizer',
  templateUrl: './inventory-optimizer.component.html',
  styleUrls: ['./inventory-optimizer.component.less']
})
export class InventoryOptimizerComponent {

  public reloader$: BehaviorSubject<void> = new BehaviorSubject<void>(null);
  public ignoreArray: { id: string, itemId: number, containerName?: string }[] = JSON.parse(localStorage.getItem(`optimizations:ignored`) || '[]');
  //hiddenArray tracks hidden optimizers
  public hiddenArray: { optimizerId: string }[] = JSON.parse(localStorage.getItem('optimizations:hidden') || '[]');
  public optimizations$: Observable<InventoryOptimization[]> = this.lazyData.getEntry('extracts').pipe(
    switchMap((extracts) => {
      return combineLatest([
        this.settings.settingsChange$.pipe(
          filter(change => {
            return change.startsWith('optimizer:');
          }),
          startWith(0)
        ),
        this.reloader$
      ]).pipe(
        switchMapTo(this.inventoryFacade.inventory$.pipe(
          switchMap(inventory => {
            return safeCombineLatest(
              this.optimizers
                .filter(optimizer => this.showHidden || !this.hiddenArray.some(o => o.optimizerId === optimizer.getId()))
                .map(optimizer => {
                  return safeCombineLatest(inventory.toArray()
                    .filter(item => {
                      return item.contentId === inventory.contentId
                        && this.settings.ignoredInventories.indexOf(this.inventoryFacade.getContainerDisplayName(item)) === -1
                        && [
                          ContainerType.RetainerMarket,
                          ContainerType.RetainerEquippedGear
                        ].indexOf(item.containerId) === -1;
                    })
                    .map(item => {
                      return optimizer.getOptimization(item, inventory, extracts).pipe(
                        map(messageParams => {
                          return {
                            item: item,
                            containerName: this.getContainerName(item),
                            isRetainer: item.retainerName !== undefined,
                            messageParams
                          };
                        })
                      );
                    })
                  ).pipe(
                    map(res => {
                      const entries = res.filter(optimization => !!optimization.messageParams)
                        .sort((a, b) => {
                          if (a.messageParams[Object.keys(a.messageParams)[0]] > b.messageParams[Object.keys(b.messageParams)[0]]) {
                            return -1;
                          } else {
                            return 1;
                          }
                        });
                      return {
                        type: optimizer.getId(),
                        entries: _.chain(entries)
                          .groupBy('containerName')
                          .map((value, key) => ({ containerName: key, isRetainer: value[0].isRetainer, items: value }))
                          .value(),
                        totalLength: uniqBy(entries, 'item.itemId').length
                      };
                    })
                  );
                })
            );
          })
        )),
        tap(() => this.loading = false),
        tap(console.log)
      );
    })
  );
  public showIgnored = false;
  public display$: Observable<InventoryOptimization[]> = this.optimizations$.pipe(
    map((optimizations) => {
      return JSON.parse(JSON.stringify(optimizations)).map(opt => {
        const total: number[] = [];
        opt.entries = opt.entries.map(entry => {
          entry.ignored = this.ignoreArray.some(ignored => {
            return ignored.containerName === entry.containerName && ignored.id === opt.type;
          });
          entry.items = entry.items.map(item => {
            item.ignored = this.ignoreArray.some(ignored => {
              return ignored.itemId === item.item.itemId && ignored.id === opt.type;
            });
            return item;
          }).filter(item => {
            return this.showIgnored || !item.ignored;
          });
          if (this.showIgnored) {
            entry.totalLength = entry.items.length;
          } else {
            entry.totalLength = entry.items.filter(i => !i.ignored).length;
          }
          if (this.showIgnored || !entry.ignored) {
            total.push(...entry.items.map(i => i.item.itemId));
          }
          return entry;
        });
        opt.hidden = this.hiddenArray.some(hidden => {
          return hidden.optimizerId === opt.type;
        });
        opt.totalLength = uniq(total).length;
        return opt;
      });
    })
  );
  //for showing hidden optimizers
  public showHidden = false;
  public loading = false;

  public expansions$ = this.lazyData.getI18nEntry('exVersions');

  constructor(private inventoryFacade: InventoryService, private settings: SettingsService,
              @Inject(INVENTORY_OPTIMIZER) private optimizers: InventoryOptimizer[],
              private lazyData: LazyDataFacade, private message: NzMessageService, private translate: TranslateService) {
    this.optimizers
      .filter(optimizer => this.showHidden || !this.hiddenArray.some(o => o.optimizerId === optimizer.getId()))
      .forEach(optimizer => {
        optimizer.lazyDataEntriesNeeded().forEach(entry => this.lazyData.preloadEntry(entry));
      });
  }

  public get stackSizeThreshold(): number {
    return +(localStorage.getItem(HasTooFew.THRESHOLD_KEY) || 3);
  }

  public set stackSizeThreshold(size: number) {
    if (size > 0) {
      localStorage.setItem(HasTooFew.THRESHOLD_KEY, size.toString());
      this.loading = true;
      this.reloader$.next();
    }
  }

  public get maximumVendorPrice(): number {
    return +(localStorage.getItem(CanBeBought.MAXIMUM_PRICE_KEY) || 50000);
  }

  public set maximumVendorPrice(price: number) {
    if (price > 0) {
      localStorage.setItem(CanBeBought.MAXIMUM_PRICE_KEY, price.toString());
      this.loading = true;
      this.reloader$.next();
    }
  }

  public get selectedExpansion(): number {
    const selection = localStorage.getItem(ConsolidateStacks.SELECTION_KEY);
    return selection ? +selection : null;
  }

  public set selectedExpansion(selection: number) {
    if (selection !== null) {
      localStorage.setItem(ConsolidateStacks.SELECTION_KEY, selection.toString());
    } else {
      localStorage.removeItem(ConsolidateStacks.SELECTION_KEY);
    }

    this.loading = true;
    this.reloader$.next();
  }

  public get minRecipeIlvl(): number {
    return +(localStorage.getItem(UnwantedMaterials.RECIPE_ILVL_KEY) || 1);
  }

  public set minRecipeIlvl(size: number) {
    if (size > 0) {
      localStorage.setItem(UnwantedMaterials.RECIPE_ILVL_KEY, size.toString());
      this.loading = true;
      this.reloader$.next();
    }
  }

  public resetInventory(): void {
    this.inventoryFacade.resetInventory();
  }

  nameCopied(key: string, args?: any): void {
    this.message.success(this.translate.instant(key, args));
  }

  public setHideOptimizer(optimizer: string, hidden: boolean): void {
    if (hidden) {
      this.hiddenArray = [
        ...this.hiddenArray,
        {
          optimizerId: optimizer
        }
      ];
    } else {
      this.hiddenArray = this.hiddenArray.filter(o => o.optimizerId !== optimizer);
    }
    this.setHiddenArray(this.hiddenArray);
    this.reloader$.next();
  }

  public setIgnoreItemOptimization(itemId: number, optimization: string, ignore: boolean): void {
    if (ignore) {
      this.ignoreArray = [
        ...this.ignoreArray,
        {
          id: optimization,
          itemId: itemId
        }
      ];
    } else {
      this.ignoreArray = this.ignoreArray.filter(i => i.itemId !== itemId || i.id !== optimization);
    }
    this.setIgnoreArray(this.ignoreArray);
    this.reloader$.next();
  }

  public setIgnoreContainer(containerName: string, optimization: string, ignore: boolean): void {
    if (ignore) {
      this.ignoreArray = [
        ...this.ignoreArray,
        {
          id: optimization,
          itemId: -1,
          containerName: containerName
        }
      ];
    } else {
      this.ignoreArray = this.ignoreArray.filter(i => i.containerName !== containerName || i.id !== optimization);
    }
    this.setIgnoreArray(this.ignoreArray);
    this.reloader$.next();
  }

  public getOptimizationJSON(optimization: InventoryOptimization): string {
    return JSON.stringify(optimization);
  }

  public trackByTip(index: number, opt: InventoryOptimization): string {
    return opt.type;
  }

  public trackByEntry(index: number, entry: any): string {
    return entry.containerName;
  }

  private getContainerName(item: InventoryItem): string {
    return item.retainerName || this.inventoryFacade.getContainerName(item.containerId);
  }

  private setHiddenArray(array: { optimizerId: string }[]): void {
    localStorage.setItem('optimizations:hidden', JSON.stringify(array));
  }

  private setIgnoreArray(array: { id: string, itemId: number }[]): void {
    localStorage.setItem(`optimizations:ignored`, JSON.stringify(array));
  }

}
