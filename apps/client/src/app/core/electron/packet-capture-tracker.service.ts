import { Injectable } from '@angular/core';
import { IpcService } from './ipc.service';
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
import { PlatformService } from '../tools/platform.service';
import { StatusEntry } from '../../modules/eorzea/status-entry';
import { LazyStatus } from '@ffxiv-teamcraft/data/model/lazy-status';
import { isEqual } from 'lodash';
import { Region } from '@ffxiv-teamcraft/types';
@Injectable({
  providedIn: 'root'
})
export class PacketCaptureTrackerService {

  private notificationRef: NzNotificationRef;

  constructor(private ipc: IpcService, private inventoryService: InventoryService,
              private authFacade: AuthFacade, private listsFacade: ListsFacade, private eorzeaFacade: EorzeaFacade,
              private settings: SettingsService, private lazyData: LazyDataFacade,
              private freeCompanyWorkshopFacade: FreeCompanyWorkshopFacade,
              private nzNotification: NzNotificationService, private translate: TranslateService,
              private router: Router, private platformService: PlatformService) {
  }

  private getStatusStacks(param: number, status: LazyStatus): number {
    if ((param & 0x00FF) === 0x00FF) {
      return 0;
    }
    // If status can's have stacks, return 0
    if (!status || status.maxStacks === 0) {
      return 0;
    }
    return param;
  }


  public init(): void {
    if (!this.platformService.isDesktop()) {
      return;
    }
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
        withLatestFrom(this.listsFacade.autocompleteEnabled$),
        filter(([[patch, isCrafting], autocompleteEnabled]) => {
          return autocompleteEnabled && patch.quantity > 0;
        }),
        map(([[patch, isCrafting]]) => {
          return {
            ...patch,
            fromCrafting: isCrafting
          };
        })
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
        if (page.includes('list') && list && !list.offline && status && !this.notificationRef
          && autofill && !this.ipc.overlayUri && this.settings.displaySlowModeNotification) {
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
            this.listsFacade.setItemDone({
              itemId: patch.itemId,
              itemIcon: itemsEntry.icon,
              finalItem: false,
              delta: patch.quantity,
              recipeId: itemsEntry.recipeId,
              totalNeeded: itemsEntry.amount,
              external: !patch.fromCrafting,
              fromPacket: true,
              hq: patch.hq
            });
          } else if (finalItemsEntry && finalItemsEntry.done < finalItemsEntry.amount) {
            this.listsFacade.setItemDone({
              itemId: patch.itemId,
              itemIcon: finalItemsEntry.icon,
              finalItem: true,
              delta: patch.quantity,
              recipeId: finalItemsEntry.recipeId,
              totalNeeded: finalItemsEntry.amount,
              external: !patch.fromCrafting,
              fromPacket: true,
              hq: patch.hq
            });
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

    this.lazyData.getEntry('baits').pipe(
      switchMap(baitItems => {
        return this.ipc.packets$.pipe(
          ofMessageType('actorControlSelf', 'fishingBaitMsg'),
          toIpcData(),
          filter(packet => baitItems.some(i => i.id === packet.baitId))
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

    this.ipc.packets$.pipe(
      ofMessageType('effectResult'),
      toIpcData(),
      switchMap(packet => {
        const toAdd = [];
        for (let i = 0; i < packet.entryCount; i++) {
          if (packet.statusEntries[i] && packet.statusEntries[i].sourceActorId === packet.actorId) {
            toAdd.push(packet.statusEntries[i]);
          }
        }
        return combineLatest(toAdd.map(row => {
          return this.lazyData.getRow('statuses', row.id).pipe(
            map(lazyStatus => {
              return {
                id: row.id,
                stacks: this.getStatusStacks(row.param, lazyStatus),
                duration: row.duration,
                param: row.param
              } as StatusEntry;
            })
          );
        }));
      })
    ).subscribe(statuses => {
      if (statuses.length > 0) {
        statuses.forEach(status => {
          this.eorzeaFacade.addStatus(status);
        });
      }
    });

    this.ipc.packets$.pipe(
      ofMessageType('statusEffectList'),
      toIpcData(),
      switchMap(packet => {
        return combineLatest(packet.effects
          .filter(e => e.effectId > 0)
          .map(effect => {
            return this.lazyData.getRow('statuses', effect.effectId).pipe(
              map(lazyStatus => {
                return {
                  id: effect.effectId,
                  stacks: this.getStatusStacks(effect.param, lazyStatus),
                  duration: effect.duration,
                  param: effect.param
                } as StatusEntry;
              })
            );
          })
        );
      })
    ).subscribe(statuses => {
      this.eorzeaFacade.setStatuses(statuses);
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
    combineLatest([this.settings.watchSetting('autoUpdateStats', this.settings.autoUpdateStats), this.eorzeaFacade.classJobSet$, this.authFacade.gearSets$])
      .pipe(
        filter(([autoUpdate]) => autoUpdate)
      )
      .subscribe(([, set, gearsets]) => {
        const savedSet = gearsets.find(g => g.jobId === set.jobId);
        if (!isEqual(savedSet, set)) {
          this.authFacade.saveSet(set);
        }
      });
  }
}
