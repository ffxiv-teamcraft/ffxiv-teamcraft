import { Inject, Injectable, InjectionToken } from '@angular/core';
import { AbstractExtractor } from './extractor/abstract-extractor';
import { DataType } from './data-type';
import { ListRow } from '../model/list-row';
import { ItemSource } from '../model/item-source';
import { from, isObservable, Observable, of, Subject } from 'rxjs';
import { last, map, mergeScan } from 'rxjs/operators';

export const EXTRACTORS = new InjectionToken('EXTRACTORS');

@Injectable()
export class DataExtractorService {

  constructor(@Inject(EXTRACTORS) private extractors: AbstractExtractor<any>[]) {
  }

  addDataToItem(item: ListRow, skipCraft = false): Observable<ListRow> {
    const result$ = new Subject<ListRow>();
    setTimeout(() => {
      from(this.extractors
        .sort((a, b) => {
          if (a.getDataType() === DataType.DEPRECATED) {
            return -1;
          }
          if (a.getRequirements().includes(b.getDataType())) {
            return 1;
          } else if (b.getRequirements().includes(a.getDataType())) {
            return -1;
          }
          return 0;
        })
      ).pipe(
        mergeScan((acc, extractor) => {
          if ((acc.sources || []).some(s => s.type === DataType.DEPRECATED)) {
            return of(acc);
          }
          if (extractor.getDataType() === DataType.CRAFTED_BY && skipCraft) {
            return of(acc);
          }
          return this.extract(extractor.getDataType(), item.id, acc).pipe(
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
      ).subscribe((res) => {
        result$.next(res);
        result$.complete();
      });
    }, 1);
    return result$;
  }

  /**
   * Extracts data using the proper extractor.
   * @param {DataType} type
   * @param {number} id
   * @param row
   */
  private extract(type: DataType, id: number, row?: ListRow): Observable<ItemSource | null> {
    const extractor = this.extractors.find(ex => ex.getDataType() === type);
    if (extractor === undefined) {
      return of(null);
    }
    let source$: Observable<any>;
    const extract$ = extractor.extract(id, row);
    if (isObservable(extract$)) {
      source$ = extract$;
    } else {
      source$ = of(extract$);
    }
    return source$.pipe(
      map((extract: any) => {
        if (!extract || extract.length === 0) {
          return null;
        }
        return {
          type: type,
          data: extract
        } as any;
      })
    );
  }
}
