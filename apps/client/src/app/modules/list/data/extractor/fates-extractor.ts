import { AbstractExtractor } from './abstract-extractor';
import { GarlandToolsService } from '../../../../core/api/garland-tools.service';
import { DataType } from '../data-type';
import { Item } from '../../../../model/garland-tools/item';
import { ItemData } from '../../../../model/garland-tools/item-data';
import { FateData } from '../../model/fate-data';
import { LazyDataFacade } from '../../../../lazy-data/+state/lazy-data.facade';
import { combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export class FatesExtractor extends AbstractExtractor<FateData[]> {
  constructor(gt: GarlandToolsService, private lazyData: LazyDataFacade) {
    super(gt);
  }

  getDataType(): DataType {
    return DataType.FATES;
  }

  isAsync(): boolean {
    return true;
  }

  protected canExtract(item: Item): boolean {
    return true;
  }

  protected doExtract(item: Item, itemData: ItemData): Observable<FateData[]> {
    return combineLatest([
      this.lazyData.getRow('fateSources', item.id, []),
      this.lazyData.getEntry('fates')
    ]).pipe(
      map(([fateSources, fates]) => {
        return fateSources
          .filter(fate => !!fate)
          .map(fateId => {
            const fateData = fates[fateId];
            const fate: FateData = {
              id: fateId,
              level: fateData.level
            };
            if (fateData.position) {
              fate.zoneId = fateData.position.zoneid;
              fate.coords = {
                x: fateData.position.x,
                y: fateData.position.y
              };
            }
            return fate;
          });
      })
    );

  }
}
