import { AbstractExtractor } from './abstract-extractor';
import { TradeSource } from '../../model/trade-source';
import { ItemData } from '../../../../model/garland-tools/item-data';
import { DataType } from '../data-type';
import { Trade } from '../../model/trade';
import { Item } from '../../../../model/garland-tools/item';

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
    const tradeSources: TradeSource [] = [];
    for (const ts of item.tradeShops) {
      const tradeSource: TradeSource = {
        npcId: +ts,
        trades: [],
        shopName: ts.shop
      };
      for (const npcId of ts.npcs) {
        const partial = itemData.getPartial(npcId.toString(), 'npc');
        if (partial.c !== undefined && partial.i !== undefined && partial.a !== undefined) {
          tradeSource.coords = {
            x: partial.c[0],
            y: partial.c[1]
          };
          tradeSource.zoneId = partial.i;
          tradeSource.areaId = partial.a;
        }
      }
      for (const row of ts.listings) {
        const currencyPartial = itemData.getPartial(row.currency[0].id, 'item').obj;
        const trade: Trade = {
          itemIcon: item.icon,
          itemAmount: row.item[0].amount,
          itemId: item.id,
          itemHQ: row.item[0].hq === 1,
          currencyIcon: currencyPartial.c,
          currencyAmount: row.currency[0].amount,
          currencyId: row.currency[0].id
        };
        tradeSource.trades.push(trade);
      }
      tradeSources.push(tradeSource);
    }
    return tradeSources;
  }

}
