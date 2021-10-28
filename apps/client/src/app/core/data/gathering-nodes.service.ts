import { Injectable } from '@angular/core';
import { GarlandToolsService } from '../api/garland-tools.service';
import { GatheringNode } from './model/gathering-node';
import { getItemSource } from '../../modules/list/model/list-row';
import { DataType } from '../../modules/list/data/data-type';
import { FishingBait } from './model/fishing-bait';
import { combineLatest, Observable, of } from 'rxjs';
import { LazyDataFacade } from '../../lazy-data/+state/lazy-data.facade';
import { map } from 'rxjs/operators';
import { LazyFishingSpot } from '../../lazy-data/model/lazy-fishing-spot';
import { LazyData } from '../../lazy-data/lazy-data';

@Injectable({
  providedIn: 'root'
})
export class GatheringNodesService {

  constructor(private gtData: GarlandToolsService, private lazyData: LazyDataFacade) {
  }

  public getItemNodes(itemId: number, onlyDirectGathering = false): Observable<GatheringNode[]> {
    let idsToConsider$ = of([itemId]);
    if (!onlyDirectGathering) {
      idsToConsider$ = this.lazyData.getRow('extracts', itemId).pipe(
        map(extract => {
          if (extract) {
            const reductions = getItemSource(extract, DataType.REDUCED_FROM);
            return [itemId, ...reductions];
          }
          return [itemId];
        })
      );
    }
    return combineLatest([
      idsToConsider$,
      this.lazyData.getMinBtnSpearNodesIndex(),
      this.lazyData.getEntry('spearfishingSources'),
      this.lazyData.getEntry('fishingSources'),
      this.lazyData.getEntry('fishingSpots'),
      this.lazyData.getEntry('fishParameter')
    ]).pipe(
      map(([idsToConsider, minBtnSpearNodes, spearfishingSources, fishingSources, fishingSpots, fishParameter]) => {
        const results: GatheringNode[][] = idsToConsider.map(id => {
          const minBtnSpearMatches: GatheringNode[] = minBtnSpearNodes.filter(node => {
            return node.items.includes(id) && node.zoneId > 0;
          });

          const hiddenReferences = minBtnSpearNodes.filter(node => {
            return (node.hiddenItems || []).includes(id) && node.zoneId > 0;
          });

          const minBtnSpearHiddenMatches: GatheringNode[] = [...minBtnSpearMatches, ...hiddenReferences.map(node => ({
            ...node,
            matchingItemIsHidden: true
          }))].filter(node => node.type !== 4);

          const fishingSpotMatches: GatheringNode[] = (fishingSources[id] || []).map(entry => {
            const spot = fishingSpots.find(s => s.id === entry.spot);
            const fishParameterEntry = fishParameter[id];
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
                baits: this.getBaitChain(entry.bait, spot, fishingSources),
                oceanFishingTime: entry.oceanFishingTime || null
              } as GatheringNode;
            }
          }).filter(node => !!node);

          const spearFishingMatches = (spearfishingSources[id] || []).map(entry => {
            const spot = minBtnSpearNodes.find(n => n.items.includes(id));
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
      })
    );
  }

  private getBaitChain(baitId: number, fishingSpot: LazyFishingSpot, fishingSources: LazyData['fishingSources'], currentChain: FishingBait[] = []): FishingBait[] {
    // If it's a mooch
    if (fishingSpot.fishes.includes(baitId)) {
      const fishingSource = fishingSources[baitId].find(s => s.spot === fishingSpot.id);
      return this.getBaitChain(fishingSource.bait, fishingSpot, fishingSources, [...currentChain, {
        id: baitId,
        tug: fishingSource?.tug
      }]);
    }
    // We want the final bait first, let's reverse the array
    return [...currentChain, { id: baitId }].reverse();
  }
}
