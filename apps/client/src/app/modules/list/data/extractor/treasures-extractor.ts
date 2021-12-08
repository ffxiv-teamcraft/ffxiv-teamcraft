import { AbstractExtractor } from './abstract-extractor';
import { DataType } from '../data-type';
import { LazyDataFacade } from '../../../../lazy-data/+state/lazy-data.facade';
import { Observable } from 'rxjs';

export class TreasuresExtractor extends AbstractExtractor<number[]> {
  constructor(private lazyData: LazyDataFacade) {
    super();
  }

  getDataType(): DataType {
    return DataType.TREASURES;
  }

  isAsync(): boolean {
    return true;
  }

  protected doExtract(itemId: number): Observable<number[]> {
    return this.lazyData.getRow('lootSources', itemId);
  }
}
