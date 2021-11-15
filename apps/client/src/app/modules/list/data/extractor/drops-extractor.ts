import { AbstractExtractor } from './abstract-extractor';
import { Drop } from '../../model/drop';
import { ItemData } from '../../../../model/garland-tools/item-data';
import { DataType } from '../data-type';
import { Item } from '../../../../model/garland-tools/item';
import { GarlandToolsService } from '../../../../core/api/garland-tools.service';
import { monsterDrops } from '../../../../core/data/sources/monster-drops';
import { uniqBy } from 'lodash';
import { LazyDataFacade } from '../../../../lazy-data/+state/lazy-data.facade';
import { combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export class DropsExtractor extends AbstractExtractor<Drop[]> {

  constructor(gt: GarlandToolsService, private lazyData: LazyDataFacade) {
    super(gt);
  }

  isAsync(): boolean {
    return true;
  }

  getDataType(): DataType {
    return DataType.DROPS;
  }

  protected canExtract(item: Item): boolean {
    return true;
  }

  protected doExtract(item: Item, itemData: ItemData): Observable<Drop[]> {
    return combineLatest([
      this.lazyData.getRow('dropSources', item.id),
      this.lazyData.getEntry('monsters')
    ]).pipe(
      map(([lazyDrops, monsters]) => {
        const drops: Drop[] = [];
        if (lazyDrops) {
          lazyDrops
            .forEach(monsterId => {
              if (!monsters[monsterId]) {
                console.warn(`Missing monster details for ${monsterId}`);
                drops.push({
                  id: monsterId
                });
              } else {
                const zoneid = monsters[monsterId].positions[0]?.zoneid;
                const mapid = monsters[monsterId].positions[0]?.map;
                const position = {
                  zoneid: zoneid,
                  x: +monsters[monsterId].positions[0]?.x,
                  y: +monsters[monsterId].positions[0]?.y
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
            if (monsters[monsterId] === undefined || monsters[monsterId].positions[0] === undefined) {
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
        return uniqBy(drops, 'id');
      })
    );
  }
}
