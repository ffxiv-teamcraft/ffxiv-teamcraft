import { Injectable } from '@angular/core';
import { IpcService } from './ipc.service';
import { UserInventoryService } from '../database/user-inventory.service';
import { UniversalisService } from '../api/universalis.service';
import { bufferTime, distinctUntilChanged, filter, map, shareReplay, switchMap } from 'rxjs/operators';
import { UserInventory } from '../../model/user/user-inventory';
import { combineLatest, Observable } from 'rxjs';
import { AuthFacade } from '../../+state/auth.facade';
import * as _ from 'lodash';

@Injectable({
  providedIn: 'root'
})
export class MachinaService {

  private inventory$: Observable<UserInventory>;

  constructor(private ipc: IpcService, private userInventoryService: UserInventoryService,
              private universalis: UniversalisService, private authFacade: AuthFacade) {
    this.inventory$ = this.userInventoryService.getUserInventory().pipe(
      distinctUntilChanged((a, b) => {
        return JSON.stringify(a.items) === JSON.stringify(b.items);
      }),
      shareReplay(1)
    );
  }

  public init(): void {
    this.ipc.itemInfoPackets$.pipe(
      bufferTime(500),
      filter(packets => packets.length > 0),
      switchMap(itemInfos => {
        return combineLatest([this.inventory$, this.authFacade.user$]).pipe(
          map(([inventory, user]) => {
            if (!inventory) {
              inventory = new UserInventory();
              if (user.defaultLodestoneId) {
                inventory.characterId = user.defaultLodestoneId;
              }
              inventory.authorId = user.$key;
            }
            const updatedContainerIds = _.uniqBy(itemInfos, 'containerId').map(packet => packet.containerId);
            inventory.items = [
              ...inventory.items.filter(i => updatedContainerIds.indexOf(i.containerId) < 0),
              ...itemInfos.map(itemInfo => {
                return {
                  itemId: +itemInfo.catalogId,
                  containerId: +itemInfo.containerId,
                  slot: +itemInfo.slot,
                  quantity: +itemInfo.quantity,
                  hq: itemInfo.hq === 1
                };
              })];
            return inventory;
          })
        );
      }),
      switchMap(inventory => {
        console.log(inventory);
        if (inventory.$key) {
          return this.userInventoryService.set(inventory.$key, inventory);
        } else {
          return this.userInventoryService.add(inventory);
        }
      })
    ).subscribe();
  }
}
