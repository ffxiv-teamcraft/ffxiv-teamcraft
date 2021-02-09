import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MarketboardItem } from './market/marketboard-item';
import { combineLatest, Observable, of } from 'rxjs';
import { bufferCount, catchError, distinctUntilChanged, filter, first, map, shareReplay, switchMap } from 'rxjs/operators';
import { LazyDataService } from '../data/lazy-data.service';
import { AuthFacade } from '../../+state/auth.facade';
import { IpcService } from '../electron/ipc.service';
import { SettingsService } from '../../modules/settings/settings.service';
import * as _ from 'lodash';
import { MarketBoardItemListing, MarketBoardItemListingHistory, MarketBoardSearchResult, MarketTaxRates, PlayerSetup } from '@ffxiv-teamcraft/pcap-ffxiv';

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
    distinctUntilChanged()
  );

  constructor(private http: HttpClient, private lazyData: LazyDataService, private authFacade: AuthFacade,
              private ipc: IpcService, private settings: SettingsService) {
  }

  public getDCPrices(dc: string, ...itemIds: number[]): Observable<MarketboardItem[]> {
    return this.http.get<any>(`https://universalis.app/api/${dc}/${itemIds.join(',')}`)
      .pipe(
        catchError(() => of([])),
        map(response => {
          const data = response.items || [response];
          return data.map(res => {
            const item: Partial<MarketboardItem> = {
              ID: res.worldID,
              ItemId: res.itemID,
              History: [],
              Prices: [],
              Updated: res.lastUploadTime
            };
            item.Prices = res.listings.map(listing => {
              return {
                Server: listing.worldName,
                PricePerUnit: Math.ceil(listing.pricePerUnit / 1.05),
                PriceTotal: listing.total,
                IsHQ: listing.hq,
                Quantity: listing.quantity
              };
            });
            item.History = res.recentHistory.map(listing => {
              return {
                Server: listing.worldName,
                PricePerUnit: Math.ceil(listing.pricePerUnit / 1.05),
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
    const chunks = _.chunk(itemIds, 100);
    return combineLatest(chunks.map(chunk => {
      return this.http.get<any>(`https://universalis.app/api/${dc}/${chunk.join(',')}`)
        .pipe(
          catchError(() => of([])),
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
                  return listing.worldName && listing.worldName.toLowerCase() === server.toLowerCase();
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
                  return listing.worldName && listing.worldName.toLowerCase() === server.toLowerCase();
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
    })).pipe(
      map(res => {
        return [].concat.apply([], res);
      })
    );
  }

  public initCapture(): void {
    this.ipc.marketBoardSearchResult$.subscribe((searchResults) => {
      if (this.settings.enableUniversalisSourcing) {
        this.handleMarketboardSearchResult(searchResults);
      }
    });
    this.ipc.marketboardListingCount$
      .pipe(
        switchMap(packet => {
          return this.ipc.marketboardListing$.pipe(bufferCount(Math.ceil(packet.quantity / 10)));
        })
      )
      .subscribe(listings => {
        if (this.settings.enableUniversalisSourcing) {
          this.handleMarketboardListingPackets(listings);
        }
      });
    this.ipc.marketboardListingHistory$.subscribe(packet => {
      if (this.settings.enableUniversalisSourcing) {
        this.handleMarketboardListingHistory(packet);
      }
    });
    this.ipc.marketTaxRatePackets$.subscribe(packet => {
      if (this.settings.enableUniversalisSourcing) {
        this.uploadMarketTaxRates(packet);
      }
    });
    this.ipc.playerSetupPackets$.subscribe(packet => {
      if (this.settings.enableUniversalisSourcing) {
        this.uploadCid(packet);
      }
    });
  }

  public handleMarketboardSearchResult(packet: MarketBoardSearchResult): void {
    combineLatest([this.cid$, this.worldId$]).pipe(
      first(),
      switchMap(([cid, worldId]) => {
        const data = {
          worldID: worldId,
          uploaderID: cid,
          itemIDs: _.compact(packet.items.map((item) => {
            if (item.itemCatalogId && !item.quantity) {
              return item.itemCatalogId;
            }
          })),
          op: {
            listings: -1
          }
        };
        return this.http.post('https://us-central1-ffxivteamcraft.cloudfunctions.net/universalis-publisher', data, {
          headers: new HttpHeaders().append('Content-Type', 'application/json')
        });
      })
    ).subscribe();
  }

  public handleMarketboardListingPackets(packets: MarketBoardItemListing[]): void {
    // TODO Fix once the packet is properly done in pcap-ffxiv
    // combineLatest([this.cid$, this.worldId$]).pipe(
    //   first(),
    //   switchMap(([cid, worldId]) => {
    //     const data = {
    //       worldID: worldId,
    //       itemID: packets[0].itemId,
    //       uploaderID: cid,
    //       listings: packets.reduce((listings, packet) => {
    //         return [
    //           ...listings,
    //           ...packet.listings.map(item => {
    //             return {
    //               listingID: item.listingId,
    //               hq: item.hq,
    //               materia: item.materia.map((materia, index) => {
    //                 return {
    //                   materiaId: materia,
    //                   slotId: index
    //                 };
    //               }),
    //               pricePerUnit: item.pricePerUnit,
    //               quantity: item.quantity,
    //               total: item.quantity * item.pricePerUnit,
    //               retainerID: item.retainerId,
    //               retainerName: item.retainerName,
    //               retainerCity: item.city,
    //               creatorName: item.playerName,
    //               creatorID: item.artisanId,
    //               sellerID: item.retainerOwnerId,
    //               lastReviewTime: item.lastReviewTime,
    //               stainID: item.dyeId
    //             };
    //           })];
    //       }, [])
    //     };
    //     return this.http.post('https://us-central1-ffxivteamcraft.cloudfunctions.net/universalis-publisher', data, {
    //       headers: new HttpHeaders().append('Content-Type', 'application/json')
    //     });
    //   })
    // ).subscribe();
  }

  public handleMarketboardListingHistory(packet: MarketBoardItemListingHistory): void {
    combineLatest([this.cid$, this.worldId$]).pipe(
      first(),
      switchMap(([cid, worldId]) => {
        const data = {
          worldID: worldId,
          itemID: packet.itemCatalogId,
          uploaderID: cid,
          entries: packet.listings.map((entry) => {
            return {
              hq: entry.isHq,
              pricePerUnit: entry.salePrice,
              quantity: entry.quantity,
              buyerName: entry.buyerName,
              onMannequin: entry.onMannequin,
              timestamp: entry.purchaseTime
            };
          })
        };
        return this.http.post('https://us-central1-ffxivteamcraft.cloudfunctions.net/universalis-publisher', data, {
          headers: new HttpHeaders().append('Content-Type', 'application/json')
        });
      })
    ).subscribe();
  }

  public uploadMarketTaxRates(packet: MarketTaxRates): void {
    /**
     * Doing some light client-side validation is less work than going
     * around and versioning to block this packet. This isn't retroactive,
     * but will hopefully reduce incidences of bad tax rate data getting
     * through in the future.
     */
    if (packet.limsaLominsa > 7 ||
      packet.gridania > 7 ||
      packet.uldah > 7 ||
      packet.ishgard > 7 ||
      packet.kugane > 7 ||
      packet.crystarium > 7)
      return;

    combineLatest([this.cid$, this.worldId$]).pipe(
      first(),
      switchMap(([cid, worldId]) => {
        const data = {
          worldID: worldId,
          uploaderID: cid,
          marketTaxRates: {
            limsaLominsa: packet.limsaLominsa,
            gridania: packet.gridania,
            uldah: packet.uldah,
            ishgard: packet.ishgard,
            kugane: packet.kugane,
            crystarium: packet.crystarium
          }
        };
        return this.http.post('https://us-central1-ffxivteamcraft.cloudfunctions.net/universalis-publisher', data, {
          headers: new HttpHeaders().append('Content-Type', 'application/json')
        });
      })
    ).subscribe();
  }

  public uploadCid(packet: PlayerSetup): void {
    const data = {
      contentID: packet.contentId.toString(),
      characterName: packet.name
    };
    this.http.post('https://us-central1-ffxivteamcraft.cloudfunctions.net/universalis-publisher', data, {
      headers: new HttpHeaders().append('Content-Type', 'application/json')
    }).subscribe();
  }
}
