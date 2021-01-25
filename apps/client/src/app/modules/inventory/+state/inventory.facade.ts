import { Injectable } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { InventoryPartialState } from './inventory.reducer';
import { inventoryQuery } from './inventory.selectors';
import { LoadInventory, ResetInventory, SetContentId, UpdateInventory } from './inventory.actions';
import { ContainerType } from '../../../model/user/inventory/container-type';
import { UserInventory } from '../../../model/user/inventory/user-inventory';
import { filter, map, shareReplay } from 'rxjs/operators';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { SettingsService } from '../../settings/settings.service';
import { AuthFacade } from '../../../+state/auth.facade';
import { IpcService } from '../../../core/electron/ipc.service';
import { LodestoneIdEntry } from '../../../model/user/lodestone-id-entry';
import { CharacterResponse } from '@xivapi/angular-client';
import { ItemSearchResult } from '../../../model/user/inventory/item-search-result';
import { TranslateService } from '@ngx-translate/core';
import { ItemOdr, OdrCoords } from './item-odr';
import { Retainer, RetainersService } from '../../../core/electron/retainers.service';

@Injectable({
  providedIn: 'root'
})
export class InventoryFacade {
  loaded$ = this.store.pipe(select(inventoryQuery.getLoaded));

  inventory$: Observable<UserInventory> = this.store.pipe(
    select(inventoryQuery.getInventory),
    filter(inventory => inventory !== null),
    map((inventory: UserInventory) => inventory.clone()),
    shareReplay(1)
  );

  characterEntries: Array<LodestoneIdEntry & { character: CharacterResponse }>;

  private odr$: BehaviorSubject<Record<string, ItemOdr>> = new BehaviorSubject<Record<string, ItemOdr>>({});

  constructor(private store: Store<InventoryPartialState>, private authFacade: AuthFacade, private ipc: IpcService,
              private translate: TranslateService, private retainersService: RetainersService, private settings: SettingsService) {
    if (this.settings.clearInventoryOnStartup) {
      this.resetInventory();
    }
    this.ipc.on('dat:content-id', (event, contentId) => {
      this.setContentId(contentId);
    });
    this.ipc.on('dat:item-odr', (event, { odr, contentId }) => {
      this.odr$.next({ ...this.odr$.value, [contentId]: odr });
    });
    this.ipc.once('dat:all-odr:value', (event, odr) => {
      this.odr$.next(odr);
    });
    this.ipc.send('dat:all-odr');
    this.authFacade.characterEntries$.subscribe(entries => {
      this.characterEntries = entries;
    });
  }

  public getPosition(item: ItemSearchResult): Observable<number> {
    return combineLatest([this.odr$, this.retainersService.retainers$]).pipe(
      map(([odr, retainers]) => {
        const itemOdr = odr[item.contentId];
        const inventory = this.getOdrInventory(item, itemOdr, retainers);
        let containerId = item.containerId;
        // Armory
        const armoryContainers = [
          ContainerType.ArmoryMain,
          ContainerType.ArmoryHead,
          ContainerType.ArmoryBody,
          ContainerType.ArmoryHand,
          ContainerType.ArmoryWaist,
          ContainerType.ArmoryLegs,
          ContainerType.ArmoryFeet,
          ContainerType.ArmoryOff,
          ContainerType.ArmoryEar,
          ContainerType.ArmoryNeck,
          ContainerType.ArmoryWrist,
          ContainerType.ArmoryRing,
          ContainerType.ArmorySoulCrystal
        ];
        if (armoryContainers.includes(item.containerId)) {
          containerId = 0;
        }
        // Saddlebag
        if ([ContainerType.SaddleBag0, ContainerType.SaddleBag1].includes(item.containerId)) {
          containerId -= ContainerType.SaddleBag0;
        }
        if ([ContainerType.PremiumSaddleBag0, ContainerType.PremiumSaddleBag1].includes(item.containerId)) {
          containerId -= ContainerType.PremiumSaddleBag0;
        }
        // Retainers
        const retainerContainers = [
          ContainerType.RetainerBag0,
          ContainerType.RetainerBag1,
          ContainerType.RetainerBag2,
          ContainerType.RetainerBag3,
          ContainerType.RetainerBag4,
          ContainerType.RetainerBag5,
          ContainerType.RetainerBag6
        ];
        if (retainerContainers.includes(item.containerId)) {
          containerId -= ContainerType.RetainerBag0;
        }
        return inventory.findIndex(coords => {
          return coords.slot === item.slot && coords.container === containerId;
        });
      })
    );
  }

