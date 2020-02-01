import { AbstractExtractor } from './abstract-extractor';
import { GarlandToolsService } from '../../../../core/api/garland-tools.service';
import { DataType } from '../data-type';
import { Item } from '../../../../model/garland-tools/item';
import { ItemData } from '../../../../model/garland-tools/item-data';
import { FateData } from '../../model/fate-data';
import { LazyDataService } from '../../../../core/data/lazy-data.service';

export class FatesExtractor extends AbstractExtractor<FateData[]> {
  constructor(gt: GarlandToolsService, private lazyData: LazyDataService) {
    super(gt);
  }

  getDataType(): DataType {
    return DataType.FATES;
  }

  isAsync(): boolean {
    return false;
  }

  protected canExtract(item: Item): boolean {
    return item.fates !== undefined;
  }

  protected doExtract(item: Item, itemData: ItemData): FateData[] {
    return item.fates.map(f => {
      const fateData = this.lazyData.data.fates[f.toString()];
      const fate: FateData = {
        id: f,
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
  }
}
