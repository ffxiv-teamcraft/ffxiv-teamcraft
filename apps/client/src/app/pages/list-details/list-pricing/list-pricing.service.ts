import { Injectable } from '@angular/core';
import Dexie, { liveQuery } from 'dexie';
import { combineLatest, from, Observable } from 'rxjs';
import { Price } from './model/price';
import { ItemAmount } from './model/item-amount';
import { List } from '../../../modules/list/model/list';
import { LazyDataFacade } from '../../../lazy-data/+state/lazy-data.facade';
import { first, map } from 'rxjs/operators';
import { FullPricingRow, ListArray } from './model/full-pricing-row';
import { getItemSource, ListRow } from '../../../modules/list/model/list-row';
import { DataType } from '../../../modules/list/data/data-type';
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

  public initList(list: List): void {
    this.lazyData.getEntry('hqFlags').pipe(
      first()
    ).subscribe(hqFlags => {
      this.db.table('items')
        .bulkAdd([
            ...list.items.map(item => {
              return {
                key: `${list.$key}:items:${item.id}`,
                use: true,
                custom: true,
                array: 'items',
                listId: list.$key,
                itemId: item.id,
                ...this.getItemPrice(item),
                amountNQ: item.amount,
                amountHQ: 0
              };
            }),
            ...list.finalItems.map(item => {
              return {
                key: `${list.$key}:finalItems:${item.id}`,
                use: true,
                custom: true,
                array: 'finalItems',
                listId: list.$key,
                itemId: item.id,
                nq: 0,
                nqServer: null,
                hq: 0,
                hqServer: null,
                fromVendor: false,
                fromMB: false,
                amountNQ: hqFlags[item.id] ? 0 : item.amount,
                amountHQ: hqFlags[item.id] ? item.amount : 0
              };
            })
          ]
        );
    });
  }

  public initItem(listId: string, array: ListArray, item: ListRow): void {
    combineLatest([
      this.lazyData.getEntry('hqFlags'),
      this.getItemPrice(item)
    ]).pipe(
      first()
    ).subscribe(([hqFlags, itemPrice]) => {
      if (array === 'finalItems') {
        this.db.table('items')
          .add(
            {
              key: `${listId}:${array}:${item.id}`,
              use: true,
              custom: true,
              array: array,
              listId: listId,
              itemId: item.id,
              nq: 0,
              nqServer: null,
              hq: 0,
              hqServer: null,
              fromVendor: false,
              fromMB: false,
              amountNQ: hqFlags[item.id] ? 0 : item.amount,
              amountHQ: hqFlags[item.id] ? item.amount : 0
            }
          );
      } else {
        this.db.table('items')
          .add(
            {
              key: `${listId}:items:${item.id}`,
              use: true,
              custom: true,
              array: array,
              listId: listId,
              itemId: item.id,
              ...itemPrice,
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

  private getItemPrice(item: ListRow): Observable<Price> {
    return from(this.db.table('items')
      .where('itemId')
      .equals(item.id)
      .toArray()).pipe(
      map((entries: DBEntry[]) => {
        const existingEntry = entries[0];
        if (existingEntry) {
          return {
            nq: existingEntry.nq,
            nqServer: existingEntry.nqServer,
            hq: existingEntry.hq,
            hqServer: existingEntry.hqServer,
            fromMB: existingEntry.fromMB,
            fromVendor: existingEntry.fromVendor
          };
        }
        const fromVendor = this.getVendorPrice(item);
        if (fromVendor > 0) {
          return {
            nq: fromVendor,
            hq: 0,
            fromVendor: true,
            fromMB: false
          };
        }
        return {
          nq: 0,
          hq: 0,
          fromVendor: false,
          fromMB: false
        };
      })
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
