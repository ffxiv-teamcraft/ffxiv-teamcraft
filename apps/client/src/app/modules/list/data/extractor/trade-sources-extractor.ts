import { AbstractExtractor } from './abstract-extractor';
import { TradeSource } from '../../model/trade-source';
import { ItemData } from '../../../../model/garland-tools/item-data';
import { DataType } from '../data-type';
import { Trade } from '../../model/trade';
import { Item } from '../../../../model/garland-tools/item';
import { TradeNpc } from '../../model/trade-npc';
import { TradeEntry } from '../../model/trade-entry';
import { GarlandToolsService } from '../../../../core/api/garland-tools.service';
import { LazyDataService } from '../../../../core/data/lazy-data.service';

export class TradeSourcesExtractor extends AbstractExtractor<TradeSource[]> {

  constructor(gt: GarlandToolsService, private lazyData: LazyDataService) {
    super(gt);
  }

  public isAsync(): boolean {
    return false;
  }

  public getDataType(): DataType {
    return DataType.TRADE_SOURCES;
  }

  protected canExtract(item: Item): boolean {
    return item.tradeShops !== undefined
      || this.lazyData.data.hwdInspections.some(row => {
        return row.receivedItem === item.id;
      })
      || Object.entries<any>(this.lazyData.data.collectables).some(([, c]) => {
        return c.reward === item.id;
      });
  }

  protected doExtract(item: Item, itemData: ItemData): TradeSource[] {
    const inspection = this.lazyData.data.hwdInspections.find(row => {
      return row.receivedItem === item.id;
    });
    const collectableReward = Object.entries<any>(this.lazyData.data.collectables).find(([, c]) => {
      return c.reward === item.id;
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
        shopName: '',
        trades: [{
          currencies: [
            {
              id: inspection.requiredItem,
              amount: inspection.amount,
              hq: false,
              icon: this.lazyData.data.itemIcons[inspection.requiredItem]
            }
          ],
          items: [
            {
              id: inspection.receivedItem,
              amount: inspection.amount,
              hq: false,
              icon: this.lazyData.data.itemIcons[inspection.receivedItem]
            }
          ]
        }]
      }];
    }
    if (collectableReward) {
      return [{
        npcs: [{
          id: 1032900,
          zoneId: this.lazyData.data.npcs[1032900].position.zoneid,
          mapId: this.lazyData.data.npcs[1032900].position.map,
          coords: {
            x: this.lazyData.data.npcs[1032900].position.x,
            y: this.lazyData.data.npcs[1032900].position.y
          }
        }],
        shopName: this.lazyData.data.collectablesShopItemGroup[collectableReward[1].group],
        trades: ['base', 'mid', 'high'].map(tier => {
          return {
            currencies: [
              {
                id: +collectableReward[0],
                amount: 1,
                hq: false,
                icon: this.lazyData.data.itemIcons[+collectableReward[0]]
              }
            ],
            items: [
              {
                id: collectableReward[1].reward,
                amount: collectableReward[1][tier].scrip,
                hq: false,
                icon: this.lazyData.data.itemIcons[collectableReward[1].reward]
              }
            ]
          };
        })
      }];
    }
    return item.tradeShops.map(ts => {
      return {
        npcs: ts.npcs.map(npcId => {
          const npc: TradeNpc = {
            id: npcId
          };
          const npcEntry = this.lazyData.data.npcs[npcId];
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
        trades: ts.listings.map(row => {
          return <Trade>{
            currencies: row.currency.filter(entry => {
              return itemData.getPartial(entry.id, 'item') !== undefined;
            }).map(currency => {
              const currencyPartial = itemData.getPartial(currency.id, 'item').obj;
              return <TradeEntry>{
                id: currencyPartial.i,
                icon: currencyPartial.c,
                amount: currency.amount,
                hq: currency.hq === 1
              };
            }),
            items: row.item.map(tradeItem => {
              const itemPartialFetch = itemData.getPartial(tradeItem.id, 'item');
              if (itemPartialFetch !== undefined) {
                const itemPartial = itemPartialFetch.obj;
                return <TradeEntry>{
                  id: itemPartial.i,
                  icon: itemPartial.c,
                  amount: tradeItem.amount,
                  hq: tradeItem.hq === 1
                };
              } else if (+tradeItem.id === item.id) {
                return <TradeEntry>{
                  id: item.id,
                  icon: item.icon,
                  amount: tradeItem.amount,
                  hq: tradeItem.hq === 1
                };
              }
              return undefined;
            })
              .filter(res => res !== undefined)
          };
        }),
        shopName: ts.shop
      };
    });
  }

}
