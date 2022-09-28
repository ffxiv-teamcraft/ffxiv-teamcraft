import { Injectable } from '@angular/core';
import * as fromFreeCompanyWorkshop from './freecompany-workshop.reducer';
import * as FreeCompanyWorkshopActions from './free-company-workshop.actions';
import * as FreeCompanyWorkshopSelectors from './freecompany-workshop.selectors';
import { select, Store } from '@ngrx/store';
import { Submarine } from '../model/submarine';
import { VesselStats } from '../model/vessel-stats';
import { IpcService } from '../../../core/electron/ipc.service';
import { filter, map, shareReplay, startWith, switchMap, withLatestFrom } from 'rxjs/operators';
import { VesselType } from '../model/vessel-type';
import { BehaviorSubject, combineLatest, EMPTY, interval, merge, Observable, of } from 'rxjs';
import { Airship } from '../model/airship';
import { VesselTimersUpdate } from '../model/vessel-timers-update';
import { Memoized } from '../../../core/decorators/memoized';
import { AirshipPartClass } from '../model/airship-part-class';
import { SubmarinePartClass } from '../model/submarine-part-class';
import { TranslateService } from '@ngx-translate/core';
import { I18nToolsService } from '../../../core/tools/i18n-tools.service';
import { AirshipPartType } from '../model/airship-part-type';
import { SubmarinePartType } from '../model/submarine-part-type';
import { VesselPartUpdate } from '../model/vessel-part-update';
import { VesselPart } from '../model/vessel-part';
import { SectorExploration } from '../model/sector-exploration';
import { VesselProgressionStatusUpdate } from '../model/vessel-progression-status-update';
import { SettingsService } from '../../settings/settings.service';
import { FreeCompanyWorkshop } from '../model/free-company-workshop';
import { ofMessageType } from '../../../core/rxjs/of-message-type';
import { toIpcData } from '../../../core/rxjs/to-ipc-data';
import { ItemInfo, UpdateInventorySlot } from '@ffxiv-teamcraft/pcap-ffxiv';
import { SoundNotificationService } from '../../../core/sound-notification/sound-notification.service';
import { SoundNotificationType } from '../../../core/sound-notification/sound-notification-type';
import { LazyDataFacade } from '../../../lazy-data/+state/lazy-data.facade';
import { safeCombineLatest } from '../../../core/rxjs/safe-combine-latest';

@Injectable({
  providedIn: 'root'
})
export class FreeCompanyWorkshopFacade {
  public readonly workshops$ = this.store.pipe(
    select(FreeCompanyWorkshopSelectors.selectWorkshops)
  );

  public readonly currentWorkshop$ = this.store.pipe(
    select(FreeCompanyWorkshopSelectors.selectCurrentWorkshop)
  );

  public readonly currentFreecompany$ = this.store.pipe(
    select(FreeCompanyWorkshopSelectors.selectCurrentFreeCompanyId)
  );

