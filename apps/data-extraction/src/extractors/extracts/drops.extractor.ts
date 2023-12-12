import { DataType, Drop, Vector2 } from '@ffxiv-teamcraft/types';
import { AbstractItemDetailsExtractor } from './abstract-item-details-extractor';
import { max, min, uniqBy } from 'lodash';
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
            const avgPosition = this.getAvgPosition(this.monsters[monsterId].positions.filter(p => p.zoneid === zoneid));
            const position = {
              zoneid: zoneid,
              x: +avgPosition.x,
              y: +avgPosition.y,
              radius: avgPosition.radius
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
        const avgPosition = this.getAvgPosition(this.monsters[monsterId].positions.filter(p => p.zoneid === zoneid));
        const position = {
          zoneid: zoneid,
          x: +avgPosition.x,
          y: +avgPosition.y,
          radius: avgPosition.radius
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

  getAvgPosition(coords: Vector2[]): Vector2 & { radius: number } {
    const amplitude = (this.getAmplitude(coords, 'x') + this.getAmplitude(coords, 'y')) / 2;
    return {
      x: this.avgAxis(coords, 'x'),
      y: this.avgAxis(coords, 'y'),
      radius: Math.min((amplitude * 41) || 100, 600)
    };
  }

  private getAmplitude(data: Vector2[], axis: keyof Vector2): number {
    return max(data.map(r => r[axis])) - min(data.map(r => r[axis]));
  }

  private avgAxis(data: Vector2[], axis: keyof Vector2): number {
    return data.reduce((acc, row) => row[axis] + acc, 0) / data.length;
  }

  getDataType(): DataType {
    return DataType.DROPS;
  }

}
