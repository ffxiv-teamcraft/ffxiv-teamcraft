import { Injectable } from '@angular/core';
import { IpcService } from './ipc.service';
import { UniversalisService } from '../api/universalis.service';
import { buffer, debounce, distinctUntilChanged, filter, map, shareReplay, startWith, switchMap, tap, withLatestFrom } from 'rxjs/operators';
import { combineLatest, merge, timer } from 'rxjs';
import { AuthFacade } from '../../+state/auth.facade';
import { ListsFacade } from '../../modules/list/+state/lists.facade';
import { ContainerType } from '../../model/user/inventory/container-type';
import { EorzeaFacade } from '../../modules/eorzea/+state/eorzea.facade';
import { ofMessageType } from '../rxjs/of-message-type';
import { territories } from '../data/sources/territories';
import { debounceBufferTime } from '../rxjs/debounce-buffer-time';
import { SettingsService } from '../../modules/settings/settings.service';
import { toIpcData } from '../rxjs/to-ipc-data';
import { FreeCompanyWorkshopFacade } from '../../modules/free-company-workshops/+state/free-company-workshop.facade';
import { InventoryService } from '../../modules/inventory/inventory.service';
import { LazyDataFacade } from '../../lazy-data/+state/lazy-data.facade';
import { EventHandlerType } from './event-handler-type';
import { NzNotificationRef, NzNotificationService } from 'ng-zorro-antd/notification';
import { TranslateService } from '@ngx-translate/core';
import { NavigationEnd, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class PacketCaptureTrackerService {

  private notificationRef: NzNotificationRef;

  constructor(private ipc: IpcService, private inventoryService: InventoryService,
              private universalis: UniversalisService, private authFacade: AuthFacade,
              private listsFacade: ListsFacade, private eorzeaFacade: EorzeaFacade,
              private settings: SettingsService, private lazyData: LazyDataFacade,
              private freeCompanyWorkshopFacade: FreeCompanyWorkshopFacade,
              private nzNotification: NzNotificationService, private translate: TranslateService,
              private router: Router) {
  }


  public init(): void {
    const currentPage$ = this.router.events.pipe(
      filter(e => e instanceof NavigationEnd),
      map((e: NavigationEnd) => e.urlAfterRedirects)
    );

    const isCrafting$ = merge(
      this.ipc.packets$.pipe(ofMessageType('eventStart')),
      this.ipc.packets$.pipe(ofMessageType('eventFinish'))
    ).pipe(
      filter(packet => packet.parsedIpcData.eventId >> 16 === EventHandlerType.Craft),
      map(packet => {
        return packet.type === 'eventStart';
      }),
      startWith(false),
      shareReplay({ bufferSize: 1, refCount: true })
    );

    const isGathering$ = merge(
      this.ipc.packets$.pipe(ofMessageType('eventStart')),
      this.ipc.packets$.pipe(ofMessageType('eventFinish'))
    ).pipe(
      filter(packet => packet.parsedIpcData.eventId >> 16 === EventHandlerType.GatheringPoint),
      map(packet => {
        return packet.type === 'eventStart';
      }),
      startWith(false),
      shareReplay({ bufferSize: 1, refCount: true })
    );

    const eventStatus$ = combineLatest([isCrafting$, isGathering$]).pipe(
      map(([crafting, gathering]) => {
        if (crafting) {
          return 'crafting';
        }
        if (gathering) {
          return 'gathering';
        }
        return null;
      })
    );

    const patches$ = this.inventoryService.inventoryPatches$
      .pipe(
        filter(patch => {
          return patch.containerId < 10
            || patch.containerId === ContainerType.Crystal
            || (patch.containerId >= ContainerType.ArmoryOff && patch.containerId <= ContainerType.ArmoryMain);
        }),
        withLatestFrom(isCrafting$),
        filter(([patch, isCrafting]) => {
          return (patch.containerId < ContainerType.ArmoryOff || patch.containerId > ContainerType.ArmoryMain)
            || isCrafting;
        }),
        map(([patch]) => patch),
        withLatestFrom(this.listsFacade.autocompleteEnabled$),
        filter(([patch, autocompleteEnabled]) => {
          return autocompleteEnabled && patch.quantity > 0;
        }),
        map(([patch]) => patch)
      );

    const statusIsNull$ = combineLatest([patches$, eventStatus$, this.listsFacade.selectedList$]).pipe(
      map(([, status, list]) => status === null || list.offline),
      shareReplay({ bufferSize: 1, refCount: true })
    );

    const debouncedPatches$ = patches$.pipe(
      withLatestFrom(statusIsNull$),
      debounce(([, statusIsNull]) => {
        if (statusIsNull) {
          return timer(2000);
        }
        return timer(8000);
      }),
      map(([patches]) => patches)
    );

    combineLatest([eventStatus$, this.listsFacade.selectedList$, currentPage$])
      .pipe(
        withLatestFrom(this.listsFacade.autocompleteEnabled$)
      )
      .subscribe(([[status, list, page], autofill]) => {
        if (page.includes('list') && list && !list.offline && status && !this.notificationRef && autofill) {
          this.notificationRef = this.nzNotification.info(
            this.translate.instant('LIST_DETAILS.Autofill_crafting_gathering_title'),
            this.translate.instant('LIST_DETAILS.Autofill_crafting_gathering_message'),
            {
              nzCloseIcon: null,
              nzDuration: 0,
              nzKey: 'autofill_gathering_crafting',
              nzStyle: {
                right: localStorage.getItem('alarms-sidebar:collapsed') === 'false' ? `240px` : `10px`,
                top: '85px'
              }
            }
          );
        }
        if (!status && this.notificationRef) {
          this.nzNotification.remove(this.notificationRef.messageId);
          delete this.notificationRef;
        }
      });

    patches$.pipe(
      buffer(
        merge(
          debouncedPatches$,
          statusIsNull$.pipe(filter(Boolean))
        )
      ),
      withLatestFrom(this.listsFacade.selectedList$)
    ).subscribe(([patches, list]) => {
      patches
        .reduce((acc, patch) => {
          const row = acc.find(p => p.itemId === patch.itemId && p.hq === patch.hq);
          if (row === undefined) {
            acc.push(patch);
          } else {
            row.quantity += patch.quantity;
          }
          return acc;
        }, [])
        .forEach((patch) => {
          const itemsEntry = list.items.find(i => i.id === patch.itemId);
          const finalItemsEntry = list.finalItems.find(i => i.id === patch.itemId);
          if (itemsEntry && itemsEntry.done < itemsEntry.amount) {
            this.listsFacade.setItemDone(patch.itemId, itemsEntry.icon, false, patch.quantity, itemsEntry.recipeId, itemsEntry.amount, false, true, patch.hq);
          } else if (finalItemsEntry && finalItemsEntry.done < finalItemsEntry.amount) {
            this.listsFacade.setItemDone(patch.itemId, finalItemsEntry.icon, true, patch.quantity, finalItemsEntry.recipeId, finalItemsEntry.amount, false, true, patch.hq);
          }
        });
    });

    combineLatest([
      this.ipc.initZonePackets$,
      this.lazyData.getEntry('maps')
    ]).subscribe(([packet, maps]) => {
      const mapId = territories[packet.zoneId.toString()];
      if (mapId) {
        this.eorzeaFacade.setZone(maps[mapId].placename_id);
        this.eorzeaFacade.setPcapWeather(packet.weatherId, true);
        this.eorzeaFacade.setMap(mapId);
      } else {
        console.warn(`Ignoring map switch to ${mapId} with packet:`);
        console.warn(packet);
      }
    });

    this.ipc.weatherChangePackets$.subscribe(packet => {
      this.eorzeaFacade.setPcapWeather(packet.weatherId);
    });

    this.lazyData.getEntry('baitItems').pipe(
      switchMap(baitItems => {
        return this.ipc.packets$.pipe(
          ofMessageType('actorControlSelf', 'fishingBaitMsg'),
          toIpcData(),
          filter(packet => baitItems.includes(packet.baitId))
        );
      })
    ).subscribe(packet => {
      this.eorzeaFacade.setBait(packet.baitId);
    });

    this.ipc.packets$.pipe(
      ofMessageType('actorControl', 'statusEffectLose'),
      filter(message => message.header.sourceActor === message.header.targetActor),
      toIpcData()
    ).subscribe(packet => {
      this.eorzeaFacade.removeStatus(packet.effectId);
    });

    this.ipc.packets$.pipe(
      ofMessageType('actorControl'),
      filter(message => message.parsedIpcData.category === 21 && message.header.sourceActor === message.header.targetActor),
      toIpcData()
    ).subscribe(packet => {
      this.eorzeaFacade.removeStatus(packet.param1);
    });

    this.ipc.updateClassInfoPackets$.pipe(
      distinctUntilChanged((a, b) => a.classId === b.classId)
    ).subscribe((p) => {
      this.eorzeaFacade.resetStatuses();
    });

    this.ipc.packets$.pipe(
      ofMessageType('effectResult'),
      toIpcData()
    ).subscribe(packet => {
      for (let i = 0; i < packet.entryCount; i++) {
        if (packet.statusEntries[i] && packet.statusEntries[i].sourceActorId === packet.actorId) {
          this.eorzeaFacade.addStatus(packet.statusEntries[i].id);
        }
      }
    });

    this.ipc.packets$.pipe(
      ofMessageType('statusEffectList')
    ).subscribe(message => {
      this.eorzeaFacade.setStatuses(message.parsedIpcData.effects.map(e => e.effectId).filter(id => id > 0));
    });

    this.ipc.packets$.pipe(
      ofMessageType('logout'),
      withLatestFrom(this.authFacade.user$)
    ).subscribe(([, user]) => {
      if (user.lodestoneIds.length > 1) {
        this.inventoryService.setContentId(null);
      }
      this.eorzeaFacade.setBait(0);
    });

    this.ipc.playerSetupPackets$.subscribe((packet) => {
      this.inventoryService.setContentId(packet.contentId.toString(16).padStart(16, '0').toUpperCase());
    });

    this.ipc.freeCompanyId$.pipe(
      distinctUntilChanged()
    ).subscribe((freeCompanyId) => {
      this.freeCompanyWorkshopFacade.setCurrentFreeCompanyId(freeCompanyId);
    });

    this.freeCompanyWorkshopFacade.vesselPartUpdate$.pipe(
      debounceBufferTime(2500),
      tap((packets) => {
        packets.forEach((packet) => {
          this.freeCompanyWorkshopFacade.updateVesselParts(packet);
        });
      }),
      withLatestFrom(this.freeCompanyWorkshopFacade.currentWorkshop$),
      filter(([, workshop]) => workshop?.id !== undefined)
    ).subscribe();

    this.freeCompanyWorkshopFacade.vesselTimers$.pipe(
      withLatestFrom(this.freeCompanyWorkshopFacade.currentWorkshop$),
      filter(([, workshop]) => workshop?.id !== undefined)
    ).subscribe(([data]) => {
      this.freeCompanyWorkshopFacade.updateVesselTimers(data);
    });

    this.freeCompanyWorkshopFacade.airshipStatus$.pipe(
      withLatestFrom(this.freeCompanyWorkshopFacade.currentWorkshop$),
      filter(([, workshop]) => workshop?.id !== undefined)
    ).subscribe(([{ slot, vessel }]) => {
      this.freeCompanyWorkshopFacade.updateAirshipStatus(slot, vessel);
    });

    this.freeCompanyWorkshopFacade.airshipStatusList$.pipe(
      withLatestFrom(this.freeCompanyWorkshopFacade.currentWorkshop$),
      filter(([, workshop]) => workshop?.id !== undefined)
    ).subscribe(([vessels]) => {
      this.freeCompanyWorkshopFacade.updateAirshipStatusList(vessels);
    });

    this.freeCompanyWorkshopFacade.submarineStatusList$.pipe(
      withLatestFrom(this.freeCompanyWorkshopFacade.currentWorkshop$),
      filter(([, workshop]) => workshop?.id !== undefined)
    ).subscribe(([vessels]) => {
      this.freeCompanyWorkshopFacade.updateSubmarineStatusList(vessels);
    });

    this.freeCompanyWorkshopFacade.vesselProgressionStatus$.pipe(
      withLatestFrom(this.freeCompanyWorkshopFacade.currentWorkshop$),
      filter(([, workshop]) => workshop?.id !== undefined)
    ).subscribe(([progression]) => {
      this.freeCompanyWorkshopFacade.updateVesselProgressionStatus(progression);
    });

    /**
     * Stats tracking
     */
    combineLatest([this.settings.watchSetting('autoUpdateStats', this.settings.autoUpdateStats), this.eorzeaFacade.classJobSet$])
      .pipe(
        filter(([autoUpdate]) => autoUpdate)
      )
      .subscribe(([, set]) => {
        this.authFacade.saveSet(set);
      });
  }
}
