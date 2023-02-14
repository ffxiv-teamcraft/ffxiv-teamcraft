import { Injectable } from '@angular/core';
import Dexie, { liveQuery } from 'dexie';
import { combineLatest, from, Observable } from 'rxjs';
import { Price } from './model/price';
import { ItemAmount } from './model/item-amount';
import { LazyDataFacade } from '../../../lazy-data/+state/lazy-data.facade';
import { first, map } from 'rxjs/operators';
import { FullPricingRow, ListArray } from './model/full-pricing-row';
import { ListRow } from '../../../modules/list/model/list-row';
import { DataType, getItemSource } from '@ffxiv-teamcraft/types';
import { SettingsService } from '../../../modules/settings/settings.service';

interface DBEntry {
  key: string;
  listId: string;
  use: boolean;
  custom: boolean;
  array: ListArray;
  itemId: number;
  nq: number;
  nqServer?: string;
  hq: number;
  hqServer?: string;
  fromVendor: boolean;
  fromMB: boolean;
  updated?: number;
  amountNQ: number;
  amountHQ: number;
}

@Injectable({
  providedIn: 'root'
})
export class ListPricingService {

  private db: Dexie;

  constructor(private lazyData: LazyDataFacade, private settings: SettingsService) {
    this.db = new Dexie('ListPricing');
    this.db.version(2).stores({
      items: 'key, listId, use, custom, itemId, nq, nqServer, hq, hqServer, fromVendor, fromMB, updated, amountNQ, amountHQ'
    });
  }

  public getPricingForList(listId: string): Observable<FullPricingRow[]> {
    return new Observable<FullPricingRow[]>(subscriber => {
      liveQuery(() => {
        return this.db.table<DBEntry>('items')
          .where('listId').equals(listId)
          .toArray();
      }).subscribe((res: DBEntry[]) => {
        subscriber.next(res.map(row => {
          return {
            id: row.itemId,
            array: row.array,
            use: row.use,
            custom: row.custom,
            price: {
              nq: row.nq,
              nqServer: row.nqServer,
              hq: row.hq,
              hqServer: row.hqServer,
              fromVendor: row.fromVendor,
              fromMB: row.fromMB,
              updated: row.updated
            },
            amount: {
              nq: row.amountNQ,
              hq: row.amountHQ
            }
          };
        }));
      });
    });
  }

  public initItem(listId: string, array: ListArray, item: ListRow): void {
    combineLatest([
      this.lazyData.getEntry('hqFlags'),
      this.getItemEntry(item.id)
    ]).pipe(
      first()
    ).subscribe(([hqFlags, itemEntry]) => {
      const vendorPrice = this.getVendorPrice(item);
      const baseModel: Partial<DBEntry> = {
        ...(itemEntry || {
          use: true,
          custom: true,
          itemId: item.id,
          nq: Math.max(vendorPrice, 0),
          hq: 0,
          fromMB: false,
          fromVendor: vendorPrice > 0
        }),
        key: `${listId}:${array}:${item.id}`,
        array: array,
        listId: listId
      };
      if (array === 'finalItems') {
        this.db.table('items')
          .add(
            {
              ...baseModel,
              amountNQ: hqFlags[item.id] ? 0 : item.amount,
              amountHQ: hqFlags[item.id] ? item.amount : 0
            }
          );
      } else {
        this.db.table('items')
          .add(
            {
              ...baseModel,
              amountNQ: item.amount,
              amountHQ: 0
            }
          );

      }
    });
  }

  public saveItem(listId: string, array: ListArray, itemId: number, price: Price, amount: ItemAmount, use: boolean, automated = false): void {
    this.db.table('items')
      .update(`${listId}:${array}:${itemId}`, this.generateDbModel(listId, itemId, array, price, amount, use, automated));
  }

  public removeEntriesForList(listId: string): void {
    this.db.table('items')
      .where('listId').equals(listId).delete();
  }

  private generateDbModel(listKey: string, itemId: number, array: ListArray, price: Price, amount: ItemAmount, use: boolean, automated = false): DBEntry {
    return {
      key: `${listKey}:${array}:${itemId}`,
      array: array,
      use: use,
      custom: !automated,
      listId: listKey,
      itemId: itemId,
      nq: price.nq,
      nqServer: price.nqServer,
      hq: price.hq,
      hqServer: price.hqServer,
      fromVendor: price.fromVendor,
      fromMB: price.fromMB,
      updated: Date.now(),
      amountNQ: amount.nq,
      amountHQ: amount.hq
    };
  }

  private getItemEntry(itemId: number): Observable<DBEntry | undefined> {
    return from(this.db.table('items')
      .where('itemId')
      .equals(itemId)
      .toArray()).pipe(
      map(items => items[0])
    );
  }

  public getVendorPrice(item: ListRow): number {
    const vendors = getItemSource(item, DataType.VENDORS);
    if (vendors.length > 0) {
      const cheapest = vendors.sort((a, b) => a.price - b.price)[0];
      return cheapest.price;
    }
    return -1;
  }

  public getCraftingPrice(item: ListRow, prices: FullPricingRow[]): Price {
    const craft = getItemSource(item, DataType.CRAFTED_BY)[0];
    if (!craft) {
      return {
        nq: 0,
        hq: 0,
        fromVendor: false,
        fromMB: false
      };
    }
    const price = item.requires.reduce((acc, ingredient) => {
      const iPrice = prices.find(p => p.array === 'items' && p.id === ingredient.id);
      if (!iPrice) {
        return acc;
      }
      const avgPrice = (iPrice.price.nq * iPrice.amount.nq + iPrice.price.hq * iPrice.amount.hq) / (iPrice.amount.nq + iPrice.amount.hq);
      if (this.settings.expectToSellEverything) {
        // If you expect to sell everything, just divide by yield.
        return acc + (iPrice.use ? 1 : 0) * (avgPrice / item.yield) * ingredient.amount;
      } else {
        // else, divide by amount / amount_needed, aka adjusted yield for when you craft more than you sell because of yield.
        return acc + (iPrice.use ? 1 : 0) * (avgPrice / (item.amount / item.amount_needed)) * ingredient.amount;
      }
    }, 0);
    return {
      nq: price,
      hq: price,
      fromVendor: false,
      fromMB: false
    };
  }

}
