import {Injectable} from '@angular/core';
import {ListRow} from '../model/list/list-row';
import {Price} from './model/price';

@Injectable()
export class PricingService {

    private data: { [index: number]: Price };

    constructor() {
        this.data = JSON.parse(localStorage.getItem('prices')) || {};
    }

    /**
     * Saves a given price to the storage system
     * @param {ListRow} item
     * @param {Price} price
     */
    save(item: ListRow, price: Price): void {
        this.data[item.id] = price;
        this.persist();
    }

    /**
     * Gets the gils value of an item, looking on local storage first, then looks for vendors informations.
     *
     * If nothing is found, returns 0.
     * @param {ListRow} item
     * @returns {number}
     */
    get(item: ListRow): Price {
        const storedValue = this.data[item.id];
        if (storedValue !== undefined) {
            return storedValue;
        }
        if (item.vendors !== undefined && item.vendors.length > 0) {
            const cheapest = item.vendors.sort((a, b) => {
                return a.price - b.price;
            })[0];
            return {nq: cheapest.price, hq: 0};
        }
        return {nq: 0, hq: 0};
    }

    /**
     * Persists the current data store to localStorage.
     */
    private persist(): void {
        localStorage.setItem('prices', JSON.stringify(this.data));
    }
}
