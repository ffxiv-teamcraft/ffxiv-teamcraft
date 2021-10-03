import { AbstractExtractor } from './abstract-extractor';
import { Drop } from '../../model/drop';
import { ItemData } from '../../../../model/garland-tools/item-data';
import { DataType } from '../data-type';
import { Item } from '../../../../model/garland-tools/item';
import { GarlandToolsService } from '../../../../core/api/garland-tools.service';
import { monsterDrops } from '../../../../core/data/sources/monster-drops';
import { LazyDataService } from '../../../../core/data/lazy-data.service';
import { uniqBy } from 'lodash';

export class DropsExtractor extends AbstractExtractor<Drop[]> {

  constructor(gt: GarlandToolsService, private lazyData: LazyDataService) {
    super(gt);
  }

  isAsync(): boolean {
    return false;
  }

  getDataType(): DataType {
    return DataType.DROPS;
  }

  protected canExtract(item: Item): boolean {
    return true;
  }

  protected doExtract(item: Item, itemData: ItemData): Drop[] {
    const drops: Drop[] = [];
    const lazyDrops = this.lazyData.data.dropSources[item.id];
    if (lazyDrops) {
      lazyDrops
        .forEach(monsterId => {
          if (!this.lazyData.data.monsters[monsterId]) {
            console.warn(`Missing monster details for ${this.lazyData.data.mobs[monsterId]?.en || monsterId}`);
            drops.push({
              id: monsterId
            });
          } else {
            const zoneid = this.lazyData.data.monsters[monsterId].positions[0]?.zoneid;
            const mapid = this.lazyData.data.monsters[monsterId].positions[0]?.map;
            const position = {
              zoneid: zoneid,
              x: +this.lazyData.data.monsters[monsterId].positions[0]?.x,
              y: +this.lazyData.data.monsters[monsterId].positions[0]?.y
            };
            drops.push({
              id: monsterId,
              mapid: mapid,
              zoneid: zoneid,
              position: position
            });
          }
        });
    }
    drops.push(...Object.keys(monsterDrops)
      .filter(key => {
        return monsterDrops[key].indexOf(item.id) > -1;
      })
      .map(monsterId => {
        if (this.lazyData.data.monsters[monsterId] === undefined || this.lazyData.data.monsters[monsterId].positions[0] === undefined) {
          return {
            id: +monsterId
          };
        }
        const zoneid = this.lazyData.data.monsters[monsterId].positions[0].zoneid;
        const mapid = this.lazyData.data.monsters[monsterId].positions[0].map;
        const position = {
          zoneid: zoneid,
          x: +this.lazyData.data.monsters[monsterId].positions[0].x,
          y: +this.lazyData.data.monsters[monsterId].positions[0].y
        };
        return {
          id: +monsterId,
          mapid: mapid,
          zoneid: zoneid,
          lvl: this.lazyData.data.monsters[monsterId].level,
          position: position
        };
      })
    );
    return uniqBy(drops, 'id');
  }
}
