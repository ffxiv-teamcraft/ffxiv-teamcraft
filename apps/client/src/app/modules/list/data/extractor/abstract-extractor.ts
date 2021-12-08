import { ItemData } from '../../../../model/garland-tools/item-data';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Item } from '../../../../model/garland-tools/item';
import { DataType } from '../data-type';
import { ListRow } from '../../model/list-row';
import { GarlandToolsService } from '../../../../core/api/garland-tools.service';

@Injectable()
export abstract class AbstractExtractor<T> {

  /**
   * Extracts data from the given itemData.
   * @param id The id of the item that needs data extraction.
   * @param row Current row used for extraction
   * @returns {T}
   */
  public extract(id: number, row?: ListRow): T | Observable<T> {
    return this.doExtract(id, row);
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
   * Implementation for each extractor.
   * @param item
   * @param {ItemData} itemData
   * @param row
   * @returns {Observable<T> | T}
   */
  protected abstract doExtract(itemId: number, row?: ListRow): T | Observable<T>;


  protected extractsArray(): boolean {
    return true;
  }
}
