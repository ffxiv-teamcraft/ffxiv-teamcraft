import { AbstractExtractor } from './abstract-extractor';
import { Alarm } from '../../../../core/alarms/alarm';
import { Item } from '../../../../model/garland-tools/item';
import { ItemData } from '../../../../model/garland-tools/item-data';
import { DataType } from '../data-type';
import { getItemSource, ListRow } from '../../model/list-row';
import { BellNodesService } from '../../../../core/data/bell-nodes.service';
import { folklores } from '../../../../core/data/sources/folklores';
import { GarlandToolsService } from '../../../../core/api/garland-tools.service';
import { LazyDataService } from '../../../../core/data/lazy-data.service';

export class AlarmsExtractor extends AbstractExtractor<Partial<Alarm>[]> {
  constructor(gt: GarlandToolsService, private bellNodes: BellNodesService, private lazyData: LazyDataService) {
    super(gt);
  }

  getDataType(): DataType {
    return DataType.ALARMS;
  }

  isAsync(): boolean {
    return false;
  }

  protected canExtract(item: Item): boolean {
    return true;
  }

  protected doExtract(item: Item, itemData: ItemData, row: ListRow): Partial<Alarm>[] {
    const alarms: Partial<Alarm>[] = [];
    if (getItemSource(row, DataType.GATHERED_BY, true).type !== undefined) {
      alarms.push(...getItemSource(row, DataType.GATHERED_BY, true).nodes
        .filter(node => node.uptime !== undefined || node.weathers !== undefined)
        .map(node => {
          const folklore = Object.keys(folklores).find(id => folklores[id].indexOf(row.id) > -1);
          const alarm: Partial<Alarm> = {
            itemId: item.id,
            icon: item.icon,
            duration: node.uptime / 60,
            zoneId: node.zoneid,
            mapId: node.mapid,
            slot: +node.slot,
            type: getItemSource(row, DataType.GATHERED_BY, true).type,
            ephemeral: node.limitType && node.limitType.en === 'Ephemeral',
            coords: {
              x: node.coords[0],
              y: node.coords[1]
            },
            spawns: node.time,
            snagging: node.snagging,
            fishEyes: node.fishEyes,
            predators: node.predators || []
          };
          if (node.baits !== undefined) {
            alarm.baits = node.baits;
          }
          if (node.weathers !== undefined) {
            alarm.weathers = node.weathers;
          }
          if (folklore !== undefined) {
            alarm.folklore = {
              id: +folklore,
              icon: [7012, 7012, 7127, 7127, 7128, 7128][getItemSource(row, DataType.GATHERED_BY, true).type]
            };
          }
          return alarm;
        })
      );
    }
    if (getItemSource(row, DataType.REDUCED_FROM).length > 0) {
      alarms.push(...[].concat.apply([], getItemSource(row, DataType.REDUCED_FROM)
        .filter(reduction => reduction.obj !== undefined && this.bellNodes.getNodesByItemId(reduction.obj.i).length > 0)
        .map(reduction => {
          const nodes = this.bellNodes.getNodesByItemId(reduction.obj.i);
          return nodes.map(node => {
            const folklore = Object.keys(folklores).find(id => folklores[id].indexOf(node.itemId) > -1);
            const nodePosition = this.lazyData.data.nodePositions[node.id];
            const alarm: Partial<Alarm> = {
              itemId: node.itemId,
              icon: node.icon,
              duration: node.uptime / 60,
              zoneId: node.zoneid,
              mapId: nodePosition ? nodePosition.map : node.zoneid,
              slot: +node.slot,
              type: node.type,
              spawns: node.time,
              coords: {
                x: node.coords[0],
                y: node.coords[1]
              }
            };
            if (folklore !== undefined) {
              alarm.folklore = {
                id: +folklore,
                icon: [7012, 7012, 7127, 7127, 7128, 7128][getItemSource(row, DataType.GATHERED_BY, true).type]
              };
            }
            return alarm;
          });
        })
      ));
    }
    return alarms;
  }

}
