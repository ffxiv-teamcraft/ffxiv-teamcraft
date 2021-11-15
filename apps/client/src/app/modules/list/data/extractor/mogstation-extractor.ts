import { AbstractExtractor } from './abstract-extractor';
import { Item } from '../../../../model/garland-tools/item';
import { DataType } from '../data-type';
import { GarlandToolsService } from '../../../../core/api/garland-tools.service';
import { MogstationItem } from '../../model/mogstation-item';
import { LazyDataFacade } from '../../../../lazy-data/+state/lazy-data.facade';
import { Observable } from 'rxjs';

export class MogstationExtractor extends AbstractExtractor<MogstationItem> {
  constructor(gt: GarlandToolsService, private lazyData: LazyDataFacade) {
    super(gt);
  }

  getDataType(): DataType {
    return DataType.MOGSTATION;
  }

  isAsync(): boolean {
    return true;
  }

  protected canExtract(item: Item): boolean {
    return true;
  }

  protected doExtract(item: Item): Observable<MogstationItem> {
    return this.lazyData.getRow('mogstationSources', item.id);
  }

}
