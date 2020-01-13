import { AbstractExtractor } from './abstract-extractor';
import { GatheredBy } from '../../model/gathered-by';
import { ItemData } from '../../../../model/garland-tools/item-data';
import { DataType } from '../data-type';
import { LocalizedDataService } from '../../../../core/data/localized-data.service';
import { HtmlToolsService } from '../../../../core/tools/html-tools.service';
import { GarlandToolsService } from '../../../../core/api/garland-tools.service';
import { Item } from '../../../../model/garland-tools/item';
import { StoredNode } from '../../model/stored-node';
import { FishingBait } from '../../model/fishing-bait';
import { spearFishingNodes } from '../../../../core/data/sources/spear-fishing-nodes';
import { LazyDataService } from '../../../../core/data/lazy-data.service';
import { fishEyes } from '../../../../core/data/sources/fish-eyes';
import { gatheringItems } from '../../../../core/data/sources/gathering-items';

export class GatheredByExtractor extends AbstractExtractor<GatheredBy> {

  constructor(protected gt: GarlandToolsService, private htmlTools: HtmlToolsService, private localized: LocalizedDataService,
              private lazyData: LazyDataService) {
    super(gt);
  }

  isAsync(): boolean {
    return false;
  }

  getDataType(): DataType {
    return DataType.GATHERED_BY;
  }

  protected canExtract(item: Item): boolean {
    return item.hasNodes() || (item.fishingSpots !== undefined && item.fishingSpots.length > 0);
  }