  private getOdrInventory(item: ItemSearchResult, odr: ItemOdr, retainers: Record<string, Retainer>): OdrCoords[] {
    if (!odr) {
      return [];
    }
    switch (item.containerId) {
      case ContainerType.Bag0:
      case ContainerType.Bag1:
      case ContainerType.Bag2:
      case ContainerType.Bag3:
        return odr.Player;
      case ContainerType.ArmoryMain:
        return odr.ArmoryMain;
      case ContainerType.ArmoryHead:
        return odr.ArmoryHead;
      case ContainerType.ArmoryBody:
        return odr.ArmoryBody;
      case ContainerType.ArmoryHand:
        return odr.ArmoryHand;
      case ContainerType.ArmoryWaist:
        return odr.ArmoryWaist;
      case ContainerType.ArmoryLegs:
        return odr.ArmoryLegs;
      case ContainerType.ArmoryFeet:
        return odr.ArmoryFeet;
      case ContainerType.ArmoryOff:
        return odr.ArmoryOff;
      case ContainerType.ArmoryEar:
        return odr.ArmoryEar;
      case ContainerType.ArmoryNeck:
        return odr.ArmoryNeck;
      case ContainerType.ArmoryWrist:
        return odr.ArmoryWrist;
      case ContainerType.ArmoryRing:
        return odr.ArmoryRing;
      case ContainerType.ArmorySoulCrystal:
        return odr.ArmorySoulCrystal;
      case ContainerType.SaddleBag0:
      case ContainerType.SaddleBag1:
        return odr.SaddleBag;
      case ContainerType.PremiumSaddleBag0:
      case ContainerType.PremiumSaddleBag1:
        return odr.PremiumSaddlebag;
      case ContainerType.RetainerBag0:
      case ContainerType.RetainerBag1:
      case ContainerType.RetainerBag4:
      case ContainerType.RetainerBag5:
      case ContainerType.RetainerBag6:
        const retainerKey = Object.keys(retainers).find(key => retainers[key].name.toLowerCase() === item.retainerName.toLowerCase());
        if (retainerKey) {
          const retainerEntry = odr.Retainers.find(retainer => retainer.id.endsWith(retainerKey));
          return retainerEntry?.inventory || [];
        }
        return [];
      default:
        return [];
    }
  }

  public getContainerTranslateKey(item: ItemSearchResult): string {
    if (item.retainerName && item.containerId !== ContainerType.RetainerMarket) {
      return item.retainerName;
    }
    return this.translate.instant(`INVENTORY.BAG.${this.getContainerName(item.containerId)}`);
  }

  public getContainerDisplayName(item: ItemSearchResult): string {
    const containerName = this.getContainerTranslateKey(item);
    if (item.isCurrentCharacter) {
      return containerName;
    } else {
      const entry = this.characterEntries.find(e => e.contentId === item.contentId);
      return `${containerName} (${entry?.character.Character.Name || this.translate.instant('COMMON.Unknown')})`;
    }
  }

  public getContainerName(containerId: number): string {
    switch (containerId) {
      case ContainerType.Bag0:
      case ContainerType.Bag1:
      case ContainerType.Bag2:
      case ContainerType.Bag3:
        return 'Bag';
      case ContainerType.RetainerBag0:
      case ContainerType.RetainerBag1:
      case ContainerType.RetainerBag2:
      case ContainerType.RetainerBag3:
      case ContainerType.RetainerBag4:
      case ContainerType.RetainerBag5:
      case ContainerType.RetainerBag6:
        return 'RetainerBag';
      case ContainerType.RetainerMarket:
        return 'RetainerMarket';
      case ContainerType.SaddleBag0:
      case ContainerType.SaddleBag1:
      case ContainerType.PremiumSaddleBag0:
      case ContainerType.PremiumSaddleBag1:
        return 'SaddleBag';
      case ContainerType.FreeCompanyBag0:
      case ContainerType.FreeCompanyBag1:
      case ContainerType.FreeCompanyBag2:
      case ContainerType.FreeCompanyBag3:
      case ContainerType.FreeCompanyBag4:
      case ContainerType.FreeCompanyBag5:
      case ContainerType.FreeCompanyBag6:
      case ContainerType.FreeCompanyBag7:
      case ContainerType.FreeCompanyBag8:
      case ContainerType.FreeCompanyBag9:
      case ContainerType.FreeCompanyBag10:
        return 'FC_chest';
      case ContainerType.ArmoryOff:
      case ContainerType.ArmoryHead:
      case ContainerType.ArmoryBody:
      case ContainerType.ArmoryHand:
      case ContainerType.ArmoryWaist:
      case ContainerType.ArmoryLegs:
      case ContainerType.ArmoryFeet:
      case ContainerType.ArmoryNeck:
      case ContainerType.ArmoryEar:
      case ContainerType.ArmoryWrist:
      case ContainerType.ArmoryRing:
      case ContainerType.ArmorySoulCrystal:
      case ContainerType.ArmoryMain:
        return 'Armory';
      case ContainerType.GearSet0:
        return 'Current_Gear';
    }
    return 'Other';
  }

  load(): void {
    this.store.dispatch(new LoadInventory());
  }

  updateInventory(inventory: UserInventory, force = false): void {
    this.store.dispatch(new UpdateInventory(inventory, force));
  }

  resetInventory(): void {
    this.store.dispatch(new ResetInventory());
  }

  setContentId(contentId: string): void {
    if (!this.settings.ignoredContentIds.includes(contentId)) {
      this.store.dispatch(new SetContentId(contentId));
    }
  }
}
