import { Component, Inject } from '@angular/core';
import { InventoryFacade } from '../../../modules/inventory/+state/inventory.facade';
import { INVENTORY_OPTIMIZER, InventoryOptimizer } from '../optimizations/inventory-optimizer';
import { LazyDataService } from '../../../core/data/lazy-data.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { InventoryOptimization } from '../inventory-optimization';
import { InventoryItem } from '../../../model/user/inventory/inventory-item';
import * as _ from 'lodash';

@Component({
  selector: 'app-inventory-optimizer',
  templateUrl: './inventory-optimizer.component.html',
  styleUrls: ['./inventory-optimizer.component.less']
})
export class InventoryOptimizerComponent {

  public reloader$: BehaviorSubject<void> = new BehaviorSubject<void>(null);

  public optimizations$: Observable<InventoryOptimization[]> = this.inventoryFacade.inventory$.pipe(
    map(inventory => {
      return this.optimizers
        .map(optimizer => {
          const entries = inventory.toArray()
            .map(item => {
              return {
                item: item,
                containerName: this.getContainerName(item),
                isRetainer: item.retainerName !== undefined,
                messageParams: optimizer.getOptimization(item, inventory, this.lazyData)
              };
            })
            .filter(optimization => optimization.messageParams !== null);
          return {
            type: optimizer.getId(),
            entries: _.chain(entries)
              .groupBy('containerName')
              .map((value, key) => ({ containerName: key, isRetainer: value[0].isRetainer, items: value }))
              .value(),
            totalLength: entries.length
          };
        })
        .filter(res => res.entries.length > 0);
    })
  );

  public display$: Observable<InventoryOptimization[]> = this.optimizations$.pipe(
    switchMap(optimizations => {
      return this.reloader$.pipe(
        map(() => {
          return optimizations.map(opt => {
            let totalLength = 0;
            opt.entries = opt.entries.map(entry => {
              entry.items = entry.items.map(item => {
                item.ignored = this.ignoreArray.some(ignored => {
                  return ignored.itemId === item.item.itemId && ignored.id === opt.type;
                });
                return item;
              });
              if (this.showIgnored) {
                entry.totalLength = entry.items.length;
              } else {
                entry.totalLength = entry.items.filter(i => !i.ignored).length;
              }
              totalLength += entry.totalLength;
              return entry;
            });
            opt.totalLength = totalLength;
            return opt;
          }).filter(opt => opt.totalLength > 0);
        })
      );
    })
  );

  public ignoreArray: { id: string, itemId: number }[] = JSON.parse(localStorage.getItem(`optimizations:ignored`) || '[]');

  public showIgnored = false;

  constructor(private inventoryFacade: InventoryFacade,
              @Inject(INVENTORY_OPTIMIZER) private optimizers: InventoryOptimizer[],
              private lazyData: LazyDataService) {
  }

  private getContainerName(item: InventoryItem): string {
    return item.retainerName || this.inventoryFacade.getContainerName(item.containerId);
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
      this.ignoreArray = this.ignoreArray.filter(i => i.itemId !== itemId && i.id !== optimization);
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
