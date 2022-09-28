import { AbstractExtractor } from './abstract-extractor';
import { TradeSource } from '../../model/trade-source';
import { DataType } from '../data-type';
import { TradeNpc } from '../../model/trade-npc';
import { combineLatest, Observable } from 'rxjs';
import { LazyDataFacade } from '../../../../lazy-data/+state/lazy-data.facade';
import { map } from 'rxjs/operators';
import { safeCombineLatest } from '../../../../core/rxjs/safe-combine-latest';
import { LazyShop } from '../../../../lazy-data/model/lazy-shop';
import { I18nName } from '../../../../model/common/i18n-name';
import { LazyNpc } from '../../../../lazy-data/model/lazy-npc';
import { uniqBy } from 'lodash';
import { TradeIconPipe } from '../../../../pipes/pipes/trade-icon.pipe';


export class TradeSourcesExtractor extends AbstractExtractor<TradeSource[]> {

  constructor(private lazyData: LazyDataFacade) {
    super();
  }

  public isAsync(): boolean {
    return true;
  }

  public getDataType(): DataType {
    return DataType.TRADE_SOURCES;
  }

  protected doExtract(itemId: number): Observable<TradeSource[]> {
    const names$ = combineLatest([
      this.lazyData.getEntry('specialShopNames'),
      this.lazyData.getEntry('topicSelectNames'),
      this.lazyData.getEntry('gilShopNames'),
      this.lazyData.getEntry('gcNames')
    ]).pipe(
      map(([specialShopNames, topicSelectNames, gilShopNames, gcNames]) => {
        return { specialShopNames, topicSelectNames, gilShopNames, gcNames };
      })
    );
    return safeCombineLatest([
      this.lazyData.getEntry('hwdInspections'),
      this.lazyData.getEntry('collectables'),
      this.lazyData.getEntry('npcs'),
      this.lazyData.getEntry('collectablesShopItemGroup'),
      this.lazyData.getEntry('shops'),
      names$
    ]).pipe(
      map(([hwdInspections, collectables, npcs, collectablesShopItemGroup, shops, names]) => {
        const inspection = hwdInspections.find(row => {
          return row.receivedItem === itemId;
        });
        const collectableReward = Object.entries<any>(collectables).find(([, c]) => {
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
                    amount: 1
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
          }];
        }

        const { specialShopNames, topicSelectNames, gilShopNames, gcNames } = names;
        return uniqBy(shops
          .filter(shop => {
            return shop.type !== 'GilShop' && shop.trades.some(t => t.items.some(i => i.id === itemId) && t.currencies.some(c => TradeIconPipe.TRADE_SOURCES_PRIORITIES[c.id] !== 0));
          })
          .filter((shop, i, array) => {
            return shop.npcs.length > 0 || array.every(s => s.npcs.length === 0);
          })
          .map(shop => {
            return {
              id: shop.id,
              type: shop.type,
              shopName: this.getName(shop, specialShopNames, topicSelectNames, gilShopNames, gcNames, npcs),
              npcs: shop.npcs.map(npcId => {
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
              trades: shop.trades.filter(trade => {
                return trade.items.some(i => i.id === itemId);
              })
            };
          }), shop => {
          return `${shop.npcs.map(npc => `${npc.id}|${npc.zoneId}`).join(':')}:${JSON.stringify(shop.trades)}`;
        });
      })
    );
  }

  private getName(shop: LazyShop,
                  specialShopNames: Record<number, I18nName>,
                  topicSelectNames: Record<number, I18nName>,
                  gilShopNames: Record<number, I18nName>,
                  gcNames: Record<number, I18nName>,
                  npcs: Record<number, LazyNpc>): I18nName {
    let name: I18nName;
    switch (shop.type) {
      case 'GilShop':
        name = gilShopNames[shop.id];
        break;
      case 'SpecialShop':
        if (shop.topicSelectId) {
          name = Object.keys(specialShopNames[shop.id]).reduce((acc, key) => {
            return {
              ...acc,
              [key]: `${specialShopNames[key]} - ${topicSelectNames[shop.topicSelectId]}`
            };
          }, {} as I18nName);
        }
        name = specialShopNames[shop.id];
        break;
      case 'GCShop':
        name = gcNames[shop.gc];
        break;
    }
    if (!name || name?.en === '' && shop.npcs.length > 0) {
      const npcWithTitle = shop.npcs.find(npc => {
        return npcs[npc].title?.en !== '';
      });
      return npcWithTitle ? npcs[npcWithTitle].title : name;
    }
    return name;
  }

}
