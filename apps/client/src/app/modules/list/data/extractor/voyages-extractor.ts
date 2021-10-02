import { AbstractExtractor } from './abstract-extractor';
import { ItemData } from '../../../../model/garland-tools/item-data';
import { DataType } from '../data-type';
import { Item } from '../../../../model/garland-tools/item';
import { GarlandToolsService } from '../../../../core/api/garland-tools.service';
import { LazyDataService } from 'apps/client/src/app/core/data/lazy-data.service';
import { ExplorationType } from '../../../../model/other/exploration-type';
import { VoyageSource } from '../../model/voyage-source';

export class VoyagesExtractor extends AbstractExtractor<VoyageSource[]> {

  constructor(gt: GarlandToolsService, private lazyData: LazyDataService) {
    super(gt);
  }

  isAsync(): boolean {
    return false;
  }

  getDataType(): DataType {
    return DataType.VOYAGES;
  }

  protected canExtract(item: Item): boolean {
    return this.lazyData.data.voyageSources[item.id] !== undefined;
  }

  protected doExtract(item: Item, itemData: ItemData): VoyageSource[] {
    return (this.lazyData.data.voyageSources[item.id] || []).map(({ type, id }) => {
      return {
        type,
        name: (type === ExplorationType.AIRSHIP ? this.lazyData.data.airshipVoyages : this.lazyData.data.submarineVoyages)[id]
      };
    });
  }

}
