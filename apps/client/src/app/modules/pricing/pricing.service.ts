import { Injectable } from '@angular/core';
import { getItemSource, ListRow } from '../list/model/list-row';
import { Price } from './model/price';
import { ItemAmount } from './model/item-amount';
import { Subject } from 'rxjs';
import { DataType } from '../list/data/data-type';

@Injectable()
export class PricingService {

  public priceChanged$ = new Subject<void>();

  /**
   * Object representation of current stored prices
   */
  private readonly prices: { [index: number]: Price };

  /**
   * Object representation of current stored amounts
   */
  private readonly amounts: { [index: string]: { [index: number]: ItemAmount } };

  /**
   * Array of custom prices
   */
  private readonly customPrices: number[];

  constructor() {
    this.prices = this.parsePrices(localStorage.getItem('prices'));
    this.amounts = JSON.parse(localStorage.getItem('amounts')) || {};
    this.customPrices = JSON.parse(localStorage.getItem('customPrices')) || [];
  }

  /**
   * Saves a given price to the storage system
   * @param {ListRow} item
   * @param {Price} price
   */
  savePrice(item: ListRow, price: Price): void {
    this.prices[item.id] = price;
    this.persistPrices();
  }

  /**
   * Saves an item as having a custom price
   * @param {ListRow} item
   * @param {boolean} customPrice
   */
  saveCustomPrice(item: ListRow, customPrice: boolean): void {
    const index = this.customPrices.indexOf(item.id);

    if (customPrice && index === -1) {
      this.customPrices.push(item.id);
    } else if (!customPrice && index !== -1) {
      this.customPrices.splice(index, 1);
    }

    this.persistCustomPrice();
  }

  /**
   * Saves a given amount to the storage system
   * @param listUid
   * @param {ListRow} item
   * @param {Price} amount
   */
  saveAmount(listUid: string, item: ListRow, amount: ItemAmount): void {
    if (this.amounts[listUid] === undefined) {
      this.amounts[listUid] = {};
    }
    this.amounts[listUid][item.id] = amount;
    this.persistAmounts();
  }

  /**
   * Gets the gil value of an item, looking on local storage first, then looks for vendors informations.
   *
   * If nothing is found, returns 0.
   * @param {ListRow} item
   * @returns {number}
   */
  getPrice(item: ListRow): Price {
    const storedValue = this.prices[item.id];
    if (storedValue !== undefined) {
      storedValue.fromVendor = false;
      return storedValue;
    }
    if (getItemSource(item, DataType.VENDORS).length > 0) {
      const cheapest = getItemSource(item, DataType.VENDORS).sort((a, b) => {
        return a.price - b.price;
      })[0];
      return { nq: cheapest.price, hq: 0, fromVendor: true, fromMB: false };
    }
    return { nq: 0, hq: 0, fromVendor: false, fromMB: false };
  }

  /**
   * Gets the gil value of an item using only vendors.
   *
   * If nothing is found, returns 0.
   * @param {ListRow} item
   * @returns {number}
   */
  getVendorPrice(item: ListRow): Price {
    if (getItemSource(item, DataType.VENDORS).length > 0) {
      const cheapest = getItemSource(item, DataType.VENDORS).sort((a, b) => {
        return a.price - b.price;
      })[0];
      return { nq: cheapest.price, hq: 0, fromVendor: true, fromMB: false };
    }
    return { nq: 0, hq: 0, fromVendor: false, fromMB: false };
  }

  /**
   * Gets the earning price of an item, doesn't need crafting computing so it's easier to implement and faster to execute.
   * @param {ListRow} item
   * @returns {Price}
   */
  getEarnings(item: ListRow): Price {
    return this.prices[item.id] || { nq: 0, hq: 0, fromVendor: false, fromMB: false };
  }

  /**
   * Gets the amount of nq and hq items used for a given list, if nothing is found in localStorage, returns a default object
   * with item.amount as nq amount and 0 as hq amount.
   *
   * @param listUid
   * @param {ListRow} item
   * @param hq so we want default value in nq or hq?
   * @returns {ItemAmount}
   */
  getAmount(listUid: string, item: ListRow, hq = false): ItemAmount {
    const listStore = this.amounts[listUid];
    if (listStore !== undefined) {
      const storedValue = listStore[item.id];
      if (storedValue !== undefined) {
        return storedValue;
      }
    }
    if (hq) {
      return { nq: 0, hq: item.amount };
    }
    return { nq: item.amount, hq: 0 };
  }

  /**
   * Gets whether or not the item has a custom price set
   * @param {ListRow} item
   * @returns {boolean}
   */
  isCustomPrice(item: ListRow): boolean {
    return this.customPrices.indexOf(item.id) !== -1;
  }

  /**
   * Parses a given string coming from localStorage to create an object from it.
   *
   * This is in a specific method so it'll be easier to change data storage later on,
   * as localStorage has a limit of 10Mb we want to optimize that.
   *
   * @param {string} data
   */
  private parsePrices(data: string): { [index: number]: Price } {
    const result: { [index: number]: Price } = {};
    if (data === null) {
      return result;
    }
    data.split(';').forEach(row => {
      // The last row of the parse will be '', we don't want to parse this one as it doesn't have any data.
      if (row === '') {
        return;
      }
      const rowId = +row.split(':')[0];
      const rowData = row.split(':')[1].split(',');
      const price: Price = {
        nq: +rowData[0],
        hq: +rowData[1],
        fromVendor: +rowData[2] === 1,
        fromMB: rowData[3] !== undefined
      };
      if (price.fromMB) {
        price.nqServer = rowData[3];
        price.hqServer = rowData[4];
        price.updated = +(rowData[5] || 0);
      }
      result[rowId] = price;
    });
    return result;
  }

  /**
   * Stringifies a given object in order to store it in localStorage.
   *
   * @param {string} data
   */
  private stringifyPrices(data: { [index: number]: Price }) {
    let resultString = '';
    for (const index in data) {
      if (data.hasOwnProperty(index)) {
        const entry = data[index];
        resultString += `${index.toString()}:${entry.nq},${entry.hq},${entry.fromVendor ? 1 : 0}${entry.fromMB ? `,${entry.nqServer},${entry.hqServer},${entry.updated}` : ''};`;
      }
    }
    return resultString;
  }

  /**
   * Persists the current prices to localStorage.
   */
  private persistPrices(): void {
    localStorage.setItem('prices', this.stringifyPrices(this.prices));
  }

  /**
   * Persists the custom prices to localStorage.
   */
  private persistCustomPrice(): void {
    localStorage.setItem('customPrices', JSON.stringify(this.customPrices));
  }

  /**
   * Perists amounts into localStorage.
   */
  private persistAmounts(): void {
    localStorage.setItem('amounts', JSON.stringify(this.amounts));
  }
}