  public readonly vesselTimers$ = merge(
    this.ipc.packets$.pipe(
      ofMessageType('airshipTimers'),
      toIpcData(),
      map((packet) => ({
        type: VesselType.AIRSHIP,
        timers: packet.timers.map((vessel) => ({
          ...vessel,
          destinations: [
            vessel.dest1,
            vessel.dest2,
            vessel.dest3,
            vessel.dest4,
            vessel.dest5
          ].filter((dest) => (vessel.returnTime > 0 && dest > -1 && dest < 128))
        }))
      }))
    ),
    this.ipc.packets$.pipe(
      ofMessageType('submarineTimers'),
      toIpcData(),
      map((packet) => ({
        type: VesselType.SUBMARINE,
        timers: packet.timers.map((vessel) => ({
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

  public readonly vesselParts = new BehaviorSubject<Record<VesselType, Record<string, keyof Pick<Airship, 'parts'>>> | Record<VesselType, keyof Record<string, Pick<Submarine, 'parts'>>>>({
    [VesselType.AIRSHIP]: {},
    [VesselType.SUBMARINE]: {}
  });

  public readonly airshipStatusList$ = this.ipc.airshipStatusListPackets$.pipe(
    withLatestFrom(this.currentFreecompany$),
    map(([airshipStatusList, fcId]): Airship[] => airshipStatusList.statusList.map((airship, i) => ({
      vesselType: VesselType.AIRSHIP,
      rank: airship.rank,
      status: airship.status,
      name: FreeCompanyWorkshopFacade.ISOtoUTF8(airship.name),
      birthdate: airship.birthdate,
      returnTime: airship.returnTime,
      freeCompanyId: fcId,
      parts: this.vesselParts.getValue()[VesselType.AIRSHIP][i]
    })))
  );

  public readonly airshipPartialStatusFromList$ = this.ipc.eventPlay8Packets$.pipe(
    filter((event) => event.eventId === 0xB0102),
    map((event) => event.params[0]),
    withLatestFrom(this.airshipStatusList$),
    map(([slot, statusList]) => ({ slot: slot, partialStatus: statusList[slot] }))
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
        ].filter((dest) => dest > -1)
      }
    }))
  );

  public readonly vesselProgressionStatus$ = merge(
    this.ipc.airshipStatusListPackets$.pipe(
      map((packet) => ({
        type: VesselType.AIRSHIP,
        sectorsProgression: FreeCompanyWorkshopFacade.toSectorsProgression(packet.unlockedSectors, packet.exploredSectors)
      }))
    ),
    this.ipc.airshipStatusPackets$.pipe(
      map((packet) => ({
        type: VesselType.AIRSHIP,
        sectorsProgression: FreeCompanyWorkshopFacade.toSectorsProgression(packet.unlockedSectors, packet.exploredSectors)
      }))
    ),
    this.ipc.submarineProgressionStatusPackets$.pipe(
      map((packet) => ({
        type: VesselType.SUBMARINE,
        sectorsProgression: FreeCompanyWorkshopFacade.toSectorsProgression(packet.unlockedSectors, packet.exploredSectors)
      }))
    )
  );

  public readonly submarineStatusList$ = this.ipc.submarinesStatusListPackets$.pipe(
    withLatestFrom(this.currentFreecompany$),
    map(([submarineStatusList, fcId]): Submarine[] => submarineStatusList.statusList.map((submarine, i) => {
      return {
        vesselType: VesselType.SUBMARINE,
        rank: submarine.rank,
        status: submarine.status,
        name: FreeCompanyWorkshopFacade.ISOtoUTF8(submarine.name),
        freeCompanyId: fcId,
        birthdate: submarine.birthdate,
        returnTime: submarine.returnTime,
        parts: { ...this.vesselParts.getValue()[VesselType.SUBMARINE][i] },
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
    }))
  );

  public vesselVoyageAlarms$ = this.settings.settingsChange$.pipe(
    filter(change => change === 'vesselVoyageAlarms'),
    startWith(this.settings.vesselVoyageAlarms),
    switchMap(() => {
      if (!this.settings.vesselVoyageAlarms) {
        return EMPTY;
      } else {
        return combineLatest([
          interval(1000).pipe(map(() => Math.floor(Date.now() / 1000))),
          this.workshops$
        ]);
      }
    }),
    map(([now, workshops]) => {
      return Object.values<FreeCompanyWorkshop>(workshops)
        .map((workshop) => ([
          ...workshop.airships.slots.filter((vessel) => vessel).map((vessel) => ({
            ...vessel,
            server: workshop.server,
            fcName: workshop.name,
            fcTag: workshop.tag
          })),
          ...workshop.submarines.slots.filter((vessel) => vessel).map((vessel) => ({
            ...vessel,
            server: workshop.server,
            fcName: workshop.name,
            fcTag: workshop.tag
          }))
        ]))
        .reduce((a, b) => a.concat(b), [])
        .filter((vessel) => vessel.returnTime === now);
    })
  );

  constructor(private readonly lazyData: LazyDataFacade, private readonly ipc: IpcService,
              private readonly store: Store<fromFreeCompanyWorkshop.State>, private readonly translate: TranslateService,
              private readonly i18n: I18nToolsService,
              private readonly settings: SettingsService, private soundNotificationService: SoundNotificationService) {
  }

  private static ISOtoUTF8(input: string): string {
    return input.replace(/Ã©/gmi, 'é')
      .replace(/Ã©/gmi, 'é')
      .replace(/Ã¨/gmi, 'è')
      .replace(/Ã /gmi, 'à')
      .replace(/Ã¯/gmi, 'ï')
      .replace(/Ã´/gmi, 'ô')
      .replace(/Ã§/gmi, 'ç')
      .replace(/Ãª/gmi, 'ê')
      .replace(/Ã¹/gmi, 'ù')
      .replace(/Ã¦/gmi, 'æ')
      .replace(/Å/gmi, 'œ')
      .replace(/Ã«/gmi, 'ë')
      .replace(/Ã¼/gmi, 'ü')
      .replace(/Ã¢/gmi, 'â')
      .replace(/â¬/gmi, '€')
      .replace(/Â©/gmi, '©')
      .replace(/Â¤/gmi, '¤');
  }

  private static toSectorsProgression(unlockedSectors: boolean[], exploredSectors: boolean[]): Record<string, SectorExploration> {
    const sectorsProgression: Record<string, SectorExploration> = {};
    for (let i = 0; i < unlockedSectors.length; i++) {
      sectorsProgression[i] = {
        id: i,
        unlocked: unlockedSectors[i],
        explored: exploredSectors[i]
      };
    }
    return sectorsProgression;
  }

  public init() {
    this.load();
    this.setupVoyageAlarms();
  }

  public setupVoyageAlarms() {
    this.vesselVoyageAlarms$.subscribe((vessels) => {
      if (vessels.length > 0) {
        this.soundNotificationService.play(SoundNotificationType.VOYAGE);
      }
      vessels.forEach(vessel => {
        this.ipc.send('notification', {
          title: this.translate.instant('VOYAGE_TRACKER.Voyage_completed_notification_title', {
            name: vessel.name
          }),
          content: this.translate.instant('VOYAGE_TRACKER.Voyage_completed_notification_content', {
            server: vessel.server,
            freeCompanyTag: vessel.fcTag,
            freeCompanyName: vessel.fcName
          })
        });
      });
    });
  }

  public isSubmarineItemInfo(itemInfo: ItemInfo | UpdateInventorySlot): boolean {
    return itemInfo.containerId === 25004 && itemInfo.slot <= 18;
  }

  public isAirshipItemInfo(itemInfo: ItemInfo | UpdateInventorySlot): boolean {
    return itemInfo.containerId === 25003 && itemInfo.slot >= 30 && itemInfo.slot <= 48;
  }

  public load(): void {
    this.store.dispatch(FreeCompanyWorkshopActions.readFromFile());
  }

  public setCurrentFreeCompanyId(id: string): void {
    this.store.dispatch(FreeCompanyWorkshopActions.setFreeCompanyId({ id }));
  }

  public importFromPcap(): void {
    this.store.dispatch(FreeCompanyWorkshopActions.importFromPcap());
  }

  public updateAirshipStatus(slot: number, vessel: Airship): void {
    this.store.dispatch(FreeCompanyWorkshopActions.updateAirshipStatus({ slot, vessel }));
  }

  public updateAirshipStatusList(vessels: Airship[]): void {
    this.store.dispatch(FreeCompanyWorkshopActions.updateAirshipStatusList({ vessels }));
  }

  public updateSubmarineStatusList(vessels: Submarine[]): void {
    this.store.dispatch(FreeCompanyWorkshopActions.updateSubmarineStatusList({ vessels }));
  }

  public deleteWorkshop(id: string): void {
    this.store.dispatch(FreeCompanyWorkshopActions.deleteFreeCompanyWorkshop({ id }));
  }

  public updateVesselParts(packet: ItemInfo | UpdateInventorySlot): void {
    this.getVesselPartCondition(packet)
      .subscribe(partUpdate => {
        const newState = { ...this.vesselParts.getValue() };
        if (!newState[partUpdate.type][partUpdate.vesselSlot]) {
          newState[partUpdate.type][partUpdate.vesselSlot] = {};
        }
        if (!newState[partUpdate.type][partUpdate.vesselSlot][partUpdate.partSlot]) {
          newState[partUpdate.type][partUpdate.vesselSlot][partUpdate.partSlot] = {};
        }
        newState[partUpdate.type][partUpdate.vesselSlot][partUpdate.partSlot] = { partId: partUpdate.partId, condition: partUpdate.condition };
        this.vesselParts.next(newState);
        this.store.dispatch(FreeCompanyWorkshopActions.updateVesselPart({ vesselPartUpdate: partUpdate }));
      });
  }

  public updateVesselTimers(data: VesselTimersUpdate): void {
    this.store.dispatch(FreeCompanyWorkshopActions.updateVesselTimers({
      vesselTimersUpdate: {
        type: data.type,
        timers: data.timers
      }
    }));
  }

  public updateVesselProgressionStatus(data: VesselProgressionStatusUpdate): void {
    this.store.dispatch(FreeCompanyWorkshopActions.updateVesselProgressionStatus({
      vesselProgressionStatusUpdate: {
        type: data.type,
        sectorsProgression: data.sectorsProgression
      }
    }));
  }

  public getVesselPartCondition(itemInfo: ItemInfo | UpdateInventorySlot): Observable<VesselPartUpdate> {
    const partUpdate: VesselPartUpdate = {
      type: null,
      partId: null,
      partSlot: null,
      vesselSlot: null,
      condition: itemInfo.condition
    };

    return combineLatest([
      this.lazyData.getEntry('airshipParts'),
      this.lazyData.getEntry('submarineParts')
    ]).pipe(
      map(([airshipParts, submarineParts]) => {
        if (itemInfo.containerId === 25003) {
          partUpdate.type = VesselType.AIRSHIP;
          partUpdate.partId = +Object.keys(airshipParts).find((id) => airshipParts[id].itemId === itemInfo.catalogId);
        } else if (itemInfo.containerId === 25004) {
          partUpdate.type = VesselType.SUBMARINE;
          partUpdate.partId = +Object.keys(submarineParts).find((id) => submarineParts[id].itemId === itemInfo.catalogId);
        }

        partUpdate.vesselSlot = this.getVesselSlotByContainerSlot(itemInfo.slot);
        partUpdate.partSlot = this.getVesselPartSlotByContainerSlot(itemInfo.slot);

        return partUpdate.type !== null ? partUpdate : null;
      })
    );
  }

  public getRemainingTime(unixTimestamp): number {
    return unixTimestamp - Math.floor(Date.now() / 1000);
  }

  getVesselBuild(type: VesselType, rank: number, parts: Record<string, VesselPart>): Observable<{ abbreviation: string, stats: VesselStats }> {
    if (!parts || Object.keys(parts).length === 0) {
      return of(null);
    }
    return combineLatest([
      this.lazyData.getEntry('submarineRanks'),
      this.lazyData.getEntry('airshipParts'),
      this.lazyData.getEntry('submarineParts')
    ]).pipe(
      map(([submarineRanks, airshipParts, submarineParts]) => {
        const rankBonus: VesselStats = type === VesselType.AIRSHIP ? {
          surveillance: 0,
          retrieval: 0,
          speed: 0,
          range: 0,
          favor: 0
        } : {
          surveillance: +submarineRanks[rank]?.surveillanceBonus,
          retrieval: +submarineRanks[rank]?.retrievalBonus,
          speed: +submarineRanks[rank]?.speedBonus,
          range: +submarineRanks[rank]?.rangeBonus,
          favor: +submarineRanks[rank]?.favorBonus
        };
        return Object.keys(parts)
          .map((slot) => {
            const vesselPart = type === VesselType.AIRSHIP ? airshipParts[parts[slot].partId] : submarineParts[parts[slot].partId];
            if (!vesselPart) {
              return null;
            }
            const partClass = type === VesselType.AIRSHIP ? AirshipPartClass[vesselPart.class] : SubmarinePartClass[vesselPart.class];
            return {
              abbreviation: this.translate.instant(`${VesselType[type]}.CLASS.${partClass}.Abbreviation`),
              stats: {
                surveillance: +vesselPart.surveillance,
                retrieval: +vesselPart.retrieval,
                speed: +vesselPart.speed,
                range: +vesselPart.range,
                favor: +vesselPart.favor
              }
            };
          })
          .filter(part => !!part)
          .reduce((a, b) => ({
            abbreviation: `${a.abbreviation}${b.abbreviation}`,
            stats: {
              surveillance: +a.stats.surveillance + +b.stats.surveillance,
              retrieval: +a.stats.retrieval + +b.stats.retrieval,
              speed: +a.stats.speed + +b.stats.speed,
              range: +a.stats.range + +b.stats.range,
              favor: +a.stats.favor + +b.stats.favor
            }
          }), { abbreviation: '', stats: rankBonus });
      })
    );
  }

  public getVesselPartName(vesselType: VesselType, partId: number): Observable<string> {
    if (vesselType === VesselType.AIRSHIP) {
      return this.lazyData.getRow('airshipParts', partId).pipe(
        switchMap(part => this.i18n.getNameObservable('items', part.itemId))
      );
    }
    return this.lazyData.getRow('submarineParts', partId).pipe(
      switchMap(part => this.i18n.getNameObservable('items', part.itemId))
    );
  }

  public toDestinationNames(vesselType: VesselType, destinations: number[]): Observable<string[]> {
    if (vesselType === VesselType.AIRSHIP) {
      return safeCombineLatest(destinations.map((id) => this.i18n.getNameObservable('airshipVoyages', id)));
    }
    return safeCombineLatest(destinations.map((id) => this.i18n.getNameObservable('submarineVoyages', id)));
  }

  @Memoized()
  public getAirshipMaxRank(): Observable<number> {
    return this.lazyData.getEntry('airshipRanks').pipe(
      map((airshipRanks) => {
        return +Object.keys(airshipRanks).pop();
      }),
      shareReplay({ bufferSize: 1, refCount: true })
    );
  }

  @Memoized()
  public getSubmarineMaxRank(): Observable<number> {
    return of(100);
  }

  @Memoized()
  public getAirshipSectorTotalCount(): Observable<number> {
    // Minus 1 because SE removed Diadem from Airship
    return this.lazyData.getEntry('airshipVoyages').pipe(
      map(airshipVoyages => {
        return Object.keys(airshipVoyages).filter((id) => airshipVoyages[id].en).length - 1;
      }),
      shareReplay({ bufferSize: 1, refCount: true })
    );
  }

  @Memoized()
  public getSubmarineSectorTotalCount(): Observable<number> {
    return this.lazyData.getEntry('submarineVoyages').pipe(
      map(submarineVoyages => {
        return Object.keys(submarineVoyages).filter((id) => submarineVoyages[id].en).length;
      }),
      shareReplay({ bufferSize: 1, refCount: true })
    );
  }

  @Memoized()
  public getVesselPartSlotByContainerSlot(containerSlot: number): AirshipPartType | SubmarinePartType {
    switch (containerSlot) {
      // Submersible
      case 0:
      case 5:
      case 10:
      case 15:
        return SubmarinePartType.HULL;
      case 1:
      case 6:
      case 11:
      case 16:
        return SubmarinePartType.STERN;
      case 2:
      case 7:
      case 12:
      case 17:
        return SubmarinePartType.BOW;
      case 3:
      case 8:
      case 13:
      case 18:
        return SubmarinePartType.BRIDGE;
      // Airship
      case 30:
      case 35:
      case 40:
      case 45:
        return AirshipPartType.HULL;
      case 31:
      case 36:
      case 41:
      case 46:
        return AirshipPartType.RIGGING;
      case 32:
      case 37:
      case 42:
      case 47:
        return AirshipPartType.FORECASTLE;
      case 33:
      case 38:
      case 43:
      case 48:
        return AirshipPartType.AFTCASTLE;
    }
    return null;
  }

  @Memoized()
  public getVesselSlotByContainerSlot(containerSlot: number): string {
    switch (containerSlot) {
      // Submersible
      case 0:
      case 1:
      case 2:
      case 3:
        return '0';
      case 5:
      case 6:
      case 7:
      case 8:
        return '1';
      case 10:
      case 11:
      case 12:
      case 13:
        return '2';
      case 15:
      case 16:
      case 17:
      case 18:
        return '3';
      // Airship
      case 30:
      case 31:
      case 32:
      case 33:
        return '0';
      case 35:
      case 36:
      case 37:
      case 38:
        return '1';
      case 40:
      case 41:
      case 42:
      case 43:
        return '2';
      case 45:
      case 46:
      case 47:
      case 48:
        return '3';
    }
    return null;
  }
}
