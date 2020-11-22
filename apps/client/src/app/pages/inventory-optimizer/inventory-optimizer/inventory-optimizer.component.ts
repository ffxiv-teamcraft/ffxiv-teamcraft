import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { InventoryFacade } from '../../../modules/inventory/+state/inventory.facade';
import { INVENTORY_OPTIMIZER, InventoryOptimizer } from '../optimizations/inventory-optimizer';
import { LazyDataService } from '../../../core/data/lazy-data.service';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { delay, map, startWith, switchMap, switchMapTo, tap } from 'rxjs/operators';
import { InventoryOptimization } from '../inventory-optimization';
import { InventoryItem } from '../../../model/user/inventory/inventory-item';
import * as _ from 'lodash';
import { uniq, uniqBy } from 'lodash';
import { ContainerType } from '../../../model/user/inventory/container-type';
import { NzMessageService } from 'ng-zorro-antd/message';
import { TranslateService } from '@ngx-translate/core';
import { HasTooFew } from '../optimizations/has-too-few';
import { ListRow } from '../../../modules/list/model/list-row';
import { ConsolidateStacks } from '../optimizations/consolidate-stacks';
import { UnwantedMaterials } from '../optimizations/unwanted-materials';
import { SettingsService } from '../../../modules/settings/settings.service';
import { LocalizedDataService } from '../../../core/data/localized-data.service';
import { CanBeBought } from '../optimizations/can-be-bought';

@Component({
  selector: 'app-inventory-optimizer',
  templateUrl: './inventory-optimizer.component.html',
  styleUrls: ['./inventory-optimizer.component.less']
})
export class InventoryOptimizerComponent {

  public resultsReloader$: BehaviorSubject<void> = new BehaviorSubject<void>(null);

  public reloader$: BehaviorSubject<void> = new BehaviorSubject<void>(null);

  public optimizations$: Observable<InventoryOptimization[]> = this.lazyData.extracts$.pipe(
    switchMap((extracts: ListRow[]) => {
      return combineLatest([this.settings.settingsChange$.pipe(startWith(0)), this.resultsReloader$]).pipe(
        switchMapTo(this.inventoryFacade.inventory$.pipe(
          map(inventory => {
            return this.optimizers
              .filter(optimizer => !this.hiddenArray.some(o => o.optimizerId === optimizer.getId()))
              .map(optimizer => {
                const entries = inventory.toArray()
                  .filter(item => {
                    return this.settings.ignoredInventories.indexOf(this.inventoryFacade.getContainerDisplayName(item)) === -1
                      && [
                        ContainerType.RetainerMarket,
                        ContainerType.RetainerEquippedGear
                      ].indexOf(item.containerId) === -1;
                  })
                  .map(item => {
                    return {
                      item: item,
                      containerName: this.getContainerName(item),
                      isRetainer: item.retainerName !== undefined,
                      messageParams: optimizer.getOptimization(item, inventory, extracts)
                    };
                  })
                  .filter(optimization => optimization.messageParams !== null);
                return {
                  type: optimizer.getId(),
                  entries: _.chain(entries)
                    .groupBy('containerName')
                    .map((value, key) => ({ containerName: key, isRetainer: value[0].isRetainer, items: value }))
                    .value(),
                  totalLength: uniqBy(entries, 'item.itemId').length
                };
              });
          })
        )),
        tap(() => this.loading = false)
      );
    })
  );


  public display$: Observable<InventoryOptimization[]> = this.optimizations$.pipe(
    switchMap(optimizations => {
      return this.reloader$.pipe(
        delay(20),
        map(() => {
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
    })
  );

  public ignoreArray: { id: string, itemId: number, containerName?: string }[] = JSON.parse(localStorage.getItem(`optimizations:ignored`) || '[]');

  //hiddenArray tracks hidden optimizers
  public hiddenArray: { optimizerId: string }[] = JSON.parse(localStorage.getItem('optimizations:hidden') || '[]');

  public showIgnored = false;

  //for showing hidden optimizers
  public showHidden = false;

  public loading = false;

  public get stackSizeThreshold(): number {
    return +(localStorage.getItem(HasTooFew.THRESHOLD_KEY) || 3);
  }

  public set stackSizeThreshold(size: number) {
    if (size > 0) {
      localStorage.setItem(HasTooFew.THRESHOLD_KEY, size.toString());
      this.loading = true;
      this.resultsReloader$.next(null);
    }
  }

  public get maximumVendorPrice(): number {
    return +(localStorage.getItem(CanBeBought.MAXIMUM_PRICE_KEY) || 50000);
  }

  public set maximumVendorPrice(price: number) {
    if (price > 0) {
      localStorage.setItem(CanBeBought.MAXIMUM_PRICE_KEY, price.toString());
      this.loading = true;
      this.resultsReloader$.next(null);
    }
  }

  constructor(private inventoryFacade: InventoryFacade, private settings: SettingsService, private l12n: LocalizedDataService,
              @Inject(INVENTORY_OPTIMIZER) private optimizers: InventoryOptimizer[],
              private lazyData: LazyDataService, private message: NzMessageService, private translate: TranslateService) {
  }

  private getContainerName(item: InventoryItem): string {
    return item.retainerName || this.inventoryFacade.getContainerName(item.containerId);
  }

  public getExpansions() {
    return this.l12n.getExpansions();
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
    this.resultsReloader$.next(null);
  }

  public get minRecipeIlvl(): number {
    return +(localStorage.getItem(UnwantedMaterials.RECIPE_ILVL_KEY) || 1);
  }

  public set minRecipeIlvl(size: number) {
    if (size > 0) {
      localStorage.setItem(UnwantedMaterials.RECIPE_ILVL_KEY, size.toString());
      this.loading = true;
      this.resultsReloader$.next(null);
    }
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

  private setHiddenArray(array: { optimizerId: string }[]): void {
    localStorage.setItem('optimizations:hidden', JSON.stringify(array));
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

  private setIgnoreArray(array: { id: string, itemId: number }[]): void {
    localStorage.setItem(`optimizations:ignored`, JSON.stringify(array));
  }

  public trackByTip(index: number, opt: InventoryOptimization): string {
    return opt.type;
  }

  public trackByEntry(index: number, entry: any): string {
    return entry.containerName;
  }

}
