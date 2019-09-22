import { Component } from '@angular/core';
import { UserInventoryService } from '../../../core/database/user-inventory.service';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { InventoryDisplay } from '../inventory-display';
import { first, map, switchMap } from 'rxjs/operators';
import { ContainerType } from '../../../model/user/inventory/container-type';
import { InventoryItem } from '../../../model/user/inventory/inventory-item';
import { UniversalisService } from '../../../core/api/universalis.service';
import { AuthFacade } from '../../../+state/auth.facade';
import { NzMessageService } from 'ng-zorro-antd';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-inventory',
  templateUrl: './inventory.component.html',
  styleUrls: ['./inventory.component.less']
})
export class InventoryComponent {

  private prices$: BehaviorSubject<{ itemId: number, price: number }[]> = new BehaviorSubject([]);

  public computingPrices: { [index: string]: boolean } = {};

  private inventory$: Observable<InventoryDisplay[]> = this.inventoryService.getUserInventory().pipe(
    map(inventory => {
      return inventory
        .items
        .filter(item => {
          return [
            ContainerType.Bag0,
            ContainerType.Bag1,
            ContainerType.Bag2,
            ContainerType.Bag3,
            ContainerType.RetainerBag0,
            ContainerType.RetainerBag1,
            ContainerType.RetainerBag2,
            ContainerType.RetainerBag3,
            ContainerType.RetainerBag4,
            ContainerType.RetainerBag5,
            ContainerType.RetainerBag6,
            ContainerType.SaddleBag0,
            ContainerType.SaddleBag1
          ].indexOf(item.containerId) > -1;
        }).reduce((bags: InventoryDisplay[], item: InventoryItem) => {
          let containerName: string;
          switch (item.containerId) {
            case ContainerType.Bag0:
            case ContainerType.Bag1:
            case ContainerType.Bag2:
            case ContainerType.Bag3:
              containerName = 'Bag';
              break;
            case ContainerType.RetainerBag0:
            case ContainerType.RetainerBag1:
            case ContainerType.RetainerBag2:
            case ContainerType.RetainerBag3:
            case ContainerType.RetainerBag4:
            case ContainerType.RetainerBag5:
            case ContainerType.RetainerBag6:
              containerName = 'RetainerBag';
              break;
            case ContainerType.SaddleBag0:
            case ContainerType.SaddleBag1:
              containerName = 'SaddleBag';
              break;
          }
          let bag = bags.find(i => i.containerName === containerName);
          if (bag === undefined) {
            bags.push({
              containerName: containerName,
              containerId: item.containerId,
              items: []
            });
            bag = bags[bags.length - 1];
          }
          bag.items.push(item);
          return bags;
        }, []);
    }),
    map(inventories => {
      return inventories
        .sort((a, b) => {
          return a.containerId - b.containerId;
        })
        .map(inventory => {
          inventory.items = inventory.items.sort((a, b) => a.slot - b.slot);
          return inventory;
        });
    })
  );

  public display$: Observable<InventoryDisplay[]> = combineLatest([this.inventory$, this.prices$]).pipe(
    map(([inventories, prices]) => {
      return inventories.map(inventory => {
        inventory.items = inventory.items.map(item => {
          const priceEntry = prices.find(p => p.itemId === item.itemId);
          item.price = priceEntry ? priceEntry.price : 0;
          return item;
        });
        inventory.totalPrice = inventory.items.reduce((total, item) => total + item.price, 0);
        return inventory;
      });
    })
  );

  constructor(private inventoryService: UserInventoryService, private universalis: UniversalisService,
              private authFacade: AuthFacade, private message: NzMessageService, private translate: TranslateService) {
  }

  public computePrices(inventory: InventoryDisplay): void {
    this.computingPrices[inventory.containerName] = true;
    this.authFacade.mainCharacter$.pipe(
      switchMap(character => {
        return this.universalis.getServerPrices(character.Server, ...inventory.items.map(i => i.itemId));
      }),
      first()
    ).subscribe(prices => {
      this.prices$.next([
        ...this.prices$.value.filter(price => !prices.some(p => p.ItemId === price.itemId)),
        ...prices.map(price => {
          const cheapest = price.Prices.sort((a, b) => a.PricePerUnit - b.PricePerUnit)[0];
          return {
            itemId: price.ItemId,
            price: cheapest ? cheapest.PricePerUnit : 0
          };
        })
      ]);
      this.computingPrices[inventory.containerName] = false;
    });
  }

  public getClipboardContent(inventory: InventoryDisplay): string {
    return JSON.stringify(inventory.items.reduce((content, item) => {
      return [...content, { id: item.itemId, amount: item.quantity }];
    }, []));
  }

  public inventoryCopied(): void {
    this.message.success(this.translate.instant('INVENTORY.Copied_to_clipboard'));
  }

}
