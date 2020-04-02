import { Component } from '@angular/core';
import { uniq } from 'lodash';
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
import { LazyDataService } from '../../../core/data/lazy-data.service';

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
        .filter((item: InventoryItem) => {
          // Happens if you add an item that you never had in your inventory before (in an empty slot)
          if (item.retainerName && item.containerId < 10000) {
            return false;
          }
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

              let processedSearch: string = search;

              //Expansion token filtering
              //Object for expansion abbreviations, 'abbrv': 'Full Expansion Name', keep abbreviations lower case for less headaches
              const expacAbbreviations: any = {
                'arr': 'A Realm Reborn',
                'hw': 'Heavensward',
                'sb': 'Stormblood',
                'shb': 'Shadowbringers'
              };
              //A minor bit of future proofing; if new expansions are added they can be filtered without an abbreviation
              const allExpansions: string[] = uniq(this.lazyData.patches.map(p => p.ExName));
              //Condense the above object's keys and the array into a string 'ARR|A Realm Reborn|HW|Heavensward' etc...
              const expacRegexString: string = allExpansions.concat(Object.keys(expacAbbreviations)).join('|');
              const expacRegex: RegExp = new RegExp(`(expac|expansion):(${expacRegexString})`, 'i');

              const expacMatches: string[] = expacRegex.exec(processedSearch);
              if (expacMatches && expacMatches[2]) {
                processedSearch = processedSearch.replace(expacRegex, '');
                //Find data matching either a full expansion's name, or an abbreviation we defined above
                const expansion: any = this.lazyData.patches.find(p => {
                  return p.ExName.toLowerCase() === expacMatches[2].toLowerCase() || p.ExName === expacAbbreviations[expacMatches[2].toLowerCase()];
                });
                if (expansion) {
                  //Find the patch this item was released in, and then get that patch's expansion
                  const itemExpansion: any = this.lazyData.patches.find(p => {
                    return p.ID === this.lazyData.data.itemPatch[item.itemId];
                  });

                  //We test if false and return false here instead of the inverse so that we can continue through the rest of our search
                  if (!itemExpansion || itemExpansion.ExVersion !== expansion.ExVersion) {
                    return false;
                  }
                }
              }

              //Return if item matches all search criteria
              return processedSearch.split(' ').every(fragment => {
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
              private i18n: I18nToolsService, private lazyData: LazyDataService) {
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
