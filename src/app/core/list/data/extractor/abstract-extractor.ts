import {ItemData} from '../../../../model/garland-tools/item-data';
import {Injectable} from '@angular/core';
import {DataType} from 'app/core/list/data/data-type';
import {Observable, of} from 'rxjs';
import {Item} from '../../../../model/garland-tools/item';

@Injectable()
export abstract class AbstractExtractor<T> {

    /**
     * Extracts data from the given itemData.
     * @param id The id of the item that needs data extraction.
     * @param {ItemData} itemData The data used for the extraction.
     * @returns {T}
     */
    public extract(id: number, itemData: ItemData): T | Observable<T> {
        const item = this.getItem(id, itemData);
        if (item === undefined || !this.canExtract(item)) {
            return this.fallback();
        }
        return this.doExtract(item, itemData);
    }

    /**
     * Provides a fallback value for the case when the extractor can't extract.
     * @returns {any}
     */
    private fallback(): any {
        let fallback = undefined;
        if (this.extractsArray()) {
            fallback = [];
        }
        return this.isAsync() ? of(fallback) : fallback;
    }

    /**
     * Determines if the current extractor has something to get from the given item.
     * @param {Item} item
     * @returns {boolean}
     */
    protected abstract canExtract(item: Item): boolean;

    /**
     * Implementation for each extractor.
     * @param item
     * @param {ItemData} itemData
     * @returns {Observable<T> | T}
     */
    protected abstract doExtract(item: Item, itemData: ItemData): T | Observable<T>;

    /**
     * Used to determine to operator that has to be used to add this data to the chain.
     * @returns {boolean}
     */
    public abstract isAsync(): boolean;

    /**
     * Used to determine which data extracts a given data row.
     * @returns {DataType}
     */
    public abstract getDataType(): DataType;

    /**
     * Gets the item in the ingredients array or in the data itself.
     * @param {number} id
     * @param {ItemData} data
     * @returns {Item}
     */
    protected getItem(id: number, data: ItemData): Item {
        return data.item.id === id ? data.item : data.getIngredient(id);
    }

    protected extractsArray(): boolean {
        return true;
    }
}
