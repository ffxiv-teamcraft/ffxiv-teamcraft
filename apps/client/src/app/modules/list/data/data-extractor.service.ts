import { Inject, Injectable, InjectionToken } from '@angular/core';
import { AbstractExtractor } from './extractor/abstract-extractor';
import { ItemData } from '../../../model/garland-tools/item-data';
import { DataType } from './data-type';
import { ListRow } from '../model/list-row';
import { ItemSource } from '../model/item-source';
import { from, Observable, of } from 'rxjs';
import { last, map, mergeScan } from 'rxjs/operators';

export const EXTRACTORS = new InjectionToken('EXTRACTORS');

@Injectable()
export class DataExtractorService {

  constructor(@Inject(EXTRACTORS) private extractors: AbstractExtractor<any>[]) {
  }

  addDataToItem(item: ListRow, data: ItemData, skipCraft = false): Observable<ListRow> {
    return from(this.extractors
      .sort((a, b) => {
        if (a.getRequirements().includes(b.getDataType())) {
          return 1;
        } else if (b.getRequirements().includes(a.getDataType())) {
          return -1;
        }
        return 0;
      })
    ).pipe(
      mergeScan((acc, extractor) => {
        if (extractor.getDataType() === DataType.CRAFTED_BY && skipCraft) {
          return of(acc);
        }
        return this.extract(extractor.getDataType(), item.id, data, acc).pipe(
          map(source => {
            if (!acc.sources) {
              acc.sources = [];
            }
            if (source) {
              acc.sources = [...(acc.sources || []), source];
            }
            return acc;
          })
        );
      }, item),
      last()
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
