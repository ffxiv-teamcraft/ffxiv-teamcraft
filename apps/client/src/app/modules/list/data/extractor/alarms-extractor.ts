import { AbstractExtractor } from './abstract-extractor';
import { Alarm } from '../../../../core/alarms/alarm';
import { Item } from '../../../../model/garland-tools/item';
import { ItemData } from '../../../../model/garland-tools/item-data';
import { DataType } from '../data-type';
import { ListRow } from '../../model/list-row';
import { BellNodesService } from '../../../../core/data/bell-nodes.service';
import { folklores } from '../../../../core/data/sources/folklores';
import { GarlandToolsService } from '../../../../core/api/garland-tools.service';
import * as nodePositions from '../../../../core/data/sources/node-positions.json';

export class AlarmsExtractor extends AbstractExtractor<Partial<Alarm>[]> {
  constructor(gt: GarlandToolsService, private bellNodes: BellNodesService) {
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
    if (row.gatheredBy !== undefined) {
      alarms.push(...row.gatheredBy.nodes
        .filter(node => node.uptime !== undefined || node.weathers !== undefined)
        .map(node => {
          const folklore = Object.keys(folklores).find(id => folklores[id].indexOf(row.id) > -1);
          const alarm: Partial<Alarm> = {
            itemId: item.id,
            icon: item.icon,
            duration: node.uptime / 60,
            zoneId: node.zoneid,
            areaId: node.areaid,
            mapId: node.mapid,
            slot: +node.slot,
            type: row.gatheredBy.type,
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
              icon: [7012, 7012, 7127, 7127, 7128, 7128][row.gatheredBy.type]
            };
          }
          return alarm;
        })
      );
    }
    if (row.reducedFrom !== undefined) {
      alarms.push(...[].concat.apply([], row.reducedFrom
        .filter(reduction => reduction.obj !== undefined && this.bellNodes.getNodesByItemId(reduction.obj.i).length > 0)
        .map(reduction => {
          const nodes = this.bellNodes.getNodesByItemId(reduction.obj.i);
          return nodes.map(node => {
            const folklore = Object.keys(folklores).find(id => folklores[id].indexOf(node.itemId) > -1);
            const nodePosition = nodePositions[node.id];
            const alarm: Partial<Alarm> = {
              itemId: node.itemId,
              icon: node.icon,
              duration: node.uptime / 60,
              zoneId: node.zoneid,
              mapId: nodePosition ? nodePosition.map : node.zoneid,
              areaId: node.areaid,
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
                icon: [7012, 7012, 7127, 7127, 7128, 7128][row.gatheredBy.type]
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
