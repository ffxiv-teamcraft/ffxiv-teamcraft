import { AbstractExtractor } from './abstract-extractor';
import { Drop } from '../../model/drop';
import { ItemData } from '../../../../model/garland-tools/item-data';
import { DataType } from '../data-type';
import { Item } from '../../../../model/garland-tools/item';
import * as monsters from '../../../../core/data/sources/monsters.json';
import { GarlandToolsService } from '../../../../core/api/garland-tools.service';

export class DropsExtractor extends AbstractExtractor<Drop[]> {

  constructor(gt: GarlandToolsService) {
    super(gt);
  }

  isAsync(): boolean {
    return false;
  }

  getDataType(): DataType {
    return DataType.DROPS;
  }

  protected canExtract(item: Item): boolean {
    return item !== undefined && item.drops !== undefined;
  }

  protected doExtract(item: Item, itemData: ItemData): Drop[] {
    const drops: Drop[] = [];
    item.drops.forEach(d => {
      const partial = itemData.getPartial(d.toString(), 'mob');
      if (partial !== undefined) {
        const monsterId: string = Math.floor(d % 1000000).toString();
        const zoneid = monsters[monsterId] !== undefined ? monsters[monsterId].zoneid : partial.obj.z;
        const mapid = monsters[monsterId] !== undefined ? monsters[monsterId].map : partial.obj.z;
        const drop: Drop = {
          id: d,
          mapid: mapid,
          zoneid: zoneid,
          lvl: partial.obj.l,
          position: monsters[monsterId]
        };
        drops.push(drop);
      }
    });
    return drops;
  }
}
