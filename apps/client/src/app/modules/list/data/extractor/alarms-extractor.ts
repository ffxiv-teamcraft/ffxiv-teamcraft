import { AbstractExtractor } from './abstract-extractor';
import { Alarm } from '../../../../core/alarms/alarm';
import { Item } from '../../../../model/garland-tools/item';
import { ItemData } from '../../../../model/garland-tools/item-data';
import { DataType } from '../data-type';
import { ListRow } from '../../model/list-row';
import { BellNodesService } from '../../../../core/data/bell-nodes.service';

export class AlarmsExtractor extends AbstractExtractor<Partial<Alarm>[]> {
  constructor(private bellNodes: BellNodesService) {
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
    if (row.reducedFrom !== undefined) {
      alarms.push(...[].concat.apply([], row.reducedFrom
        .filter(reduction => reduction.obj !== undefined && this.bellNodes.getNodesByItemId(reduction.obj.i).length > 0)
        .map(reduction => {
          const nodes = this.bellNodes.getNodesByItemId(reduction.obj.i);
          return nodes.map(node => {
            return {
              itemId: node.itemId,
              icon: node.icon,
              duration: node.uptime / 60,
              zoneId: node.zoneid,
              areaId: node.areaid,
              slot: +node.slot,
              type: node.type,
              spawns: node.time,
              coords: {
                x: node.coords[0],
                y: node.coords[1]
              }
            };
          });
        })
      ));
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
