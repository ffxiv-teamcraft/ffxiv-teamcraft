import { DataType, Drop } from '@ffxiv-teamcraft/types';
import { AbstractItemDetailsExtractor } from './abstract-item-details-extractor';
import { uniqBy } from 'lodash';
import { monsterDrops } from '@ffxiv-teamcraft/data/handmade/monster-drops';

export class DropsExtractor extends AbstractItemDetailsExtractor<Drop[]> {
  dropSources = this.requireLazyFile('dropSources');

  monsters = this.requireLazyFile('monsters');

  doExtract(itemId: number): Drop[] {
    const drops: Drop[] = [];
    const lazyDrops = this.dropSources[itemId];
    if (lazyDrops) {
      lazyDrops
        .forEach(monsterId => {
          if (!this.monsters[monsterId]) {
            drops.push({
              id: monsterId
            });
          } else {
            const zoneid = this.monsters[monsterId].positions[0]?.zoneid;
            const mapid = this.monsters[monsterId].positions[0]?.map;
            const position = {
              zoneid: zoneid,
              x: +this.monsters[monsterId].positions[0]?.x,
              y: +this.monsters[monsterId].positions[0]?.y
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
        return monsterDrops[key].indexOf(itemId) > -1;
      })
      .map(monsterId => {
        if (this.monsters[monsterId] === undefined || this.monsters[monsterId].positions[0] === undefined) {
          return {
            id: +monsterId
          };
        }
        const zoneid = this.monsters[monsterId].positions[0].zoneid;
        const mapid = this.monsters[monsterId].positions[0].map;
        const position = {
          zoneid: zoneid,
          x: +this.monsters[monsterId].positions[0].x,
          y: +this.monsters[monsterId].positions[0].y
        };
        return {
          id: +monsterId,
          mapid: mapid,
          zoneid: zoneid,
          lvl: this.monsters[monsterId].level,
          position: position
        };
      })
    );
    return uniqBy(drops, 'id');
  }

  getDataType(): DataType {
    return DataType.DROPS;
  }

}
