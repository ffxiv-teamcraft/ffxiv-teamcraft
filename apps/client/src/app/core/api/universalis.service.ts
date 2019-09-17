import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MarketboardItem } from '@xivapi/angular-client/src/model/schema/market/marketboard-item';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { LazyDataService } from '../data/lazy-data.service';

@Injectable({ providedIn: 'root' })
export class UniversalisService {

  constructor(private http: HttpClient, private lazyData: LazyDataService) {
  }

  public getDCPrices(itemId: number, dc: string): Observable<MarketboardItem> {
    return this.http.get<any>(`https://universalis.app/api/${dc}/${itemId}`)
      .pipe(
        map(res => {
          const item: Partial<MarketboardItem> = {
            ID: res[Object.keys(res)[0]].ID,
            ItemId: res[Object.keys(res)[0]].ItemId,
            History: [],
            Prices: []
          };
          item.Prices = res.listings.map(listing => {
            return {
              Server: listing.worldName,
              PricePerUnit: listing.pricePerUnit,
              ProceTotal: listing.total,
              IsHQ: listing.hq,
              Quantity: listing.quantity
            };
          });
          item.History = res.recentHistory.map(listing => {
            return {
              Server: listing.worldName,
              PricePerUnit: listing.pricePerUnit,
              ProceTotal: listing.total,
              IsHQ: listing.hq,
              Quantity: listing.quantity
            };
          });
          return item as MarketboardItem;
        })
      );
  }

  public getServerPrices(itemId: number, server: string): Observable<MarketboardItem> {
    const dc = Object.keys(this.lazyData.datacenters).find(key => {
      return this.lazyData.datacenters[key].indexOf(server) > -1;
    });
    return this.http.get<any>(`https://universalis.app/api/${dc}/${itemId}`)
      .pipe(
        map(res => {
          const item: Partial<MarketboardItem> = {
            ID: res[Object.keys(res)[0]].ID,
            ItemId: res[Object.keys(res)[0]].ItemId,
            History: [],
            Prices: []
          };
          item.Prices = (res.listings || [])
            .filter(listing => {
              return listing.worlName.toLowerCase() === server.toLowerCase();
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
              return listing.worlName.toLowerCase() === server.toLowerCase();
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
        })
      );
  }
}
