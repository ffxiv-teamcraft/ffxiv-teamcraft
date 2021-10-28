import { Component } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { InventoryDisplay } from '../inventory-display';
import { first, map, switchMap } from 'rxjs/operators';
import { InventoryItem } from '../../../model/user/inventory/inventory-item';
import { UniversalisService } from '../../../core/api/universalis.service';
import { AuthFacade } from '../../../+state/auth.facade';
import { NzMessageService } from 'ng-zorro-antd/message';
import { TranslateService } from '@ngx-translate/core';
import { UserInventory } from '../../../model/user/inventory/user-inventory';
import { I18nToolsService } from '../../../core/tools/i18n-tools.service';
import { ContainerType } from '../../../model/user/inventory/container-type';
import { ItemSearchResult } from '../../../model/user/inventory/item-search-result';
import { InventoryService } from '../../../modules/inventory/inventory.service';
import { SettingsService } from '../../../modules/settings/settings.service';
import { LazyDataFacade } from '../../../lazy-data/+state/lazy-data.facade';
import { safeCombineLatest } from '../../../core/rxjs/safe-combine-latest';

@Component({
  selector: 'app-inventory',
  templateUrl: './inventory.component.html',
  styleUrls: ['./inventory.component.less']
})
export class InventoryComponent {

  public selectedExpansion$: BehaviorSubject<number> = new BehaviorSubject<number>(null);
  public search$: BehaviorSubject<string> = new BehaviorSubject<string>('');
  public computingPrices: { [index: string]: boolean } = {};
  private prices$: BehaviorSubject<{ itemId: number, price: number }[]> = new BehaviorSubject([]);
  private inventory$: Observable<InventoryDisplay[]> = this.inventoryService.inventory$.pipe(
    map(inventory => {
      return inventory.toArray()
        .filter((item: ItemSearchResult) => {
          // Happens if you add an item that you never had in your inventory before (in an empty slot)
          if (item.retainerName && item.containerId < 10000) {
            return false;
          }
          let matches = true;
          if (!inventory.trackItemsOnSale) {
            matches = matches && item.containerId !== ContainerType.RetainerMarket;
          }
          if (!this.settings.showOthercharacterInventoriesInInventoryPage) {
            matches = matches && item.contentId === inventory.contentId;
          }
          return matches && UserInventory.DISPLAYED_CONTAINERS.includes(item.containerId);
        })
        .reduce((bags: InventoryDisplay[], item: ItemSearchResult) => {
          const containerName = this.inventoryService.getContainerDisplayName(item);
          let bag = bags.find(i => i.containerName === containerName);
          if (bag === undefined) {
            bags.push({
              isRetainer: item.retainerName !== undefined,
              containerName: containerName,
              containerIds: [item.containerId],
              contentId: item.contentId,
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
            return +a.containerIds[0] - +b.containerIds[0];
          }
          return a.containerName > b.containerName ? -1 : 1;
        })
        .map(inventory => {
          inventory.items = inventory.items.sort((a, b) => {
            if (a.price === b.price) {
              return a.itemId - b.itemId;
            } else {
              return b.price - a.price;
            }
          });
          return inventory;
        });
    })
  );
  public display$: Observable<InventoryDisplay[]> = safeCombineLatest([
    this.inventory$,
    this.prices$,
    this.search$,
    this.selectedExpansion$,
    this.lazyData.patches$,
    this.lazyData.getEntry('itemPatch'),
    this.lazyData.getI18nEntry('items')
  ]).pipe(
    map(([inventories, prices, search, selectedExpansion, patches, itemPatch, items]) => {
      return inventories
        .map(inventory => {
          const clone = { ...inventory };
          clone.items = inventory.items
            .map(item => {
              const priceEntry = prices.find(p => p.itemId === item.itemId);
              item.price = priceEntry ? priceEntry.price : 0;
              return item;
            })
            .sort((a, b) => {
              const diffPrice = b.price * b.quantity - a.price * a.quantity;
              if (diffPrice !== 0) {
                return diffPrice;
              }
              return a.slot - b.slot;
            })
            .filter(item => {
              if (selectedExpansion !== null && selectedExpansion >= 0) {
                // Find the patch this item was released in, and then get that patch's expansion
                const itemExpansion: any = patches.find(p => {
                  return p.ID === itemPatch[item.itemId];
                });

                // We test if false and return false here instead of the inverse so that we can continue through the rest of our search
                if (!itemExpansion || itemExpansion.ExVersion !== selectedExpansion) {
                  return false;
                }
              }

              if (!search) {
                return true;
              }

              // Return if item matches all search criteria
              const itemName = this.i18n.getName(items[item.itemId]).toLowerCase();
              return search.split(' ').every(fragment => {
                return itemName.includes(fragment.toLowerCase());
              });
            });
          clone.totalPrice = inventory.items.reduce((total, item) => total + item.price * item.quantity, 0);
          return clone;
        });
    })
  );

  public expansions$ = this.lazyData.getI18nEntry('exVersions');

  constructor(private inventoryService: InventoryService, private universalis: UniversalisService,
              private authFacade: AuthFacade, private message: NzMessageService,
              private translate: TranslateService,
              private i18n: I18nToolsService, private lazyData: LazyDataFacade,
              private settings: SettingsService) {
  }

  public get selectedExpansion() {
    return this.selectedExpansion$.value;
  }

  public set selectedExpansion(value) {
    this.selectedExpansion$.next(value);
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

  public deleteInventory(display: InventoryDisplay): void {
    this.inventoryService.inventory$.pipe(
      first(),
      map(inventory => {
        display.containerIds.forEach(containerId => {
          const isRetainer = containerId >= 10000 && containerId < 20000;
          if (isRetainer) {
            inventory.items[display.contentId][`${display.containerName}:${containerId}`] = {};
          } else {
            inventory.items[display.contentId][containerId] = {};
          }
        });
        return inventory;
      })
    ).subscribe(inventory => {
      this.inventoryService.setInventory(inventory);
    });
  }

  public getClipboardContent = (inventory: InventoryDisplay) => {
    return JSON.stringify(inventory.items.reduce((content, item) => {
      return [...content, { id: item.itemId, amount: item.quantity }];
    }, []));
  };

  public getInventoryJson(display: InventoryDisplay[]): string {
    return JSON.stringify([].concat.apply([], display.map(i => i.items)));
  }

  public getInventoryCsv(display: InventoryDisplay[]): string {
    const json = [].concat.apply([], display.map(i => i.items));

    // Source: https://stackoverflow.com/a/31536517/4102561
    const fields: Array<keyof InventoryItem> = [
      'itemId',
      'containerId',
      'retainerName',
      'slot',
      'quantity',
      'hq',
      'spiritBond',
      'price'
    ];
    const replacer = (key, value) => {
      return !value ? '' : value;
    };
    const csv = json.map((row) => {
      return fields.map((fieldName) => {
        return JSON.stringify(row[fieldName], replacer);
      }).join(',');
    });
    csv.unshift(fields.join(','));
    return csv.join('\r\n');
  }

  public deleteInventories(): void {
    this.inventoryService.resetInventory();
  }

  trackByInventory(index: number, inventory: InventoryDisplay): string {
    return inventory.containerName;
  }

}
