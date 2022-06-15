import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { groupBy } from 'lodash';
import { BehaviorSubject, combineLatest, interval, Observable } from 'rxjs';
import { first, map, shareReplay, startWith, switchMap, tap } from 'rxjs/operators';
import { AuthFacade } from '../../../+state/auth.facade';
import { Retainer, RetainersService } from '../../../core/electron/retainers.service';
import { InventoryService } from '../../../modules/inventory/inventory.service';
import { SettingsService } from '../../../modules/settings/settings.service';
import { ContainerType } from '../../../model/user/inventory/container-type';
import { UniversalisService } from '../../../core/api/universalis.service';
import { LocalStorageBehaviorSubject } from '../../../core/rxjs/local-storage-behavior-subject';

interface RetainerPriceEntry {
  lowest: number,
  lowestSameQuantity: number,
  notFound?: boolean,
  diff: number
}

interface RetainerPrices {
  updated: number;
  prices: Record<string, RetainerPriceEntry>;
}

const LS_KEY = 'retainers:prices';

@Component({
  selector: 'app-retainers',
  templateUrl: './retainers.component.html',
  styleUrls: ['./retainers.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RetainersComponent {

  static FETCH_COOLDOWN = 2 * 3600 * 1000; //2h

  panelsState$ = new LocalStorageBehaviorSubject('retainers:panels', {});

  loading = true;

  retainersPrices$ = new BehaviorSubject<RetainerPrices>(JSON.parse(localStorage.getItem(LS_KEY) || '{"prices":{}}'));

  fetchStatus$ = this.retainersPrices$.pipe(
    switchMap(prices => {
      return interval(10000).pipe(
        startWith(0),
        map(() => {
          return {
            canFetch: !prices.updated || (Date.now() - prices.updated) > RetainersComponent.FETCH_COOLDOWN,
            lastFetch: new Date(prices.updated)
          };
        })
      );
    })
  );

  display$: Observable<{ characterName: string, server: string, retainers: Retainer[] }[]> =
    combineLatest([this.retainersService.retainers$, this.auth.characterEntries$]).pipe(
      map(([retainers, characters]) => {
        const indexed = groupBy(retainers, 'character');
        return Object.entries(indexed)
          .map(([contentId, charRetainers]) => {
            const characterEntry = characters.find(c => c.contentId === contentId);
            return {
              characterName: characterEntry ? characterEntry.character.Character.Name : 'Unknown',
              server: characterEntry ? characterEntry.character.Character.Server : 'Unknown',
              retainers: charRetainers as any[]
            };
          });
      }),
      shareReplay({ bufferSize: 1, refCount: true }),
      switchMap(display => {
        return combineLatest([this.inventoryService.inventory$, this.retainersPrices$]).pipe(
          switchMap(([inventory, retainerPrices]) => {
            const displayWithInventory = display.map(row => {
              row.retainers = row.retainers.map(retainer => {
                const marketItems = Object.values(inventory.items[inventory.contentId][`${retainer.name}:${ContainerType.RetainerMarket}`] || {});
                return {
                  ...retainer,
                  totalSellingPrice: marketItems.reduce((acc, item) => acc + item.unitMbPrice * item.quantity, 0),
                  marketItems: marketItems
                    .map(entry => {
                      return {
                        ...entry,
                        mbStatus: retainerPrices.prices[`${row.characterName}:${retainer.name}:${entry.itemId}!${entry.unitMbPrice}`]
                      };
                    })
                };
              });
              return row;
            });
            return interval(1000).pipe(
              map(() => {
                return displayWithInventory
                  .map(row => {
                    row.retainers = row.retainers.filter(retainer => !!retainer.name && retainer.level > 0)
                      .sort((a, b) => a.order - b.order)
                      .map(retainer => {
                        return {
                          ...retainer,
                          taskDone: retainer.taskComplete <= Date.now() / 1000,
                          remainingTime: retainer.taskComplete - Math.floor(Date.now() / 1000)
                        };
                      });
                    return row;
                  });
              })
            );
          })
        );
      }),
      tap(() => this.loading = false)
    );

  constructor(private retainersService: RetainersService, public translate: TranslateService,
              public settings: SettingsService, private auth: AuthFacade,
              private inventoryService: InventoryService, private universalis: UniversalisService) {
  }

  checkPrices(characterName: string, server: string, retainers: Retainer[]): void {
    this.retainersPrices$.next({
      ...this.retainersPrices$.value,
      updated: Date.now()
    });
    if (Date.now() - this.retainersPrices$.value.updated > RetainersComponent.FETCH_COOLDOWN) {
      return;
    }
    this.loading = true;
    combineLatest(retainers
      .filter(retainer => retainer.marketItems?.length > 0)
      .map(retainer => {
        return this.universalis.getServerPrices(server, ...retainer.marketItems.map(e => e.itemId)).pipe(
          map(prices => {
            return retainer.marketItems.map((entry, index) => {
              const listing = prices.find(p => p.ItemId === entry.itemId);
              const sortedPrices = listing.Prices.filter((p: any) => p.retainerName !== retainer.name)
                .sort((a, b) => a.PricePerUnit - b.PricePerUnit);
              const lowest = sortedPrices[0]?.PricePerUnit;
              return {
                itemId: entry.itemId,
                unitMbPrice: entry.unitMbPrice,
                lowestSameQuantity: sortedPrices.filter(l => {
                  return Math.abs(l.Quantity - entry.quantity) / entry.quantity <= 0.1;
                })[0]?.PricePerUnit,
                lowest,
                diff: Math.floor(100 * (entry.unitMbPrice - lowest) / entry.unitMbPrice),
                notFound: [listing.Prices].every((l: any) => l.retainerName !== retainer.name)
              };
            });
          }),
          map(prices => {
            return {
              retainerName: retainer.name,
              prices
            };
          })
        );
      })
    ).pipe(
      first()
    ).subscribe((results: any[]) => {
      const pricesState = this.retainersPrices$.value;
      results.forEach(row => {
        row.prices.forEach(priceEntry => {
          const { itemId, ...entry } = priceEntry;
          pricesState.prices[`${characterName}:${row.retainerName}:${itemId}!${entry.unitMbPrice}`] = entry;
        });
      });
      this.retainersPrices$.next({
        ...pricesState
      });
      localStorage.setItem(LS_KEY, JSON.stringify(pricesState));
      this.loading = false;
    });
  }

  resetRetainers(): void {
    this.retainersService.resetRetainers();
  }

  getDiffTagColor(diff: number): string {
    if (diff <= 0) {
      return 'darkgreen';
    } else {
      return '#f50';
    }
  }

  updatePanelsState(state: any, retainerName: string, newPanelState: boolean): void {
    this.panelsState$.next({ ...state, [retainerName]: newPanelState });
  }

  trackByRow(index: number, row: any): string {
    return row.characterName;
  }

  trackByRetainer(index: number, row: any): string {
    return row.name;
  }

  trackByItemId(index: number, row: any): string {
    return row.itemId;
  }

}
