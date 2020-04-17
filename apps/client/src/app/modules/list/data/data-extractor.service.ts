import { Inject, Injectable, InjectionToken } from '@angular/core';
import { AbstractExtractor } from './extractor/abstract-extractor';
import { ItemData } from '../../../model/garland-tools/item-data';
import { DataType } from './data-type';
import { ListRow } from '../model/list-row';
import { ItemSource } from '../model/item-source';

export const EXTRACTORS = new InjectionToken('EXTRACTORS');

@Injectable()
export class DataExtractorService {

  constructor(@Inject(EXTRACTORS) private extractors: AbstractExtractor<any>[]) {
  }

  addDataToItem(item: ListRow, data: ItemData, skipCraft = false): ListRow {
    item.sources = [];
    Object.values(DataType)
      .filter(value => +value === value)
      .forEach(value => {
        if (value === DataType.CRAFTED_BY && skipCraft) {
          return;
        }
        const extract = this.extract(value as DataType, item.id, data, item);
        if (extract) {
          item.sources.push(extract);
        }
      });
    return item;
  }

  /**
   * Extracts data using the proper extractor.
   * @param {DataType} type
   * @param {number} id
   * @param {ItemData} data
   * @param row
   */
  public extract(type: DataType, id: number, data: ItemData, row?: ListRow): ItemSource | null {
    const extractor = this.extractors.find(ex => ex.getDataType() === type);
    if (extractor === undefined) {
      return null;
    }
    const extract = extractor.extract(id, data, row);
    if (!extract || extract.length === 0) {
      return null;
    }
    return {
      type: type,
      data: extract
    };
  }
}
