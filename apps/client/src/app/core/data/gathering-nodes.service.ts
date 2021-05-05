import { Injectable } from '@angular/core';
import { GarlandToolsService } from '../api/garland-tools.service';
import { LazyDataService } from './lazy-data.service';
import { GatheringNode } from './model/gathering-node';
import { getItemSource } from '../../modules/list/model/list-row';
import { DataType } from '../../modules/list/data/data-type';
import { LocalizedDataService } from './localized-data.service';

@Injectable({
  providedIn: 'root'
})
export class GatheringNodesService {

  private minBtnSpearNodes: GatheringNode[];

  constructor(private gtData: GarlandToolsService, private lazyData: LazyDataService,
              private l12n: LocalizedDataService) {
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

    const fishingSpots = this.lazyData.data.fishingSpots;

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
        // If it's spearfishing, add gig
        if (node.type === 4) {
          const spearfishingNode = this.lazyData.data.spearFishingNodes.find(sNode => sNode.itemId === id);
          if (spearfishingNode) {
            node.gig = spearfishingNode.gig;
            if (spearfishingNode.weather) {
              node.limited = true;
              node.weathers = spearfishingNode.weather.map(w => this.l12n.getWeatherId(w));
            }
            if (spearfishingNode.transition) {
              node.weathersFrom = spearfishingNode.transition.map(w => this.l12n.getWeatherId(w));
            }
            if (spearfishingNode.duration) {
              node.limited = true;
              node.spawns = [spearfishingNode.spawn];
              node.duration = spearfishingNode.duration;
              // Just in case it despawns the day after.
              node.duration = node.duration < 0 ? node.duration + 24 : node.duration;
              // As uptimes are always in minutes, gotta convert to minutes here too.
              node.duration *= 60;
            }
            if (spearfishingNode.predator) {
              node.predators = spearfishingNode.predator.map(predator => {
                const predatorItemId = +Object.keys(this.lazyData.data.items).find(key => this.lazyData.data.items[key].en === predator.name);
                return {
                  id: predatorItemId,
                  amount: predator.predatorAmount
                };
              });
            }
          }
        }
        return node;
      });

      const fishingSpotMatches: GatheringNode[] = fishingSpots.filter(spot => {
        return spot.fishes.includes(id);
      }).map(spot => this.fishingSpotToGatheringNode(spot, id));

      return [...minBtnSpearHiddenMatches, ...fishingSpotMatches]
        .map(node => {
          return { ...node, matchingItemId: id };
        });
    });

    return results.flat();
  }

  private fishingSpotToGatheringNode(spot: any, itemId: number): GatheringNode {
    const gtSpots = this.gtData.getFishingSpots(itemId);
    const gtFish = gtSpots.find(s => {
      return s.spot === spot.id;
    }) || gtSpots[0];
    const fishParameter = this.lazyData.data.fishParameter[itemId];
    const node: GatheringNode = {
      id: spot.id,
      items: spot.fishes,
      limited: false,
      level: spot.level,
      type: -5,
      legendary: false,
      ephemeral: false,
      zoneId: spot.zoneId,
      map: spot.mapId,
      x: spot.coords?.x,
      y: spot.coords?.y,
      // TODO proper Z coord for fishing spots
      z: 0
    };

    if (fishParameter?.folklore) {
      node.folklore = fishParameter.folklore;
    }

    if (gtFish) {
      if (gtFish.during) {
        node.limited = true;
        node.spawns = [gtFish.during.start];
        node.duration = gtFish.during.end - gtFish.during.start;
        // Just in case it despawns the day after.
        node.duration = node.duration < 0 ? node.duration + 24 : node.duration;
        // As durations are always in minutes, gotta convert to minutes here too.
        node.duration *= 60;
      }
      if (gtFish.predator) {
        node.predators = gtFish.predator.map(predator => {
          return {
            id: predator.id,
            amount: predator.predatorAmount
          };
        });
      }

      if (gtFish.hookset) {
        node.hookset = gtFish.hookset.split(' ')[0].toLowerCase() as 'powerful' | 'precision';
      }

      node.baits = gtFish.bait.map(bait => {
        const baitData = this.gtData.getBait(bait);
        return baitData.id;
      });
      if (gtFish.weather) {
        node.limited = true;
        node.weathers = gtFish.weather.map(w => this.l12n.getWeatherId(w));
      }
      if (gtFish.transition) {
        node.weathersFrom = gtFish.transition.map(w => this.l12n.getWeatherId(w));
      }
    }

    return node;
  }
}
