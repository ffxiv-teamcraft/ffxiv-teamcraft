import { AbstractExtractor } from './abstract-extractor';
import { DataType } from '../data-type';
import { MogstationItem } from '../../model/mogstation-item';
import { LazyDataFacade } from '../../../../lazy-data/+state/lazy-data.facade';
import { Observable } from 'rxjs';

export class MogstationExtractor extends AbstractExtractor<MogstationItem> {
  constructor(private lazyData: LazyDataFacade) {
    super();
  }

  getDataType(): DataType {
    return DataType.MOGSTATION;
  }

  isAsync(): boolean {
    return true;
  }

  protected doExtract(itemId: number): Observable<MogstationItem> {
    return this.lazyData.getRow('mogstationSources', itemId);
  }

}
