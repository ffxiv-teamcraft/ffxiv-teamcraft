import { AbstractExtractor } from './abstract-extractor';
import { Drop } from '../../model/drop';
import { ItemData } from '../../../../model/garland-tools/item-data';
import { DataType } from '../data-type';
import { Item } from '../../../../model/garland-tools/item';
import * as monsters from '../../../../core/data/sources/monsters.json';
import { GarlandToolsService } from '../../../../core/api/garland-tools.service';
import { monsterDrops } from '../../../../core/data/sources/monster-drops';

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
    return item !== undefined;
  }

  protected doExtract(item: Item, itemData: ItemData): Drop[] {
    const drops: Drop[] = [];
    if (item.drops) {
      item.drops.forEach(d => {
        const partial = itemData.getPartial(d.toString(), 'mob');
        if (partial !== undefined) {
          const monsterId: string = Math.floor(d % 1000000).toString();
          const zoneid = monsters[monsterId] !== undefined && monsters[monsterId].positions[0] ? monsters[monsterId].positions[0].zoneid : partial.obj.z;
          const mapid = monsters[monsterId] !== undefined && monsters[monsterId].positions[0] ? monsters[monsterId].positions[0].map : partial.obj.z;
          const position = monsters[monsterId] !== undefined && monsters[monsterId].positions[0] ? {
              zoneid: zoneid,
              x: +monsters[monsterId].positions[0].x,
              y: +monsters[monsterId].positions[0].y
            } :
            null;
          const drop: Drop = {
            id: d,
            mapid: mapid,
            zoneid: zoneid,
            lvl: partial.obj.l,
            position: position
          };
          drops.push(drop);
        }
      });
    }
    drops.push(...Object.keys(monsterDrops)
      .filter(key => {
        return monsterDrops[key].indexOf(item.id) > -1;
      })
      .map(monsterId => {
        if (monsters[monsterId] === undefined) {
          return {
            id: +monsterId
          };
        }
        const zoneid = monsters[monsterId].positions[0].zoneid;
        const mapid = monsters[monsterId].positions[0].map;
        const position = {
          zoneid: zoneid,
          x: +monsters[monsterId].positions[0].x,
          y: +monsters[monsterId].positions[0].y
        };
        return {
          id: +monsterId,
          mapid: mapid,
          zoneid: zoneid,
          lvl: monsters[monsterId].level,
          position: position
        };
      })
    );
    return drops;
  }
}
