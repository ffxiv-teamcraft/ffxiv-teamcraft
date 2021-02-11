import { Injectable } from '@angular/core';
import * as fromFreecompanyWorkshop from './freecompany-workshop.reducer';
import * as FreecompanyWorkshopActions from './freecompany-workshop.actions';
import * as FreecompanyWorkshopSelectors from './freecompany-workshop.selectors';
import { select, Store } from '@ngrx/store';
import { Submarine } from '../model/submarine';
import { VesselStats } from '../model/vessel-stats';
import { LazyDataService } from '../../../core/data/lazy-data.service';
import { IpcService } from '../../../core/electron/ipc.service';
import { filter, map, shareReplay, tap, withLatestFrom } from 'rxjs/operators';
import { AirshipTimers, ItemInfo, SubmarineTimers, UpdateInventorySlot } from '../../../model/pcap';
import { VesselType } from '../model/vessel-type';
import { merge } from 'rxjs';
import { ofPacketType } from '../../../core/rxjs/of-packet-type';
import { Airship } from '../model/airship';

@Injectable({
  providedIn: 'root'
})
export class FreecompanyWorkshopFacade {
  public readonly workshops$ = this.store.pipe(
    select(FreecompanyWorkshopSelectors.selectWorkshops),
    shareReplay(1)
  );

  public readonly vesselTimers$ = merge(
    this.ipc.packets$.pipe(
      ofPacketType<AirshipTimers>('airshipTimers'),
      map((packet) => ({
        type: VesselType.AIRSHIP,
        timers: packet.timersList.map((vessel) => ({
          ...vessel,
          destinations: [
            vessel.dest1,
            vessel.dest2,
            vessel.dest3,
            vessel.dest4,
            vessel.dest5
          ].filter((dest) => dest > -1)
        }))
      }))
    ),
    this.ipc.packets$.pipe(
      ofPacketType<SubmarineTimers>('submarineTimers'),
      map((packet) => ({
        type: VesselType.SUBMARINE,
        timers: packet.timersList.map((vessel) => ({
          ...vessel,
          destinations: [
            vessel.dest1,
            vessel.dest2,
            vessel.dest3,
            vessel.dest4,
            vessel.dest5
          ].filter((dest) => dest > 0)
        }))
      }))
    )
  );

  public readonly vesselPartUpdate$ = merge(
    this.ipc.itemInfoPackets$,
    this.ipc.updateInventorySlotPackets$
  ).pipe(
    filter((packet) => this.isAirshipItemInfo(packet) || this.isSubmarineItemInfo(packet))
  );

  public readonly currentFreecompany$ = this.ipc.freecompanyId$.pipe(
    filter((fcId) => fcId !== null),
    shareReplay(1)
  );

  public readonly airshipStatusList$ = this.ipc.airshipStatusListPackets$.pipe(
    withLatestFrom(this.currentFreecompany$),
    map(([airshipStatusList, fcId]): Airship[] => airshipStatusList.statusList.map((airship) => ({
      rank: airship.rank,
      status: airship.status,
      name: airship.name,
      birthdate: airship.birthdate,
      returnTime: airship.returnTime,
      freecompanyId: fcId
    }))),
    shareReplay(1)
  );

  public readonly airshipPartialStatusFromList$ = this.ipc.eventPlay8Packets$.pipe(
    filter((event) => event.eventId === 0xB0102),
    map((event) => event.param1),
    withLatestFrom(this.airshipStatusList$),
    map(([slot, statusList]) => ({ slot: slot, partialStatus: statusList[slot] })),
    shareReplay(1)
  );

