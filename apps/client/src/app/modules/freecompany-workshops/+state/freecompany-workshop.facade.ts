import { Injectable } from '@angular/core';
import * as fromFreecompanyWorkshop from './freecompany-workshop.reducer';
import * as FreecompanyWorkshopActions from './freecompany-workshop.actions';
import * as FreecompanyWorkshopSelectors from './freecompany-workshop.selectors';
import { select, Store } from '@ngrx/store';
import { Submarine } from '../model/submarine';
import { VesselStats } from '../model/vessel-stats';
import { LazyDataService } from '../../../core/data/lazy-data.service';
import { IpcService } from '../../../core/electron/ipc.service';
import { filter, tap } from 'rxjs/operators';
import { ItemInfo } from '../../../model/pcap';
import { VesselType } from '../model/vessel-type';

@Injectable({
  providedIn: 'root'
})
export class FreecompanyWorkshopFacade {
  public readonly workshops$ = this.store.pipe(
    select(FreecompanyWorkshopSelectors.selectWorkshops)
  );

  public readonly vesselItemInfo$ = this.ipc.itemInfoPackets$.pipe(
    filter((packet) => this.isAirshipItemInfo(packet) || this.isSubmarineItemInfo(packet))
  );

  constructor(private readonly lazyData: LazyDataService, private readonly ipc: IpcService,
              private readonly store: Store<fromFreecompanyWorkshop.State>) {
  }

  public isSubmarineItemInfo(itemInfo: ItemInfo): boolean {
    return itemInfo.containerId === 25004 && itemInfo.slot <= 18;
  }

  public isAirshipItemInfo(itemInfo: ItemInfo): boolean {
    return itemInfo.containerId === 25003 && itemInfo.slot >= 30 && itemInfo.slot <= 48;
  }

  public load(): void {
    this.store.dispatch(FreecompanyWorkshopActions.readFromFile());
  }

  public importFromPcap(): void {
    this.store.dispatch(FreecompanyWorkshopActions.importFromPcap());
  }

  public getVesselPartCondition(itemInfo: ItemInfo): { type: VesselType, vesselSlot: number, partSlot: number, condition: number } {
    const partCondition: any = {
      condition: itemInfo.condition
    };

    const airshipSlots = [
        [30, 31, 32, 33], // hull
        [35, 36, 37, 38], // rigging
        [40, 41, 42, 43], // forecastle
        [45, 46, 47, 48] // aftcastle
      ];
      const submarineSlots = [
        [0, 1, 2, 3], // hull
        [5, 6, 7, 8], // stern
        [10, 11, 12, 13], // bow
        [15, 16, 17, 18] // bridge
    ];

    if (itemInfo.containerId === 25003) {
      partCondition.type = VesselType.AIRSHIP;
      for (let i = 0; i < 4; i++) {
        if (airshipSlots[i].includes(itemInfo.slot)) {
          partCondition.vesselSlot = i;
          partCondition.partSlot = airshipSlots[i].indexOf(itemInfo.slot);
          break;
        }
      }
    } else if (itemInfo.containerId === 25004) {
      partCondition.type = VesselType.SUBMARINE;
      for (let i = 0; i < 4; i++) {
        if (submarineSlots[i].includes(itemInfo.slot)) {
          partCondition.vesselSlot = i;
          partCondition.partSlot = submarineSlots[i].indexOf(itemInfo.slot);
          break;
        }
      }
    }

    return partCondition.type !== undefined ? partCondition : null;
  }

  public getRemainingTime(unixTimestamp) {
    return unixTimestamp - Math.floor(Date.now() / 1000);
  }

  public getSubmarineBuild(submarine: Submarine) {
    return {
      hull: this.lazyData.data.submarineParts[submarine.parts.hull.partId],
      stern: this.lazyData.data.submarineParts[submarine.parts.stern.partId],
      bow: this.lazyData.data.submarineParts[submarine.parts.bow.partId],
      bridge: this.lazyData.data.submarineParts[submarine.parts.bridge.partId]
    };
  }

  public getSubmarineStats(submarine: Submarine): VesselStats {
    const hull = this.lazyData.data.submarineParts[submarine.parts.hull.partId];
    const stern = this.lazyData.data.submarineParts[submarine.parts.stern.partId];
    const bow = this.lazyData.data.submarineParts[submarine.parts.bow.partId];
    const bridge = this.lazyData.data.submarineParts[submarine.parts.bridge.partId];
    return {
      surveillance: this.sumStat('surveillance', submarine.rank, hull, stern, bow, bridge),
      retrieval: this.sumStat('retrieval', submarine.rank, hull, stern, bow, bridge),
      speed: this.sumStat('speed', submarine.rank, hull, stern, bow, bridge),
      range: this.sumStat('range', submarine.rank, hull, stern, bow, bridge),
      favor: this.sumStat('favor', submarine.rank, hull, stern, bow, bridge)
    };
  }

  public sumStat(statName: 'surveillance' | 'retrieval' | 'speed' | 'range' | 'favor', rank, ...parts) {
    return rank[statName] + parts.reduce((a, b) => a[statName] + b[statName]);
  }
}
