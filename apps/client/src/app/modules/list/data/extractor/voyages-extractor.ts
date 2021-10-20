import { AbstractExtractor } from './abstract-extractor';
import { ItemData } from '../../../../model/garland-tools/item-data';
import { DataType } from '../data-type';
import { Item } from '../../../../model/garland-tools/item';
import { GarlandToolsService } from '../../../../core/api/garland-tools.service';
import { ExplorationType } from '../../../../model/other/exploration-type';
import { VoyageSource } from '../../model/voyage-source';
import { LazyDataFacade } from 'apps/client/src/app/lazy-data/+state/lazy-data.facade';
import { combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export class VoyagesExtractor extends AbstractExtractor<VoyageSource[]> {

  constructor(gt: GarlandToolsService, private lazyData: LazyDataFacade) {
    super(gt);
  }

  isAsync(): boolean {
    return true;
  }

  getDataType(): DataType {
    return DataType.VOYAGES;
  }

  protected canExtract(item: Item): boolean {
    return true;
  }

  protected doExtract(item: Item, itemData: ItemData): Observable<VoyageSource[]> {
    return combineLatest([
      this.lazyData.getEntry('airshipVoyages'),
      this.lazyData.getEntry('submarineVoyages'),
      this.lazyData.getRow('voyageSources', item.id, [])
    ]).pipe(
      map(([airshipVoyages, submarineVoyages, voyageSource]) => {
        return voyageSource.map(({ type, id }) => {
          return {
            type,
            name: (type === ExplorationType.AIRSHIP ? airshipVoyages : submarineVoyages)[id]
          };
        });
      })
    );
  }

}
