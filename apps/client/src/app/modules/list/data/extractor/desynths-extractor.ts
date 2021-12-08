import { AbstractExtractor } from './abstract-extractor';
import { DataType } from '../data-type';
import { LazyDataFacade } from '../../../../lazy-data/+state/lazy-data.facade';
import { Observable } from 'rxjs';

export class DesynthsExtractor extends AbstractExtractor<number[]> {

  constructor(private lazyData: LazyDataFacade) {
    super();
  }

  isAsync(): boolean {
    return true;
  }

  getDataType(): DataType {
    return DataType.DESYNTHS;
  }

  protected doExtract(itemId: number): Observable<number[]> {
    return this.lazyData.getRow('desynth', itemId);
  }

}
