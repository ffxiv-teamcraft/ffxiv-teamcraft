import { Observable } from 'rxjs';
import { DataType } from '../data-type';
import { AbstractExtractor } from './abstract-extractor';
import { LazyDataFacade } from '../../../../lazy-data/+state/lazy-data.facade';
import { map } from 'rxjs/operators';

export class DeprecatedExtractor extends AbstractExtractor<boolean> {


  constructor(private lazyData: LazyDataFacade) {
    super();
  }

  protected doExtract(itemId: number): Observable<boolean | null> {
    return this.lazyData.getRow('deprecatedItems', itemId, null).pipe(
      map(res => res !== null && res.length > 0)
    );
  }

  getDataType(): DataType {
    return DataType.DEPRECATED;
  }

  isAsync(): boolean {
    return true;
  }

}
