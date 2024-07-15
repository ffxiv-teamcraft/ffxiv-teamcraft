import { AbstractItemDetailsExtractor } from './abstract-item-details-extractor';
import { DataType, I18nName, TRADE_SOURCES_PRIORITIES, TradeNpc, TradeSource } from '@ffxiv-teamcraft/types';
import { uniqBy } from 'lodash';
import { LazyShop } from '@ffxiv-teamcraft/data/model/lazy-shop';
import { StaticData } from '../../static-data';

export class TradeSourcesExtractor extends AbstractItemDetailsExtractor<TradeSource[]> {
  specialShopNames = this.requireLazyFile('specialShopNames');

  topicSelectNames = this.requireLazyFile('topicSelectNames');

  gilShopNames = this.requireLazyFile('gilShopNames');

  gcNames = this.requireLazyFile('gcNames');

  hwdInspections = this.requireLazyFile('hwdInspections');

  collectables = this.requireLazyFile('collectables');

  npcs = this.requireLazyFile('npcs');

  collectablesShopItemGroup = this.requireLazyFile('collectablesShopItemGroup');

  shops = this.requireLazyFile('shops');

  itemPatches = this.requireLazyFile('itemPatch');

  itemNames = this.requireLazyFile('items');

  patches = this.requireLazyFile('patchNames');


  doExtract(itemId: number): TradeSource[] {
    const inspection = this.hwdInspections.find(row => {
      return row.receivedItem === itemId;
    });
    // reverse so we start from the end, finding newer trades first, to avoid using obsolete materials as sources
    const collectableReward = Object.entries<any>(this.collectables).reverse().find(([, c]) => {
      return c.reward === itemId;
    });
    if (inspection) {
      const npc: TradeNpc = {
        id: 1031693,
        zoneId: 1647,
        mapId: 584,
        coords: {
          x: 10.8,
          y: 14.0
        }
      };
      return [{
        npcs: [npc],
        trades: [{
          currencies: [
            {
              id: inspection.requiredItem,
              amount: inspection.amount
            }
          ],
          items: [
            {
              id: inspection.receivedItem,
              amount: inspection.amount
            }
          ]
        }]
      }];
    }
    if (collectableReward) {
      const expansion = this.patches[this.itemPatches[itemId]]?.ex;
      // Specific case for fishing trade goods exchange was collectableReward[1].group === 73 ? 1044740 : 1035014, keeping it here just in case
      let npc = {
        2: 1045080,
        3: 1027566, // Limbeth
        4: 1045080, // Quinnana
        5: 1045080 // Quinnana
      }[expansion];

      if (this.itemNames[itemId].en.startsWith('Oddly')) {
        npc = 1035014;
      }

      return [{
        type: 'CollectableReward',
        id: +collectableReward[0],
        npcs: [{
          id: npc,
          zoneId: this.npcs[npc].position.zoneid,
          mapId: this.npcs[npc].position.map,
          coords: {
            x: this.npcs[npc].position.x,
            y: this.npcs[npc].position.y
          }
        }],
        shopName: this.collectablesShopItemGroup[collectableReward[1].group],
        trades: ['base', 'mid', 'high'].map(tier => {
          return {
            currencies: [
              {
                id: +collectableReward[0],
                amount: collectableReward[1][tier].quantity || 1,
                minCollectability: collectableReward[1][tier].rating
              }
            ],
            items: [
              {
                id: collectableReward[1].reward,
                amount: collectableReward[1][tier].scrip
              }
            ]
          };
        })
          .filter(row => row.items[0].amount > 0)
      }];
    }

    return uniqBy(this.shops
      .filter(shop => {
        return shop.type !== 'GilShop' && shop.trades.some(t => t.items.some(i => i.id === itemId) && t.currencies.some(c => TRADE_SOURCES_PRIORITIES[c.id] !== 0));
      })
      .filter((shop, i, array) => {
        return shop.npcs.length > 0 || array.every(s => s.npcs.length === 0);
      })
      .map(shop => {
        return {
          id: shop.id,
          type: shop.type,
          shopName: this.getName(shop),
          npcs: shop.npcs.map(npcId => {
            const npc: TradeNpc = {
              id: npcId
            };
            const npcEntry = this.npcs[npcId];
            if (npcEntry && npcEntry.position) {
              npc.coords = { x: npcEntry.position.x, y: npcEntry.position.y };
              npc.zoneId = npcEntry.position.zoneid;
              npc.mapId = npcEntry.position.map;
            }
            if (npcEntry && npcEntry.festival) {
              npc.festival = npcEntry.festival;
            }
            return npc;
          }),
          trades: shop.trades.filter(trade => {
            return trade.items.some(i => i.id === itemId);
          })
        };
      })
      .sort((a,b) => {
        return b.npcs[0]?.mapId - a.npcs[0]?.mapId;
      }), shop => {
      return `${shop.npcs.map(npc => `${npc.id}|${npc.zoneId}`).join(':')}:${JSON.stringify(shop.trades)}`;
    });
  }

  private getName(shop: LazyShop): I18nName {
    let name: I18nName;
    switch (shop.type) {
      case 'GilShop':
        name = this.gilShopNames[shop.id];
        break;
      case 'SpecialShop':
        if (shop.topicSelectId) {
          name = Object.keys(this.specialShopNames[shop.id]).reduce((acc, key) => {
            return {
              ...acc,
              [key]: `${this.specialShopNames[key]} - ${this.topicSelectNames[shop.topicSelectId]}`
            };
          }, {} as I18nName);
        }
        name = this.specialShopNames[shop.id];
        break;
      case 'GCShop':
        name = this.gcNames[shop.gc];
        break;
    }
    if (!name || name?.en === '' && shop.npcs.length > 0) {
      const npcWithTitle = shop.npcs.find(npc => {
        return this.npcs[npc].title?.en !== '';
      });
      return npcWithTitle ? this.npcs[npcWithTitle].title : name;
    }
    return name;
  }

  getDataType(): DataType {
    return DataType.TRADE_SOURCES;
  }

}
