import { Injectable } from '@angular/core';
import { LocalizedDataService } from './localized-data.service';
import { reductions } from './sources/reductions';
import { folklores } from './sources/folklores';
import { fishEyes } from './sources/fish-eyes';
import { spearFishingNodes } from './sources/spear-fishing-nodes';
import { GarlandToolsService } from '../api/garland-tools.service';
import { LazyDataService } from './lazy-data.service';

@Injectable({
  providedIn: 'root'
})
export class BellNodesService {

  /**
   * Reference to global garlandtools data.
   */
  private nodes: any[] = (<any>window).gt.bell.nodes;

  private cache: { [index: number]: any[] } = {};

  constructor(private localizedDataService: LocalizedDataService, private l12n: LocalizedDataService,
              private gt: GarlandToolsService, private lazyData: LazyDataService) {
  }

  getNodesByItemId(id: number): any[] {
    if (this.cache[id] === undefined) {
      const results = [];
      const itemReductions = reductions[id] || [];
      this.nodes.forEach(node => {
        const match = node.items.find(item => item.id === id || itemReductions.indexOf(item.id) > -1);
        if (match !== undefined) {
          const nodePosition = this.lazyData.data.nodePositions[node.id];
          const nodeCopy = { ...node };
          nodeCopy.icon = match.icon;
          nodeCopy.itemId = match.id;
          nodeCopy.mapid = nodePosition ? nodePosition.map : node.zoneid;
          if (match.slot !== '?' && match.slot !== undefined) {
            nodeCopy.slot = +match.slot;
          }
          nodeCopy.type = ['Rocky Outcropping', 'Mineral Deposit', 'Mature Tree', 'Lush Vegetation'].indexOf(node.type);
          nodeCopy.zoneid = this.localizedDataService.getAreaIdByENName(node.zone);
          nodeCopy.areaid = this.localizedDataService.getAreaIdByENName(node.title);
          results.push(nodeCopy);
        }
      });
      this.cache[id] = results;
    }
    return this.cache[id];
  }

  getNode(id: number): any {
    const node = this.nodes.find(n => n.id === id);
    if (node !== undefined) {
      node.itemId = id;
      node.zoneid = this.localizedDataService.getAreaIdByENName(node.zone);
      node.areaid = this.localizedDataService.getAreaIdByENName(node.title);
    }
    return node;
  }