  public readonly airshipStatus$ = this.ipc.airshipStatusPackets$.pipe(
    withLatestFrom(this.airshipPartialStatusFromList$),
    map(([airship, statusFromList]): { slot: number, vessel: Airship } => ({
      slot: statusFromList.slot,
      vessel: {
        ...statusFromList.partialStatus,
        capacity: airship.capacity,
        currentExperience: airship.currentExp,
        totalExperienceForNextRank: airship.totalExpForNextRank,
        destinations: [
          airship.dest1,
          airship.dest2,
          airship.dest3,
          airship.dest4,
          airship.dest5
        ].filter((dest) => dest > -1),
        parts: {
          hull: {
            partId: airship.hull
          },
          rigging: {
            partId: airship.rigging
          },
          forecastle: {
            partId: airship.forecastle
          },
          aftcastle: {
            partId: airship.aftcastle
          }
        }
      }
    })),
    shareReplay(1)
  );

  public readonly submarineStatusList$ = this.ipc.submarinesStatusListPackets$.pipe(
    withLatestFrom(this.currentFreecompany$),
    map(([submarineStatusList, fcId]): Submarine[] => submarineStatusList.statusList.map((submarine) => {
      return {
        rank: submarine.rank,
        status: submarine.status,
        name: submarine.name,
        freecompanyId: fcId,
        birthdate: submarine.birthdate,
        returnTime: submarine.returnTime,
        parts: {
          hull: {
            partId: submarine.hull
          },
          stern: {
            partId: submarine.stern
          },
          bow: {
            partId: submarine.bow
          },
          bridge: {
            partId: submarine.bridge
          }
        },
        capacity: submarine.capacity,
        currentExperience: submarine.currentExp,
        totalExperienceForNextRank: submarine.totalExpForNextRank,
        destinations: [
          submarine.dest1,
          submarine.dest2,
          submarine.dest3,
          submarine.dest4,
          submarine.dest5
        ].filter((dest) => dest > 0)
      };
    })),
    shareReplay(1)
  );

  constructor(private readonly lazyData: LazyDataService, private readonly ipc: IpcService,
              private readonly store: Store<fromFreecompanyWorkshop.State>) {
  }

  public isSubmarineItemInfo(itemInfo: ItemInfo | UpdateInventorySlot): boolean {
    return itemInfo.containerId === 25004 && itemInfo.slot <= 18;
  }

  public isAirshipItemInfo(itemInfo: ItemInfo | UpdateInventorySlot): boolean {
    return itemInfo.containerId === 25003 && itemInfo.slot >= 30 && itemInfo.slot <= 48;
  }

  public load(): void {
    this.store.dispatch(FreecompanyWorkshopActions.readFromFile());
  }

  public setCurrentFreecompanyId(id: string) {
    this.store.dispatch(FreecompanyWorkshopActions.setFreecompanyId({ id }));
  }

  public importFromPcap(): void {
    this.store.dispatch(FreecompanyWorkshopActions.importFromPcap());
  }

  public getVesselPartCondition(itemInfo: ItemInfo | UpdateInventorySlot): { type: VesselType, vesselSlot: number, partSlot: number, condition: number } {
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

  public updateVesselPartCondition(packet: ItemInfo | UpdateInventorySlot): void {
    const partUpdate = this.getVesselPartCondition(packet);
    this.store.dispatch(FreecompanyWorkshopActions.updateVesselPart({ vesselPartUpdate: partUpdate }));
  }

  public updateVesselTimers(data): void {
    this.store.dispatch(FreecompanyWorkshopActions.updateVesselTimers({
      vesselTimersUpdate: {
        type: data.type,
        timers: data.timers
      }
    }));
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

  public getVesselPartSlotName(slot: number): string {
    switch (slot) {
      // Submersible
      case 0:
      case 5:
      case 10:
      case 15:
        return 'hull';
      case 1:
      case 6:
      case 11:
      case 16:
        return 'stern';
      case 2:
      case 7:
      case 12:
      case 17:
        return 'bow';
      case 3:
      case 8:
      case 13:
      case 18:
        return 'bow';
      // Airship
      case 30:
      case 35:
      case 40:
      case 45:
        return 'hull';
      case 31:
      case 36:
      case 41:
      case 46:
        return 'rigging';
      case 32:
      case 37:
      case 42:
      case 47:
        return 'forecastle';
      case 33:
      case 38:
      case 43:
      case 48:
        return 'aftcastle';
    }
    return null;
  }
}
