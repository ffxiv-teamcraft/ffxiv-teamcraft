import { Injectable } from '@angular/core';
import { map, shareReplay, startWith } from 'rxjs/operators';
import { combineLatest } from 'rxjs';
import { AuthFacade } from '../../../+state/auth.facade';
import { GarlandToolsService } from '../../../core/api/garland-tools.service';
import { fshSpearLogAreas } from '../fsh-spear-log-order';
import { fshLogAreas } from '../fsh-log-order';
import { LazyDataFacade } from '../../../lazy-data/+state/lazy-data.facade';

@Injectable({
  providedIn: 'root'
})
export class FishingLogCacheService {

  private completion$ = this.authFacade.logTracking$.pipe(
    map(logTracking => logTracking.gathering),
    startWith([])
  );

  public display$ = combineLatest([this.lazyData.getEntry('fishingLogTrackerPageData'), this.completion$, this.lazyData.getEntry('places')]).pipe(
    map(([completeDisplay, completion, places]) => {
      return completeDisplay.map((display, displayIndex) => {
        const areaLogOrder = (displayIndex === 0) ? fshLogAreas : fshSpearLogAreas;
        const uniqueDisplayDone = [];
        const uniqueDisplayTotal = [];
        display.tabs.forEach(area => {
          const uniqueMapDone = [];
          const uniqueMapTotal = [];
          area.spots.forEach(spot => {
            const uniqueSpotDone = [];
            const uniqueSpotTotal = [];
            spot.fishes.forEach(fish => {
              (fish as any).done = completion.indexOf(fish.itemId) > -1;
              if (uniqueMapTotal.indexOf(fish.itemId) === -1) {
                uniqueMapTotal.push(fish.itemId);
              }
              if (uniqueDisplayTotal.indexOf(fish.itemId) === -1) {
                uniqueDisplayTotal.push(fish.itemId);
              }
              if (uniqueSpotTotal.indexOf(fish.itemId) === -1) {
                uniqueSpotTotal.push(fish.itemId);
              }
              if ((fish as any).done) {
                if (uniqueDisplayDone.indexOf(fish.itemId) === -1) {
                  uniqueDisplayDone.push(fish.itemId);
                }
                if (uniqueMapDone.indexOf(fish.itemId) === -1) {
                  uniqueMapDone.push(fish.itemId);
                }
                if (uniqueSpotDone.indexOf(fish.itemId) === -1) {
                  uniqueSpotDone.push(fish.itemId);
                }
              }
            });
            spot.total = uniqueSpotTotal.length;
            spot.done = uniqueSpotDone.length;
          });
          const areaName = places[area.placeId].en;
          const spotNames = areaLogOrder.find(e => e.areaName === areaName)?.spotNames;
          area.spots = area.spots
            .sort((a, b) => {
              const a_name = places[a.placeId].en;
              const b_name = places[b.placeId].en;
              if (spotNames?.includes(a_name) && spotNames?.includes(b_name)) {
                return spotNames.indexOf(a_name) - spotNames.indexOf(b_name);
              } else {
                return a.placeId - b.placeId;
              }
            });
          area.total = uniqueMapTotal.length;
          area.done = uniqueMapDone.length;
        });
        const areaNames = areaLogOrder.map(e => e.areaName);
        display.tabs = display.tabs
          .sort((a, b) => {
            const a_name = places[a.placeId].en;
            const b_name = places[b.placeId].en;
            if (areaNames.includes(a_name) && areaNames.includes(b_name)) {
              return areaNames.indexOf(a_name) - areaNames.indexOf(b_name);
            } else {
              return a.placeId - b.placeId;
            }
          });
        display.total = uniqueDisplayTotal.length;
        display.done = uniqueDisplayDone.length;
        return display;
      });
    }),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  constructor(private authFacade: AuthFacade, private gt: GarlandToolsService, private lazyData: LazyDataFacade) {
  }

}
