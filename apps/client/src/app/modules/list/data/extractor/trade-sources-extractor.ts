import { AbstractExtractor } from './abstract-extractor';
import { TradeSource } from '../../model/trade-source';
import { ItemData } from '../../../../model/garland-tools/item-data';
import { DataType } from '../data-type';
import { Trade } from '../../model/trade';
import { Item } from '../../../../model/garland-tools/item';
import { TradeNpc } from '../../model/trade-npc';
import { TradeEntry } from '../../model/trade-entry';

export class TradeSourcesExtractor extends AbstractExtractor<TradeSource[]> {

  constructor() {
    super();
  }

  public isAsync(): boolean {
    return false;
  }

  public getDataType(): DataType {
    return DataType.TRADE_SOURCES;
  }

  protected canExtract(item: Item): boolean {
    return item.tradeShops !== undefined;
  }

  protected doExtract(item: Item, itemData: ItemData): TradeSource[] {
    return item.tradeShops.map(ts => {
      return {
        npcs: ts.npcs.map(npcId => {
          const npc: TradeNpc = { id: npcId };
          const partial = itemData.getPartial(npcId.toString(), 'npc');
          // TODO connect position with xivapi mappy
          if (partial.c !== undefined && partial.i !== undefined && partial.a !== undefined) {
            npc.coords = {
              x: partial.c[0],
              y: partial.c[1]
            };
            npc.zoneId = partial.i;
            npc.areaId = partial.a;
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
