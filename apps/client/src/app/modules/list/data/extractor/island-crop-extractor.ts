import { AbstractExtractor } from './abstract-extractor';
import { DataType } from '../data-type';
import { LazyDataFacade } from '../../../../lazy-data/+state/lazy-data.facade';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { IslandCrop } from '../../model/island-crop';

export class IslandCropExtractor extends AbstractExtractor<IslandCrop> {

  constructor(private lazyData: LazyDataFacade) {
    super();
  }

  isAsync(): boolean {
    return true;
  }

  getDataType(): DataType {
    return DataType.ISLAND_CROP;
  }

  protected doExtract(itemId: number): Observable<IslandCrop> {
    return this.lazyData.getEntry('islandCrops').pipe(
      map((crops) => {
        return crops[itemId];
      })
    );
  }
}
