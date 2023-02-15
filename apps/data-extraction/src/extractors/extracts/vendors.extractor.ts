import { AbstractItemDetailsExtractor } from './abstract-item-details-extractor';
import { DataType, Vendor, Vector2 } from '@ffxiv-teamcraft/types';
import { uniqBy } from 'lodash';

export class VendorsExtractor extends AbstractItemDetailsExtractor<Vendor[]> {
  npcs = this.requireLazyFile('npcs');

  gilShopNames = this.requireLazyFile('gilShopNames');

  shops = this.requireLazyFile('shops');

  monsters = this.requireLazyFile('monsters');


  doExtract(itemId: number): Vendor[] {
    return uniqBy(this.shops.filter(shop => {
      return shop.type === 'GilShop' && shop.trades.some(t => t.items.some(i => i.id === itemId));
    }).map(shop => {
      const trade = shop.trades.find(t => t.items.some(i => i.id === itemId));
      return shop.npcs.map(npc => {
        const vendor: Vendor = {
          npcId: npc,
          price: trade.currencies[0].amount,
          shopName: this.gilShopNames[shop.id]
        };
        if (npc > 1000000) {
          const npcEntry = this.npcs[npc];
          if (npcEntry) {
            const npcPosition = npcEntry.position;
            if (npcPosition) {
              vendor.coords = { x: Math.floor((npcPosition as Vector2).x * 10) / 10, y: Math.floor((npcPosition as Vector2).y * 10) / 10 };
              vendor.zoneId = npcPosition.zoneid;
              vendor.mapId = npcPosition.map;
            }
            vendor.festival = npcEntry.festival || 0;
          }
        } else {
          const monstersEntry = this.monsters[npc];
          if (monstersEntry) {
            const npcPosition = monstersEntry.positions[0];
            if (npcPosition) {
              vendor.coords = { x: Math.floor((npcPosition as Vector2).x * 10) / 10, y: Math.floor((npcPosition as Vector2).y * 10) / 10 };
              vendor.zoneId = npcPosition.zoneid;
              vendor.mapId = npcPosition.map;
            }
          }
        }
        return vendor;
      });
    }).flat(), v => {
      return `${this.npcs[v.npcId]?.en}:${v.mapId}`;
    });
  }

  getDataType(): DataType {
    return DataType.VENDORS;
  }

}