  protected doExtract(item: Item, itemData: ItemData): GatheredBy {
    const gatheringItem = Object.keys(gatheringItems).map(key => gatheringItems[key]).find(g => g.itemId === item.id);
    const gatheredBy: GatheredBy = {
      icon: '',
      stars_tooltip: gatheringItem ? this.htmlTools.generateStars(gatheringItem.stars) : '',
      level: gatheringItem ? gatheringItem.level : 999,
      nodes: [],
      type: -1
    };
    // If it's a node gather (not a fish)
    if (item.hasNodes()) {
      for (const node of item.nodes) {
        const nodePartialEntry = itemData.getPartial(node.toString(), 'node');
        if (nodePartialEntry === undefined) {
          break;
        }
        const partial = nodePartialEntry.obj;
        let details;
        if (partial.lt !== undefined) {
          details = this.gt.getBellNode(node);
        }
        gatheredBy.type = partial.t;
        gatheredBy.icon = [
          './assets/icons/Mineral_Deposit.png',
          './assets/icons/MIN.png',
          './assets/icons/Mature_Tree.png',
          './assets/icons/BTN.png',
          'https://garlandtools.org/db/images/FSH.png'
        ][partial.t];
        if (gatheringItem === undefined) {
          gatheredBy.stars_tooltip = this.htmlTools.generateStars(partial.s);
          gatheredBy.level = gatheredBy.level > +partial.l ? +partial.l : gatheredBy.level;
        }
        if (partial.n !== undefined) {
          const storedNode: Partial<StoredNode> = {
            id: +partial.i,
            zoneid: partial.z,
            level: +partial.l,
            areaid: this.localized.getAreaIdByENName(partial.n),
            type: partial.t
          };
          const lazyNode = this.lazyData.data.nodePositions[partial.i.toString()];
          if (lazyNode && !lazyNode.items.some(row => row === item.id)) {
            storedNode.hidden = true;
          }
          if (details !== undefined) {
            const detailsItem = details.items.find(i => i.id === item.id);
            storedNode.slot = detailsItem !== undefined ? detailsItem.slot : '?';
            storedNode.time = details.time;
            storedNode.uptime = details.uptime;
            storedNode.limitType = { en: partial.lt, de: partial.lt, fr: partial.lt, ja: partial.lt };
            storedNode.coords = details.coords;
          }
          // If we don't have position for this node in data provided by garlandtools,w e might have it inside our data.
          if (this.lazyData.data.nodePositions[node] !== undefined && this.lazyData.data.nodePositions[node].x && this.lazyData.data.nodePositions[node].y) {
            storedNode.coords = [this.lazyData.data.nodePositions[node].x, this.lazyData.data.nodePositions[node].y];
          }
          // Set proper map id based on informations we have
          if (this.lazyData.data.nodePositions[node] && this.lazyData.data.nodePositions[node].map) {
            storedNode.mapid = this.lazyData.data.nodePositions[node].map;
          } else {
            storedNode.mapid = this.localized.getMapId(this.localized.getPlace(partial.z).en);
          }
          // We need to cleanup the node object to avoid database issues with undefined value.
          Object.keys(storedNode).forEach(key => {
            if (storedNode[key] === undefined) {
              delete storedNode[key];
            }
          });
          const spearFishingSpot = spearFishingNodes.find(n => n.itemId === item.id);
          // If it's a spearfishing node, we have some data to add.
          if (spearFishingSpot !== undefined) {
            storedNode.gig = spearFishingSpot.gig;
            if (spearFishingSpot.spawn !== undefined) {
              storedNode.time = [spearFishingSpot.spawn];
              storedNode.uptime = spearFishingSpot.duration;
              // Just in case it despawns the day after.
              storedNode.uptime = storedNode.uptime < 0 ? storedNode.uptime + 24 : storedNode.uptime;
              // As uptimes are always in minutes, gotta convert to minutes here too.
              storedNode.uptime *= 60;
            }

            if (spearFishingSpot.predator) {
              storedNode.predators = spearFishingSpot.predator.map(predator => {
                const itemId = +Object.keys(this.lazyData.data.items).find(key => this.lazyData.data.items[key].en === predator.name);
                return {
                  id: itemId,
                  icon: this.lazyData.data.itemIcons[itemId],
                  amount: predator.predatorAmount
                };
              });
            }
          }
          gatheredBy.nodes.push(<StoredNode>storedNode);
        }
      }
    } else {
      gatheredBy.type = 4;
      gatheredBy.icon = 'https://garlandtools.org/db/images/FSH.png';
      // If it's a fish, we have to handle it in another way
      const spots = this.gt.getFishingSpots(item.id);
      for (const spot of spots) {
        const mapId = this.localized.getMapId(spot.zone);
        const zoneId = this.localized.getAreaIdByENName(spot.title);
        if (mapId !== undefined) {
          const node: StoredNode = {
            id: 0,
            mapid: mapId,
            areaid: mapId,
            zoneid: zoneId,
            coords: spot.coords as number[],
            level: spot.lvl,
            fishEyes: spot.fishEyes || fishEyes[item.id] !== undefined,
            snagging: spot.snagging,
            type: 4
          };
          if (spot.during !== undefined) {
            node.time = [spot.during.start];
            node.uptime = spot.during.end - spot.during.start;
            // Just in case it despawns the day after.
            node.uptime = node.uptime < 0 ? node.uptime + 24 : node.uptime;
            // As uptimes are always in minutes, gotta convert to minutes here too.
            node.uptime *= 60;
          }
          if (spot.hookset) {
            node.hookset = spot.hookset.split(' ')[0].toLowerCase();
          }
          if (spot.predator) {
            node.predators = spot.predator.map(predator => {
              return {
                id: predator.id,
                icon: predator.icon,
                amount: predator.predatorAmount
              };
            });
          }
          node.baits = this.getBaits(spot.bait);
          if (spot.weather) {
            node.weathers = spot.weather.map(w => this.localized.getWeatherId(w));
          }
          if (spot.transition) {
            node.weathersFrom = spot.transition.map(w => this.localized.getWeatherId(w));
          }
          gatheredBy.nodes.push(node);
        }
        gatheredBy.level = (gatheredBy.level === 0 || gatheredBy.level > spot.lvl) ? spot.lvl : gatheredBy.level;
      }
      // If we don't have some complete spots from gt, let's get some partials.
      if (spots.length === 0) {
        for (const spot of item.fishingSpots) {
          const partial = itemData.getPartial(spot.toString(), 'fishing');
          const mapId = this.localized.getMapId(this.localized.getPlace(partial.obj.z).en);
          if (partial !== undefined) {
            const node: StoredNode = {
              id: 0,
              zoneid: partial.obj.z,
              areaid: partial.obj.z,
              mapid: mapId,
              level: partial.obj.l,
              coords: [partial.obj.x, partial.obj.y],
              type: 4
            };
            gatheredBy.level = (gatheredBy.level === 0 || gatheredBy.level > partial.obj.l) ? partial.obj.l : gatheredBy.level;
            gatheredBy.nodes.push(node);
          }
        }
      }
    }
    gatheredBy.nodes = gatheredBy.nodes.sort((a, b) => a.level - b.level);
    return gatheredBy;
  }

  private getBaits(baitNames: string[]): FishingBait[] {
    return baitNames.map(bait => {
      const baitData = this.gt.getBait(bait);
      return {
        icon: baitData.icon,
        id: baitData.id
      };
    });
  }

  protected extractsArray(): boolean {
    return false;
  }

}
