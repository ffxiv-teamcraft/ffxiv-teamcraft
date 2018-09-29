import { AbstractExtractor } from './abstract-extractor';
import { Alarm } from '../../../../core/alarms/alarm';
import { Item } from '../../../../model/garland-tools/item';
import { ItemData } from '../../../../model/garland-tools/item-data';
import { DataType } from '../data-type';
import { ListRow } from '../../model/list-row';
import { MapService } from '../../../map/map.service';

export class AlarmsExtractor extends AbstractExtractor<Partial<Alarm>[]> {
  constructor(private mapService: MapService) {
    super();
  }

  protected canExtract(item: Item): boolean {
    return true;
  }

  protected doExtract(item: Item, itemData: ItemData, row: ListRow): Partial<Alarm>[] {
    const alarms: Partial<Alarm>[] = [];
    if (row.gatheredBy !== undefined) {
      alarms.push(...row.gatheredBy.nodes
        .filter(node => node.uptime !== undefined)
        .map(node => {
          return {
            itemId: item.id,
            icon: item.icon,
            duration: node.uptime / 60,
            zoneId: node.zoneid,
            areaId: node.areaid,
            slot: +node.slot,
            type: row.gatheredBy.type,
            coords: {
              x: node.coords[0],
              y: node.coords[1]
            },
            spawns: node.time
          };
        })
      );
    }
    return alarms;
  }

  getDataType(): DataType {
    return DataType.ALARMS;
  }

  isAsync(): boolean {
    return false;
  }

}
