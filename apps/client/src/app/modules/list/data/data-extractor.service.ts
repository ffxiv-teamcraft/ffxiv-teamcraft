import { Inject, Injectable, InjectionToken } from '@angular/core';
import { AbstractExtractor } from './extractor/abstract-extractor';
import { ItemData } from '../../../model/garland-tools/item-data';
import { DataType } from './data-type';
import { ListRow } from '../model/list-row';
import { ItemSource } from '../model/item-source';
import { combineLatest, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

export const EXTRACTORS = new InjectionToken('EXTRACTORS');

@Injectable()
export class DataExtractorService {

  constructor(@Inject(EXTRACTORS) private extractors: AbstractExtractor<any>[]) {
  }

  addDataToItem(item: ListRow, data: ItemData, skipCraft = false): Observable<ListRow> {
    return combineLatest(Object.values(DataType)
      .filter(value => +value === value)
      .map(value => {
        if (value === DataType.CRAFTED_BY && skipCraft) {
          return of(null);
        }
        return this.extract(value as DataType, item.id, data, item);
      })
    ).pipe(
      map(sources => {
        item.sources = sources.filter(s => s !== null);
        return item;
      })
    );
  }

  /**
   * Extracts data using the proper extractor.
   * @param {DataType} type
   * @param {number} id
   * @param {ItemData} data
   * @param row
   */
  private extract(type: DataType, id: number, data: ItemData, row?: ListRow): Observable<ItemSource | null> {
    const extractor = this.extractors.find(ex => ex.getDataType() === type);
    if (extractor === undefined) {
      return of(null);
    }
    let source$: Observable<any>;
    if (!extractor.isAsync()) {
      source$ = of(extractor.extract(id, data, row));
    } else {
      source$ = extractor.extract(id, data, row);
    }
    return source$.pipe(
      map((extract: any) => {
        if (!extract || extract.length === 0) {
          return null;
        }
        return {
          type: type,
          data: extract
        };
      })
    );
  }
}