  getAllNodes(...items: any[]): any[] {
    const nodesFromPositions = [].concat.apply([], items.map(item => {
      const availableNodeIds = item.nodes && item.nodes.length > 0 ? item.nodes : Object.keys(this.lazyData.data.nodePositions)
        .filter(key => {
          return this.lazyData.data.nodePositions[key].items.indexOf(item.obj.i) > -1;
        });
      return availableNodeIds
        .map(key => {
          return { ...item, ...this.lazyData.data.nodePositions[key], nodeId: key };
        })
        .map(node => {
          const bellNode = this.getNode(+node.nodeId);
          node.timed = bellNode !== undefined;
          node.itemId = node.obj.i;
          node.icon = item.obj.c;
          if (node.timed) {
            node.type = ['Rocky Outcropping', 'Mineral Deposit', 'Mature Tree', 'Lush Vegetation'].indexOf(bellNode.type);
            const slotMatch = bellNode.items.find(nodeItem => nodeItem.id === item.obj.i);
            node.spawnTimes = bellNode.time;
            node.uptime = bellNode.uptime;
            if (slotMatch !== undefined) {
              node.slot = slotMatch.slot;
            }
          }
          node.hidden = !(node.items || []).some(itemId => itemId === node.itemId);
          node.mapId = node.map;
          const folklore = Object.keys(folklores).find(id => folklores[id].indexOf(item.obj.i) > -1);
          if (folklore !== undefined) {
            node.folklore = {
              id: +folklore,
              icon: [7012, 7012, 7127, 7127, 7128, 7128][node.type]
            };
          }
          return node;
        });
    }));

    const nodesFromGarlandBell = [].concat.apply([], items
      .map(item => {
        return [].concat.apply([],
          [item.obj.i, ...reductions[item.obj.i]].map(itemId => {
            return this.getNodesByItemId(itemId)
              .map(node => {
                const nodePosition = this.lazyData.data.nodePositions[node.id];
                const result = {
                  ...item,
                  nodeId: node.id,
                  zoneid: this.l12n.getAreaIdByENName(node.zone),
                  mapId: nodePosition ? nodePosition.map : this.l12n.getAreaIdByENName(node.zone),
                  x: node.coords[0],
                  y: node.coords[1],
                  level: node.lvl,
                  type: node.type,
                  itemId: node.itemId,
                  icon: node.icon,
                  spawnTimes: node.time,
                  uptime: node.uptime,
                  slot: node.slot,
                  timed: true,
                  reduction: reductions[item.obj.i] && reductions[item.obj.i].indexOf(node.itemId) > -1,
                  ephemeral: node.name === 'Ephemeral',
                  items: node.items
                };
                const folklore = Object.keys(folklores).find(id => folklores[id].indexOf(item.obj.i) > -1);
                if (folklore !== undefined) {
                  result.folklore = {
                    id: +folklore,
                    icon: [7012, 7012, 7127, 7127, 7128, 7128][node.type]
                  };
                }
                return result;
              });
          })
        );
      })
    );

    const nodesFromFishing = [].concat.apply([], ...items.map(item => {
      const spots = this.gt.getFishingSpots(item.obj.i);
      if (spots.length > 0) {
        return spots.map(spot => {
          const mapId = this.l12n.getMapId(spot.zone);
          const zoneId = this.l12n.getAreaIdByENName(spot.title);
          if (mapId !== undefined) {
            const result = {
              ...item,
              zoneid: zoneId,
              mapId: mapId,
              x: spot.coords[0],
              y: spot.coords[1],
              level: spot.lvl,
              type: 4,
              itemId: spot.id,
              icon: spot.icon,
              timed: spot.during !== undefined,
              fishEyes: spot.fishEyes || fishEyes[item.obj.i] !== undefined,
              snagging: spot.snagging
            };
            if (spot.during !== undefined) {
              result.spawnTimes = [spot.during.start];
              result.uptime = spot.during.end - spot.during.start;
              // Just in case it despawns the day after.
              result.uptime = result.uptime < 0 ? result.uptime + 24 : result.uptime;
              // As uptimes are always in minutes, gotta convert to minutes here too.
              result.uptime *= 60;
            }

            if (spot.predator) {
              result.predators = spot.predator.map(predator => {
                return {
                  id: predator.id,
                  icon: predator.icon,
                  amount: predator.predatorAmount
                };
              });
            }

            if (spot.hookset) {
              result.hookset = spot.hookset.split(' ')[0].toLowerCase();
            }

            result.baits = spot.bait.map(bait => {
              const baitData = this.gt.getBait(bait);
              return {
                icon: baitData.icon,
                id: baitData.id
              };
            });
            if (spot.weather) {
              result.weathers = spot.weather.map(w => this.l12n.getWeatherId(w));
            }
            if (spot.transition) {
              result.weathersFrom = spot.transition.map(w => this.l12n.getWeatherId(w));
            }
            return result;
          }
          return undefined;
        })
          .filter(res => res !== undefined);
      }
      return [];
    }).filter(res => res !== undefined));

    const results = [...nodesFromGarlandBell,
      ...nodesFromPositions,
      ...nodesFromFishing];

    //Once we have the resulting nodes, we need to remove the ones that appear twice or more for the same item.
    const finalNodes = [];
    results
      .sort((a, b) => {
        if (a.ephemeral && !b.ephemeral) {
          return -1;
        } else if (b.ephemeral && !a.ephemeral) {
          return 1;
        }
        return 0;
      })
      .forEach(row => {
        const spearFishingSpot = spearFishingNodes.find(node => node.itemId === row.itemId);
        // If it's a spearfishing node, we have some data to add.
        if (spearFishingSpot !== undefined) {
          row.gig = spearFishingSpot.gig;
          if (spearFishingSpot.spawn !== undefined) {
            row.timed = true;
            row.spawnTimes = [spearFishingSpot.spawn];
            row.uptime = spearFishingSpot.duration;
            // Just in case it despawns the day after.
            row.uptime = row.uptime < 0 ? row.uptime + 24 : row.uptime;
            // As uptimes are always in minutes, gotta convert to minutes here too.
            row.uptime *= 60;
          }

          if (spearFishingSpot.predator) {
            row.predators = spearFishingSpot.predator.map(predator => {
              const itemId = +Object.keys(this.lazyData.data.items).find(key => this.lazyData.data.items[key].en === predator.name);
              return {
                id: itemId,
                icon: this.lazyData.data.itemIcons[itemId],
                predatorAmount: predator.predatorAmount
              };
            });
          }
        }
        if (row.mapId === undefined && this.l12n.getPlace(row.zoneid)) {
          row.mapId = this.l12n.getMapId(this.l12n.getPlace(row.zoneid).en);
        }
        if (!(finalNodes || []).some(node => node.itemId === row.itemId && node.zoneid === row.zoneid && node.type === row.type) && row.mapId !== undefined) {
          finalNodes.push(row);
        }
      });

    return finalNodes;
  }
}
