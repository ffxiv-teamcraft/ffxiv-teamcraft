import { AbstractItemDetailsExtractor } from './abstract-item-details-extractor';
import { FishingBait, GatheringNode } from '@ffxiv-teamcraft/types';
import { LazyFishingSpot } from '@ffxiv-teamcraft/data/model/lazy-fishing-spot';
import { LazyData } from '@ffxiv-teamcraft/data/model/lazy-data';

export class GatheredByExtractor extends AbstractItemDetailsExtractor<any> {

  protected spearfishingSources = this.requireLazyFile('spearfishingSources');

  protected fishingSources = this.requireLazyFile('fishingSources');

  protected fishingSpots = this.requireLazyFile('fishingSpots');

  protected fishParameter = this.requireLazyFile('fishParameter');

  protected islandGatheringItems = this.requireLazyFile('islandGatheringItems');

  protected reductionSources = this.requireLazyFile('reduction');

  protected minBtnSpearNodes = Object.entries(this.requireLazyFile('nodes')).map(([key, value]) => {
    const res = {
      ...value,
      id: +key,
      zoneId: value.zoneid
    };
    delete res.zoneid;
    return res;
  });

  protected gatheringItems = this.requireLazyFile('gatheringItems');


  constructor() {
    super();
  }

  getItemNodes(itemId: number, onlyDirect = false): any[] {
    let idsToConsider = [itemId];
    if (!onlyDirect) {
      idsToConsider = [
        itemId,
        ...(this.reductionSources[itemId] || [])
      ];
    }
    const results: GatheringNode[][] = idsToConsider.map(id => {
      const minBtnSpearMatches: GatheringNode[] = this.minBtnSpearNodes.filter(node => {
        return node.items.includes(id) && node.zoneId > 0;
      });

      const hiddenReferences = this.minBtnSpearNodes.filter(node => {
        return (node.hiddenItems || []).includes(id) && node.zoneId > 0;
      });

      const minBtnSpearHiddenMatches: GatheringNode[] = [...minBtnSpearMatches, ...hiddenReferences.map(node => ({
        ...node,
        matchingItemIsHidden: true
      }))].map(node => {
        if (node.type === 5) {
          node.type = 4;
        }
        return node;
      });

      const fishingSpotMatches: GatheringNode[] = (this.fishingSources[id] || []).map(entry => {
        const spot = this.fishingSpots.find(s => s.id === entry.spot);
        const fishParameterEntry = this.fishParameter[id];
        if (fishParameterEntry) {
          return {
            id: spot.id,
            items: spot.fishes,
            level: spot.level,
            type: -5,
            legendary: false,
            ephemeral: false,
            zoneId: spot.zoneId,
            map: spot.mapId,
            x: spot.coords?.x,
            y: spot.coords?.y,
            z: 0,

            predators: entry.predators,
            spawns: [entry.spawn].filter(s => s !== undefined && s !== null),
            duration: (entry.duration || 0) * 60,
            weathers: entry.weathers,
            weathersFrom: entry.weathersFrom,
            limited: entry.spawn !== undefined || entry.weathers?.length > 0,
            folklore: fishParameterEntry.folklore,
            hookset: entry.hookset,
            tug: entry.tug,
            snagging: entry.snagging,
            baits: this.getBaitChain(entry.bait, spot, this.fishingSources),
            oceanFishingTime: entry.oceanFishingTime || null,
            minGathering: entry.minGathering
          } as GatheringNode;
        }
      }).filter(node => !!node);

      const spearFishingMatches = (this.spearfishingSources[id] || []).map((entry: any) => {
        const spot = this.minBtnSpearNodes.find(n => n.items.includes(id));
        if (spot) {
          return {
            id: spot.id,
            level: spot.level,
            items: spot.items,
            type: 4,
            legendary: false,
            ephemeral: false,
            zoneId: spot.zoneId,
            map: spot.map,
            x: spot.x,
            y: spot.y,
            z: spot.z,
            predators: entry.predators,
            spawns: [entry.spawn].filter(s => s !== undefined && s !== null),
            duration: (entry.duration || 0) * 60,
            // We don't have weather requirements for spearfishing yet but let's prepare for it just in case.
            weathers: (entry as any).weathers,
            weathersFrom: (entry as any).weathersFrom,
            limited: entry.spawn !== undefined || (entry as any).weathers?.length > 0,
            speed: entry.speed,
            shadowSize: entry.shadowSize
          } as GatheringNode;
        }
      });

      const islandMatches: GatheringNode[] = [this.islandGatheringItems[id]]
        .filter(item => !!item)
        .map(item => {
          return {
            id: -id,
            isIslandNode: true,
            items: [id],
            level: 1,
            zoneId: 4043,
            type: -10,
            map: 772,

            x: item.x,
            y: item.y,
            z: item.z
          };
        });

      return [...minBtnSpearHiddenMatches.filter(e => !spearFishingMatches.some(s => s.id === e.id)), ...fishingSpotMatches, ...spearFishingMatches, ...islandMatches]
        .map(node => {
          return { ...node, matchingItemId: id };
        });
    });

    return results.flat();
  }

  private getBaitChain(baitId: number, fishingSpot: LazyFishingSpot, fishingSources: LazyData['fishingSources'], currentChain: FishingBait[] = []): FishingBait[] {
    // If it's a mooch
    if (fishingSpot.fishes.includes(baitId) && fishingSources[baitId] && fishingSources[baitId].some(s => s.spot === fishingSpot.id)) {
      const fishingSource = fishingSources[baitId].find(s => s.spot === fishingSpot.id);
      return this.getBaitChain(fishingSource.bait, fishingSpot, fishingSources, [...currentChain, {
        id: baitId,
        tug: fishingSource?.tug
      }]);
    }
    // We want the final bait first, let's reverse the array
    return [...currentChain, { id: baitId }].reverse();
  }

  doExtract(itemId: number): any {
    const nodes = this.getItemNodes(itemId);
    const nodeType = nodes.length > 0 ? nodes[0].type : -1;
    let gatheringItem: { level: number, stars: number };
    switch (nodeType) {
      case -10:
        gatheringItem = { stars: 0, level: 1 };
        break;
      case -5:
        gatheringItem = this.fishParameter[itemId];
        break;
      case 4:
        gatheringItem = { stars: 0, level: nodes[0].level };
        break;
      default:
        gatheringItem = Object.values(this.gatheringItems).find(g => g.itemId === itemId);
        break;
    }
    if (!gatheringItem || nodes.length === 0) {
      return null;
    }
    return {
      stars_tooltip: this.generateStars(gatheringItem.stars || 0),
      level: gatheringItem.level,
      nodes: nodes,
      type: nodes.length > 0 ? nodes[0].type : -1
    };
  }

  getDataType(): any {
    // TODO
    return 0;
  }
}
