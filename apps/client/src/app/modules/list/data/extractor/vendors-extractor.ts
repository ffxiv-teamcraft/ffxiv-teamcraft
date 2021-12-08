import { AbstractExtractor } from './abstract-extractor';
import { DataType } from '../data-type';
import { Vendor } from '../../model/vendor';
import { uniqBy } from 'lodash';
import { LazyDataFacade } from '../../../../lazy-data/+state/lazy-data.facade';
import { combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Vector2 } from '../../../../core/tools/vector2';

export class VendorsExtractor extends AbstractExtractor<Vendor[]> {

  constructor(private lazyData: LazyDataFacade) {
    super();
  }

  public isAsync(): boolean {
    return true;
  }

  public getDataType(): DataType {
    return DataType.VENDORS;
  }

  protected doExtract(itemId: number): Observable<Vendor[]> {
    return combineLatest([
      this.lazyData.getEntry('npcs'),
      this.lazyData.getEntry('gilShopNames'),
      this.lazyData.getEntry('shops')
    ]).pipe(
      map(([npcs, gilshopNames, shops]) => {
        return uniqBy(shops.filter(shop => {
          return shop.type === 'GilShop' && shop.trades.some(t => t.items.some(i => i.id === itemId));
        }).map(shop => {
          const trade = shop.trades.find(t => t.items.some(i => i.id === itemId));
          return shop.npcs.map(npc => {
            const npcEntry = npcs[npc];
            const vendor: Vendor = {
              npcId: npc,
              price: trade.currencies[0].amount,
              shopName: gilshopNames[shop.id]
            };
            if (npcEntry) {
              const npcPosition = npcEntry.position;
              if (npcPosition) {
                vendor.coords = { x: Math.floor((npcPosition as Vector2).x * 10) / 10, y: Math.floor((npcPosition as Vector2).y * 10) / 10 };
                vendor.zoneId = npcPosition.zoneid;
                vendor.mapId = npcPosition.map;
              }
              vendor.festival = npcEntry.festival || 0;
            }
            return vendor;
          });
        }).flat(), v => {
          return `${npcs[v.npcId]?.en}:${v.mapId}`;
        });
      })
    );
  }

}
