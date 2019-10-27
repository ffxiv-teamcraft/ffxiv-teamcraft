import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MarketboardItem } from '@xivapi/angular-client/src/model/schema/market/marketboard-item';
import { combineLatest, Observable } from 'rxjs';
import { buffer, debounceTime, distinctUntilChanged, filter, first, map, shareReplay, switchMap } from 'rxjs/operators';
import { LazyDataService } from '../data/lazy-data.service';
import { AuthFacade } from '../../+state/auth.facade';
import { IpcService } from '../electron/ipc.service';
import { SettingsService } from '../../modules/settings/settings.service';

@Injectable({ providedIn: 'root' })
export class UniversalisService {

  private cid$: Observable<string> = this.authFacade.user$.pipe(
    map(user => user.cid),
    filter(cid => cid !== undefined),
    distinctUntilChanged(),
    shareReplay(1)
  );

  private worldId$: Observable<number> = this.authFacade.user$.pipe(
    map(user => user.world),
    filter(world => world !== undefined),
    distinctUntilChanged(),
    shareReplay(1)
  );

  constructor(private http: HttpClient, private lazyData: LazyDataService, private authFacade: AuthFacade,
              private ipc: IpcService, private settings: SettingsService) {
  }

  public getDCPrices(dc: string, ...itemIds: number[]): Observable<MarketboardItem[]> {
    return this.http.get<any>(`https://universalis.app/api/${dc}/${itemIds.join(',')}`)
      .pipe(
        map(response => {
          const data = response.items || [response];
          return data.map(res => {
            const item: Partial<MarketboardItem> = {
              ID: res.worldID,
              ItemId: res.itemID,
              History: [],
              Prices: []
            };
            item.Prices = res.listings.map(listing => {
              return {
                Server: listing.worldName,
                PricePerUnit: listing.pricePerUnit,
                PriceTotal: listing.total,
                IsHQ: listing.hq,
                Quantity: listing.quantity
              };
            });
            item.History = res.recentHistory.map(listing => {
              return {
                Server: listing.worldName,
                PricePerUnit: listing.pricePerUnit,
                PriceTotal: listing.total,
                IsHQ: listing.hq,
                Quantity: listing.quantity,
                PurchaseDate: listing.timestamp
              };
            });
            return item as MarketboardItem;
          });
        }),
        shareReplay(1)
      );
  }

  public getServerPrices(server: string, ...itemIds: number[]): Observable<MarketboardItem[]> {
    const dc = Object.keys(this.lazyData.datacenters).find(key => {
      return this.lazyData.datacenters[key].indexOf(server) > -1;
    });
    return this.http.get<any>(`https://universalis.app/api/${dc}/${itemIds.join(',')}`)
      .pipe(
        map(response => {
          const data = response.items || [response];
          return data.map(res => {
            const item: Partial<MarketboardItem> = {
              ID: res.worldID,
              ItemId: res.itemID,
              History: [],
              Prices: []
            };
            item.Prices = (res.listings || [])
              .filter(listing => {
                return listing.worldName.toLowerCase() === server.toLowerCase();
              })
              .map(listing => {
                return {
                  Server: listing.worldName,
                  PricePerUnit: listing.pricePerUnit,
                  ProceTotal: listing.total,
                  IsHQ: listing.hq,
                  Quantity: listing.quantity
                };
              });
            item.History = (res.recentHistory || [])
              .filter(listing => {
                return listing.worldName.toLowerCase() === server.toLowerCase();
              })
              .map(listing => {
                return {
                  Server: listing.worldName,
                  PricePerUnit: listing.pricePerUnit,
                  ProceTotal: listing.total,
                  IsHQ: listing.hq,
                  Quantity: listing.quantity
                };
              });
            return item as MarketboardItem;
          });
        })
      );
  }

  public initCapture(): void {
    this.ipc.marketboardListing$
      .pipe(
        buffer(this.ipc.marketboardListing$.pipe(debounceTime(2000))),
        filter(packets => packets.length > 0)
      )
      .subscribe(listings => {
        if (this.settings.enableUniversalisSourcing) {
          this.handleMarketboardListingPackets(listings);
        }
      });
    this.ipc.marketboardListingHistory$
      .pipe(
        buffer(this.ipc.marketboardListingHistory$.pipe(debounceTime(2000))),
        filter(packets => packets.length > 0)
      )
      .subscribe(listings => {
        if (this.settings.enableUniversalisSourcing) {
          this.handleMarketboardListingHistoryPackets(listings);
        }
      });
    this.ipc.cid$.subscribe(packet => {
      if (this.settings.enableUniversalisSourcing) {
        this.uploadCid(packet);
      }
    });
  }

  public handleMarketboardListingPackets(packets: any[]): void {
    combineLatest([this.cid$, this.worldId$]).pipe(
      first(),
      switchMap(([cid, worldId]) => {
        const data = {
          worldID: worldId,
          itemID: packets[0].itemID,
          uploaderID: cid,
          listings: packets.reduce((listings, packet) => {
            return [
              ...listings,
              ...packet.listings.map(item => {
                return {
                  listingID: item.listingID,
                  hq: item.hq === 1,
                  materia: item.materia.map((materia, index) => {
                    return {
                      materiaId: materia,
                      slotId: index
                    };
                  }),
                  pricePerUnit: item.pricePerUnit,
                  totalTax: item.totalTax,
                  quantity: item.quantity,
                  total: item.total,
                  retainerID: item.retainerID,
                  retainerName: item.retainerName,
                  retainerCity: item.city,
                  creatorName: item.playerName,
                  creatorID: item.artisanID,
                  sellerID: item.retainerOwnerID,
                  lastReviewTime: item.lastReviewTime,
                  stainID: item.dyeID
                };
              })];
          }, [])
        };
        return this.http.post('https://us-central1-ffxivteamcraft.cloudfunctions.net/universalis-publisher', data, {
          headers: new HttpHeaders().append('Content-Type', 'application/json')
        });
      })
    ).subscribe();
  }

  public handleMarketboardListingHistoryPackets(packets: any[]): void {
    combineLatest([this.cid$, this.worldId$]).pipe(
      first(),
      switchMap(([cid, worldId]) => {
        const data = {
          worldID: worldId,
          itemID: packets[0].itemID,
          uploaderID: cid,
          entries: packets.reduce((listings, packet) => {
            return [
              ...listings,
              ...packet.listings
                .map((item) => {
                  return {
                    hq: item.hs,
                    pricePerUnit: item.salePrice,
                    quantity: item.quantity,
                    total: item.salePrice * item.quantity,
                    buyerName: item.buyerName,
                    onMannequin: item.onMannequin,
                    timestamp: item.purchaseTime
                  };
                })
            ];
          }, [])
        };
        return this.http.post('https://us-central1-ffxivteamcraft.cloudfunctions.net/universalis-publisher', data, {
          headers: new HttpHeaders().append('Content-Type', 'application/json')
        });
      })
    ).subscribe();
  }

  public uploadCid(packet: any): void {
    const data = {
      contentID: packet.contentID,
      characterName: packet.name
    };
    this.http.post('https://us-central1-ffxivteamcraft.cloudfunctions.net/universalis-publisher', data, {
      headers: new HttpHeaders().append('Content-Type', 'application/json')
    }).subscribe();
  }
}
