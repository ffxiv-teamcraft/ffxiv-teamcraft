import { Component } from '@angular/core';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { InventoryDisplay } from '../inventory-display';
import { first, map, switchMap } from 'rxjs/operators';
import { InventoryItem } from '../../../model/user/inventory/inventory-item';
import { UniversalisService } from '../../../core/api/universalis.service';
import { AuthFacade } from '../../../+state/auth.facade';
import { NzMessageService } from 'ng-zorro-antd';
import { TranslateService } from '@ngx-translate/core';
import { InventoryFacade } from '../../../modules/inventory/+state/inventory.facade';
import { UserInventory } from '../../../model/user/inventory/user-inventory';
import { LocalizedDataService } from '../../../core/data/localized-data.service';
import { I18nToolsService } from '../../../core/tools/i18n-tools.service';

@Component({
  selector: 'app-inventory',
  templateUrl: './inventory.component.html',
  styleUrls: ['./inventory.component.less']
})
export class InventoryComponent {

  public search$: BehaviorSubject<string> = new BehaviorSubject<string>('');

  private prices$: BehaviorSubject<{ itemId: number, price: number }[]> = new BehaviorSubject([]);

  public computingPrices: { [index: string]: boolean } = {};

  private inventory$: Observable<InventoryDisplay[]> = this.inventoryService.inventory$.pipe(
    map(inventory => inventory.clone()),
    map(inventory => {
      return [].concat.apply([],
        Object.keys(inventory.items)
          .map(key => {
            return Object.keys(inventory.items[key])
              .map(slot => inventory.items[key][slot]);
          })
      )
        .filter(item => {
          return UserInventory.DISPLAYED_CONTAINERS.indexOf(item.containerId) > -1;
        })
        .reduce((bags: InventoryDisplay[], item: InventoryItem) => {
          const containerName = item.retainerName || this.inventoryService.getContainerName(item.containerId);
          let bag = bags.find(i => i.containerName === containerName);
          if (bag === undefined) {
            bags.push({
              isRetainer: item.retainerName !== undefined,
              containerName: containerName,
              containerIds: [item.containerId],
              items: []
            });
            bag = bags[bags.length - 1];
          }
          if (bag.containerIds.indexOf(item.containerId) === -1) {
            bag.containerIds.push(item.containerId);
          }
          bag.items.push(item);
          return bags;
        }, []);
    }),
    map(inventories => {
      return inventories
        .sort((a, b) => {
          if (a.containerIds[0] !== b.containerIds[0]) {
            return a.containerIds[0] - b.containerIds[0];
          }
          return a.containerName > b.containerName ? -1 : 1;
        })
        .map(inventory => {
          inventory.items = inventory.items.sort((a, b) => a.itemId - b.itemId);
          return inventory;
        });
    })
  );

  public display$: Observable<InventoryDisplay[]> = combineLatest([this.inventory$, this.prices$, this.search$]).pipe(
    map(([inventories, prices, search]) => {
      return inventories
        .map(inventory => {
          const clone = { ...inventory };
          clone.items = inventory.items
            .map(item => {
              const priceEntry = prices.find(p => p.itemId === item.itemId);
              item.price = priceEntry ? priceEntry.price : 0;
              return item;
            })
            .filter(item => {
              if (search === '' || !search) {
                return true;
              }
              return search.split(' ').every(fragment => {
                return this.i18n.getName(this.l12n.getItem(item.itemId)).toLowerCase().indexOf(fragment.toLowerCase()) > -1;
              });
            });
          clone.totalPrice = inventory.items.reduce((total, item) => total + item.price * item.quantity, 0);
          return clone;
        });
    })
  );

  constructor(private inventoryService: InventoryFacade, private universalis: UniversalisService,
              private authFacade: AuthFacade, private message: NzMessageService,
              private translate: TranslateService, private l12n: LocalizedDataService,
              private i18n: I18nToolsService) {
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

  public deleteInventory(display: InventoryDisplay): void {
    this.inventoryService.inventory$.pipe(
      first(),
      map(inventory => {
        display.containerIds.forEach(containerId => {
          const isRetainer = containerId >= 10000 && containerId < 20000;
          if (isRetainer) {
            delete inventory.items[`${display.containerName}:${containerId}`];
          } else {
            delete inventory.items[containerId];
          }
        });
        return inventory;
      })
    ).subscribe(inventory => {
      this.inventoryService.updateInventory(inventory, true);
    });
  }

  public deleteInventories(): void {
    this.inventoryService.resetInventory();
  }

  trackByInventory(index: number, inventory: InventoryDisplay): string {
    return inventory.containerName;
  }

}
