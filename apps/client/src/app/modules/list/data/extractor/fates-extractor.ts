import { AbstractExtractor } from './abstract-extractor';
import { GarlandToolsService } from '../../../../core/api/garland-tools.service';
import { DataType } from '../data-type';
import { Item } from '../../../../model/garland-tools/item';
import { ItemData } from '../../../../model/garland-tools/item-data';
import { FateData } from '../../model/fate-data';

export class FatesExtractor extends AbstractExtractor<FateData[]> {
  constructor(gt: GarlandToolsService) {
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
      const partial = itemData.getPartial(f.toString(), 'fate');
      const fate: FateData = {
        id: f,
        level: partial.obj.l
      };
      if (partial.obj.z) {
        fate.zoneId = partial.obj.z;
      }
      if (partial.obj.c) {
        fate.coords = {
          x: partial.obj.c[0],
          y: partial.obj.c[1]
        };
      }
      return fate;
    });
  }
}
