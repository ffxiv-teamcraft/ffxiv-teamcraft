import { ItemData } from '../../../../model/garland-tools/item-data';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Item } from '../../../../model/garland-tools/item';
import { DataType } from '../data-type';
import { ListRow } from '../../model/list-row';
import { GarlandToolsService } from '../../../../core/api/garland-tools.service';

@Injectable()
export abstract class AbstractExtractor<T> {

  protected constructor(protected gt: GarlandToolsService) {
  }

  /**
   * Extracts data from the given itemData.
   * @param id The id of the item that needs data extraction.
   * @param {ItemData} _itemData The data used for the extraction.
   * @param row Current row used for extraction
   * @returns {T}
   */
  public extract(id: number, _itemData: ItemData, row?: ListRow): T | Observable<T> {
    let item = this.getItem(id, _itemData);
    let itemData = _itemData;
    if (this.isCrystal(id)) {
      itemData = this.gt.getCrystalDetails(id);
      item = itemData.item;
    }
    if (item === undefined || !this.canExtract(item)) {
      return this.fallback();
    }
    return this.doExtract(item, itemData, row);
  }

  public getRequirements(): DataType[] {
    return [];
  }

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
   * Determines if the current extractor has something to get from the given item.
   * @param {Item} item
   * @returns {boolean}
   */
  protected canExtract(item: Item): boolean {
    return true;
  }

  /**
   * Implementation for each extractor.
   * @param item
   * @param {ItemData} itemData
   * @param row
   * @returns {Observable<T> | T}
   */
  protected abstract doExtract(item: Item, itemData: ItemData, row?: ListRow): T | Observable<T>;

  /**
   * Gets the item in the ingredients array or in the data itself.
   * @param {number} id
   * @param {ItemData} data
   * @returns {Item}
   */
  protected getItem(id: number, data: ItemData): Item {
    return data.item.id === id ? data.item : data.getIngredient(id);
  }

  /**
   * Checks if a given item id is a crystal.
   * @param id
   */
  protected isCrystal(id: number): boolean {
    return id > 1 && id < 20;
  }

  protected extractsArray(): boolean {
    return true;
  }

  /**
   * Provides a fallback value for the case when the extractor can't extract.
   * @returns {any}
   */
  private fallback(): any {
    let fallback;
    if (this.extractsArray()) {
      fallback = [];
    }
    return this.isAsync() ? of(fallback) : fallback;
  }
}
