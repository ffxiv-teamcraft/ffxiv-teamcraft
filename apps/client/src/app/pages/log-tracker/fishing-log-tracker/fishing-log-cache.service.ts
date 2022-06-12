import { Injectable } from '@angular/core';
import { map, shareReplay, startWith } from 'rxjs/operators';
import { combineLatest } from 'rxjs';
import { AuthFacade } from '../../../+state/auth.facade';
import { GarlandToolsService } from '../../../core/api/garland-tools.service';
import { fshSpearLogOrder } from '../fsh-spear-log-order';
import { fshLogOrder } from '../fsh-log-order';
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
          area.spots = area.spots
            .sort((a, b) => {
              const logOrder = (displayIndex === 1) ? fshSpearLogOrder : fshLogOrder;
              const a_name = places[a.placeId].en;
              const b_name = places[b.placeId].en;
              if (logOrder.includes(a_name) && logOrder.includes(b_name)) {
                return logOrder.indexOf(a_name) - logOrder.indexOf(b_name);
              } else {
                return a.placeId - b.placeId;
              }
            });
          area.total = uniqueMapTotal.length;
          area.done = uniqueMapDone.length;
        });
        display.tabs = display.tabs
          .sort((a, b) => {
            const logOrder = (displayIndex === 1) ? fshSpearLogOrder : fshLogOrder;
            const a_name = places[a.placeId].en;
            const b_name = places[b.placeId].en;
            if (logOrder.includes(a_name) && logOrder.includes(b_name)) {
              return logOrder.indexOf(a_name) - logOrder.indexOf(b_name);
            } else {
              return a.placeId - b.placeId;
            }
          });
        display.total = uniqueDisplayTotal.length;
        display.done = uniqueDisplayDone.length;
        return display;
      });
    }),
    shareReplay(1)
  );

  constructor(private authFacade: AuthFacade, private gt: GarlandToolsService, private lazyData: LazyDataFacade) {
  }

}
