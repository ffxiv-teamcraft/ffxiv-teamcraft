import { Injectable } from '@angular/core';
import { LocalizedDataService } from './localized-data.service';
import { reductions } from './sources/reductions';
import * as nodePositions from '../../core/data/sources/node-positions.json';

@Injectable()
export class BellNodesService {

  /**
   * Reference to global garlandtools data.
   */
  private nodes: any[] = (<any>window).gt.bell.nodes;

  private cache: { [index: number]: any[] } = {};

  constructor(private localizedDataService: LocalizedDataService) {
  }

  getNodesByItemId(id: number): any[] {
    if (this.cache[id] === undefined) {
      const results = [];
      const itemReductions = reductions[id] || [];
      this.nodes.forEach(node => {
        const match = node.items.find(item => item.id === id || itemReductions.indexOf(item.id) > -1);
        if (match !== undefined) {
          const nodePosition = nodePositions[node.id];
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
}
