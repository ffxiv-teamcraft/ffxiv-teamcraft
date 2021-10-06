import { Injectable } from '@angular/core';
import { GarlandToolsService } from '../api/garland-tools.service';
import { LazyDataService } from './lazy-data.service';
import { GatheringNode } from './model/gathering-node';
import { getItemSource } from '../../modules/list/model/list-row';
import { DataType } from '../../modules/list/data/data-type';
import { FishingBait } from './model/fishing-bait';

@Injectable({
  providedIn: 'root'
})
export class GatheringNodesService {

  private minBtnSpearNodes: GatheringNode[];

  constructor(private gtData: GarlandToolsService, private lazyData: LazyDataService) {
  }

  public getItemNodes(itemId: number, onlyDirectGathering = false): GatheringNode[] {
    if (!this.minBtnSpearNodes) {
      this.minBtnSpearNodes = Object.entries<any>(this.lazyData.data.nodes)
        .map(([key, value]) => {
          const res = {
            ...value,
            id: +key,
            zoneId: value.zoneid
          };
          delete res.zoneid;
          return res;
        });
    }
    const idsToConsider = [itemId];
    if (!onlyDirectGathering) {
      const extract = this.lazyData.getExtract(itemId);
      if (extract) {
        const reductions = getItemSource(extract, DataType.REDUCED_FROM);
        idsToConsider.push(...reductions);
      }
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
      }))].filter(node => node.type !== 4);

      const fishingSpotMatches: GatheringNode[] = (this.lazyData.data.fishingSources[id] || []).map(entry => {
        const spot = this.lazyData.data.fishingSpots.find(s => s.id === entry.spot);
        const fishParameter = this.lazyData.data.fishParameter[id];
        if (fishParameter) {
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
            z: spot.coords?.z,

            predators: entry.predators,
            spawns: [entry.spawn].filter(s => s !== undefined && s !== null),
            duration: (entry.duration || 0) * 60,
            weathers: entry.weathers,
            weathersFrom: entry.weathersFrom,
            limited: entry.spawn !== undefined || entry.weathers?.length > 0,
            folklore: fishParameter.folklore,
            hookset: entry.hookset,
            tug: entry.tug,
            snagging: entry.snagging,
            baits: this.getBaitChain(entry.bait, spot),
            oceanFishingTime: entry.oceanFishingTime || null
          } as GatheringNode;
        }
      }).filter(node => !!node);

      const spearFishingMatches = (this.lazyData.data.spearfishingSources[id] || []).map(entry => {
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
            weathers: entry.weathers,
            weathersFrom: entry.weathersFrom,
            limited: entry.spawns?.length > 0 || entry.weathers?.length > 0,
            gig: entry.gig
          } as GatheringNode;
        }
      });

      return [...minBtnSpearHiddenMatches, ...fishingSpotMatches, ...spearFishingMatches]
        .map(node => {
          return { ...node, matchingItemId: id };
        });
    });

    return results.flat();
  }

  private getBaitChain(baitId: number, fishingSpot: any, currentChain: FishingBait[] = []): FishingBait[] {
    // If it's a mooch
    if (fishingSpot.fishes.includes(baitId)) {
      const fishingSource = this.lazyData.data.fishingSources[baitId].find(s => s.spot === fishingSpot.id);
      return this.getBaitChain(fishingSource.bait, fishingSpot, [...currentChain, {
        id: baitId,
        tug: fishingSource?.tug
      }]);
    }
    // We want the final bait first, let's reverse the array
    return [...currentChain, { id: baitId }].reverse();
  }
}
