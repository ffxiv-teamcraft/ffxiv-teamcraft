import { AbstractExtractor } from './abstract-extractor';
import { TradeSource } from '../../model/trade-source';
import { ItemData } from '../../../../model/garland-tools/item-data';
import { DataType } from '../data-type';
import { Trade } from '../../model/trade';
import { Item } from '../../../../model/garland-tools/item';
import { TradeNpc } from '../../model/trade-npc';
import { TradeEntry } from '../../model/trade-entry';
import { GarlandToolsService } from '../../../../core/api/garland-tools.service';
import { combineLatest, Observable } from 'rxjs';
import { LazyDataFacade } from '../../../../lazy-data/+state/lazy-data.facade';
import { map } from 'rxjs/operators';

export class TradeSourcesExtractor extends AbstractExtractor<TradeSource[]> {

  constructor(gt: GarlandToolsService, private lazyData: LazyDataFacade) {
    super(gt);
  }

  public isAsync(): boolean {
    return true;
  }

  public getDataType(): DataType {
    return DataType.TRADE_SOURCES;
  }

  protected canExtract(item: Item): boolean {
    return true;
  }

  protected doExtract(item: Item, itemData: ItemData): Observable<TradeSource[]> {
    return combineLatest([
      this.lazyData.getEntry('hwdInspections'),
      this.lazyData.getEntry('collectables'),
      this.lazyData.getEntry('npcs'),
      this.lazyData.getEntry('itemIcons'),
      this.lazyData.getEntry('collectablesShopItemGroup')
    ]).pipe(
      map(([hwdInspections, collectables, npcs, itemIcons, collectablesShopItemGroup]) => {
        const inspection = hwdInspections.find(row => {
          return row.receivedItem === item.id;
        });
        const collectableReward = Object.entries<any>(collectables).find(([, c]) => {
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
                  icon: itemIcons[inspection.requiredItem]
                }
              ],
              items: [
                {
                  id: inspection.receivedItem,
                  amount: inspection.amount,
                  hq: false,
                  icon: itemIcons[inspection.receivedItem]
                }
              ]
            }]
          }];
        }
        if (collectableReward) {
          return [{
            npcs: [{
              id: 1032900,
              zoneId: npcs[1032900].position.zoneid,
              mapId: npcs[1032900].position.map,
              coords: {
                x: npcs[1032900].position.x,
                y: npcs[1032900].position.y
              }
            }],
            shopName: collectablesShopItemGroup[collectableReward[1].group],
            trades: ['base', 'mid', 'high'].map(tier => {
              return {
                currencies: [
                  {
                    id: +collectableReward[0],
                    amount: 1,
                    hq: false,
                    icon: itemIcons[+collectableReward[0]]
                  }
                ],
                items: [
                  {
                    id: collectableReward[1].reward,
                    amount: collectableReward[1][tier].scrip,
                    hq: false,
                    icon: itemIcons[collectableReward[1].reward]
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
              const npcEntry = npcs[npcId];
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
                }).filter(res => res !== undefined)
              };
            }),
            shopName: ts.shop
          };
        });
      })
    );
  }

}
