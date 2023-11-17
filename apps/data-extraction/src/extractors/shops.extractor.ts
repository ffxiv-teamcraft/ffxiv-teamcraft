import { combineLatest } from 'rxjs';
import { AbstractExtractor } from '../abstract-extractor';
import { map } from 'rxjs/operators';
import { StaticData } from '../static-data';
import { uniq, uniqBy } from 'lodash';
import { XivDataService } from '../xiv/xiv-data.service';

interface TradeItem {
  id: number;
  amount: number;
  hq?: boolean;
  collectability?: number;
}

interface Trade {
  currencies: TradeItem[];
  items: TradeItem[];
  requiredGCRank?: number;
  requiredFateRank?: number;
}

interface Shop {
  id: number;
  topicSelectId?: number;
  gc?: number;
  type: 'SpecialShop' | 'GCShop' | 'GilShop' | 'FccShop';
  npcs: number[];
  trades: Trade[];
  requiredQuest?: number;
}

interface ShopLinkMaps {
  npcsByShopID: Record<number, number[]>;
  questReqs: Record<number, number>;
  topicSelects: Record<number, number>;
}

export class ShopsExtractor extends AbstractExtractor {
  protected doExtract(xiv: XivDataService): void {
    combineLatest([
      this.getSheet<any>(xiv, 'GilShop', ['Name']),
      this.getSheet<any>(xiv, 'GilShopItem', ['Item.PriceMid'], true, 1),
      this.getSheet<any>(xiv, 'SpecialShop', ['Item:Item.PriceMid', 'Item:Quest#', 'SpecialShopItemCategory#','Item:ReceiveCount', 'Item:ReceiveHq', 'Item:ItemCost#', 'Item:CurrencyCost', 'Item:HqCost', 'Item:CollectabilityCost', 'UseCurrencyType'], false, 1),
      this.getSheet<any>(xiv, 'GCScripShopItem', ['CostGCSeals', 'Item#', 'RequiredGrandCompanyRank#']),
      this.getSheet<any>(xiv, 'GCScripShopCategory', ['GrandCompany', 'Tier']),
      this.getSheet<any>(xiv, 'TopicSelect', ['Name', 'Shop']),
      this.getSheet<any>(xiv, 'CustomTalk', ['Name', 'SpecialLinks', 'Script:ScriptInstruction', 'Script:ScriptArg', 'Icon']),
      this.getSheet<any>(xiv, 'PreHandler', ['Target#', 'UnlockQuest#', 'Image']),
      this.getSheet<any>(xiv, 'EnpcResident', []),
      this.getSheet<any>(xiv, 'EnpcBase', ['ENpcData']),
      this.getSheet<any>(xiv, 'FateShop', ['SpecialShop']),
      this.getSheet<any>(xiv, 'InclusionShop', ['Category.InclusionShopSeries.SpecialShop#'], false, 2),
      this.getSheet<any>(xiv, 'BnpcBase', ['ArrayEventHandler.Data#'], true, 2),
      this.getNonXivapiUrl('https://gubal.hasura.app/api/rest/bnpc')
    ]).pipe(
      map(([gilShops,
             gilShopItems,
             specialShops,
             gcShopItems,
             gcShopCategories,
             topicSelect,
             customTalk,
             preHandler,
             npcs,
             npcBases,
             fateShops,
             inclusionShops,
             bnpcBases]) => {
        const shops = uniqBy([
          ...this.handleGilShops(gilShops, gilShopItems),
          ...this.handleSpecialShops(specialShops),
          ...this.handleGCShop(gcShopItems, gcShopCategories)
        ], 'id');
        const mappyJSONRecord = this.requireLazyFile('gubal-bnpcs-index');
        let linked = this.linkNpcs(shops, npcs, npcBases, topicSelect, customTalk, preHandler, fateShops, inclusionShops, specialShops);
        linked = this.linkBNPCs(shops, bnpcBases, mappyJSONRecord);
        return linked.map(shop => {
          if (shop.npcs.length === 0 && linked.some(s => this.hashShop(s) === this.hashShop(shop) && s.npcs.length > 0)) {
            return null;
          }
          return shop;
        }).filter(shop => !!shop);
      })
    ).subscribe((shops) => {
      this.persistToJsonAsset('shops', shops);
      this.persistToJsonAsset('shops-by-npc', shops.reduce((acc, shop) => {
        shop.npcs.forEach(npc => {
          acc[npc] = (acc[npc] || []);
          acc[npc].push(shop);
        });
        return acc;
      }, {}));
      this.done();
    });
  }

  private handleGCShop(gcShopItems: any[], gcShopCategories: any[]): Shop[] {
    return gcShopCategories.map(category => {
      const shop: Shop = {
        id: category.index,
        type: 'GCShop',
        gc: category.GrandCompany,
        npcs: [[1002387, 1002393, 1002390][category.GrandCompany - 1]],
        trades: gcShopItems
          .filter(item => item.index === category.index)
          .map(item => {
            return {
              requiredGCRank: item.RequiredGrandCompanyRank,
              currencies: [{
                id: [20, 21, 22][category.GrandCompany - 1],
                amount: item.CostGCSeals
              }].filter(row => row.id > 0 && row.amount > 0),
              items: [{
                id: item.Item,
                amount: 1
              }].filter(row => row.id > 0 && row.amount > 0)
            };
          }).flat()
          .filter(t => t.items.length > 0 && t.currencies.length > 0)
      };
      return shop;
    }).flat()
      .filter(s => s.trades.length > 0);
  }

  private handleGilShops(gilShops: any[], gilShopItems: any[]): Shop[] {
    return gilShops
      .map(shop => {
        return {
          ...shop,
          Items: gilShopItems.filter(shopItem => shopItem.index === shop.index)
        };
      })
      .filter(shop => shop.Items.length > 0)
      .map(gilShop => {
        return {
          id: gilShop.index,
          type: 'GilShop',
          npcs: [],
          trades: gilShop.Items.map(item => {
            return {
              currencies: [{
                id: 1,
                amount: item.Item.PriceMid
              }].filter(c => c.amount > 0),
              items: [{
                id: item.Item.index,
                amount: 1
              }]
            };
          }).filter(c => c.currencies.length > 0)
        };
      }).filter(shop => shop.trades.length > 0) as Shop[];
  }

  private handleSpecialShops(specialShops: any[]): Shop[] {
    return specialShops.map(specialShop => {
      // Inverting 2D arrays to make them easier to process for trades
      const shop: Shop = {
        id: specialShop.index,
        type: 'SpecialShop',
        npcs: [],
        trades: specialShop.Item.map((row) => {
          const trade: Trade = {
            currencies: row.ItemCost.map((costItem, costIndex) => {
              const entry = {
                id: costItem,
                amount: row.CurrencyCost[costIndex] || (specialShop.UseCurrencyType === 8 ? row.Item[costIndex]?.PriceMid || 0 : 0),
                hq: costItem > 50 && row.HqCost[costIndex] > 0,
                collectability: row.CollectabilityCost[costIndex]
              };

              if (!entry.hq) {
                delete entry.hq;
              }

              if (!entry.collectability) {
                delete entry.collectability;
              }

              if (specialShop.index === 1770637) {
                entry.id = { ...StaticData.CURRENCIES }[entry.id];
                return entry;
              }

              if (specialShop.index === 1770446 || (specialShop.index === 1770699 && entry.id < 10)) {
                entry.id = { ...StaticData.CURRENCIES, ...StaticData.TOMESTONES }[entry.id];
                return entry;
              }

              if (specialShop.UseCurrencyType === 16 && entry.id !== 25) {
                entry.id = StaticData.CURRENCIES[entry.id] || entry.id;
              }

              if (([2].includes(specialShop.UseCurrencyType) || specialShop.index === 1770637) && entry.id < 10) {
                entry.id = { ...StaticData.CURRENCIES }[entry.id];
              }

              // Looks like we'll have to hardcode some of them
              if ([16, 4].includes(specialShop.UseCurrencyType) && entry.id < 10 && specialShop.index !== 1770637) {
                entry.id = { ...StaticData.CURRENCIES, ...StaticData.TOMESTONES }[entry.id];
              }
              return entry;
            }).filter(row => row.id > 0 && row.amount > 0),
            items: row.Item.map((item, itemIndex) => {
              const entry = {
                id: item.index,
                amount: row.ReceiveCount[itemIndex],
                hq: row.ReceiveHq[itemIndex]
              };

              if (!entry.hq) {
                delete entry.hq;
              }
              return entry;
            }).filter(row => row.id > 0 && row.amount > 0)
          };
          return trade;
        }).filter(t => t.currencies.length > 0 && t.items.length > 0)
      };
      return shop;
    }).filter(shop => shop.trades.length > 0);
  }

  private hashShop(shop: Shop): string {
    return shop.trades.map(t => t.currencies.map(item => `${item.id}|${item.amount}|${item.hq}`).join(',')).join(':')
      + '/'
      + shop.trades.map(t => t.items.map(item => `${item.id}|${item.amount}|${item.hq}`).join(',')).join(':');
  }

  private linkNpcs(shops: Shop[], npcs: {
    index: number
  }[], npcBases: any[], topicSelect: any[], customTalk: any[], preHandler: any[], fateShops: any[], inclusionShops: any[], specialShops: any[]): Shop[] {
    const {
      npcsByShopID,
      topicSelects,
      questReqs
    } = this.buildShopLinkMaps(npcs, npcBases, topicSelect, customTalk, preHandler, fateShops, inclusionShops, specialShops);

    return shops.map(shop => {
      if (shop.type === 'GCShop') {
        return shop;
      }
      if (questReqs[shop.id]) {
        shop.requiredQuest = questReqs[shop.id];
      }
      if (topicSelects[shop.id] > 0) {
        shop.topicSelectId = topicSelects[shop.id];
      }
      shop.npcs = uniq(npcsByShopID[shop.id]);
      return shop;
    });
  }

  private isGilShopID(id: number): boolean {
    return id >= 262144 && id < 270000;
  }

  private linkBNPCs(shops: Shop[], bnpcs: { index: number, ArrayEventHandler: any }[], mappyJSON: Record<number, number>): Shop[] {
    const npcsByShopID = bnpcs.filter(bnpc => {
      return bnpc.ArrayEventHandler.Data && bnpc.ArrayEventHandler.Data.some((data) => this.isGilShopID(data));
    }).reduce((acc, bnpc) => {
      const nameId = mappyJSON[bnpc.index];
      if (!nameId) {
        return acc;
      }
      bnpc.ArrayEventHandler.Data
        .forEach(data => {
          if (this.isGilShopID(data)) {
            const shopID = data;
            if (shopID > 0) {
              acc[shopID] = [
                ...(acc[shopID] || []),
                nameId
              ];
            }
          }
        });
      return acc;
    }, {});
    return shops.map(shop => {
      if (shop.type === 'GCShop') {
        return shop;
      }
      shop.npcs = uniq([...(shop.npcs || []), ...(npcsByShopID[shop.id] || [])]);
      return shop;
    });
  }

  getName(): string {
    return 'shops';
  }

  private buildShopLinkMaps(npcData: {
    index: number
  }[], npcBases: any[], topicSelect: any[], customTalk: any[], preHandlers: any[], fateShops: any[], inclusionShops: any[], specialShops: any[]): ShopLinkMaps {
    const questReqs = {};
    const topicSelects = {};

    let npcsByShopID = npcData.reduce((acc, npc) => {
      const base = npcBases.find(base => base.index === npc.index);
      base.ENpcData.forEach(dataID => {
        if (!acc[dataID]) {
          acc[dataID] = [];
        }
        acc[dataID].push(npc.index);
      });
      return acc;
    }, {});
    // First of all, link shops from CustomTalks, since talks can also provide some PreHandler or TopicSelect entries
    npcsByShopID = this.processCustomTalkLinks(customTalk, npcsByShopID, specialShops);

    topicSelect.forEach((topic) => {
      topic.Shop.forEach(dataID => {
        npcsByShopID[dataID] = [
          ...(npcsByShopID[dataID] || []),
          ...(npcsByShopID[topic.index] || [])
        ];
        topicSelects[dataID] = topic.index;
      });
    });

    preHandlers.forEach(preHandler => {
      npcsByShopID[preHandler.Target] = [...(npcsByShopID[preHandler.Target] || []), ...(npcsByShopID[preHandler.index] || [])];
    });

    // Then InclusionShops because they sometimes link from PreHandler
    inclusionShops.forEach(inclusionShop => {
      inclusionShop.Category.forEach(category => {
        if (!category) {
          return;
        }
        category.InclusionShopSeries.forEach(shopSeries => {
          npcsByShopID[shopSeries.SpecialShop] = [...(npcsByShopID[shopSeries.SpecialShop] || []), ...(npcsByShopID[inclusionShop.index] || [])];
        });
      });
    });

    fateShops.forEach(fateShop => {
      fateShop.SpecialShop.forEach(specialShopID => {
        if (specialShopID > 0) {
          npcsByShopID[specialShopID] = [fateShop.index];
        }
      });
    });

    return { npcsByShopID, topicSelects, questReqs };
  }

  private processCustomTalkLinks(customTalks: any[], npcIdsByDataId: Record<number, number[]>, specialShops: any[]): Record<number, number[]> {
    const preEndwalkerGemstoneShops = {
      '1769957': [1027998],
      '1769958': [1027538],
      '1769959': [1027385],
      '1769960': [1027497],
      '1769961': [1027892],
      '1769962': [1027665],
      '1769963': [1027709],
      '1769964': [1027766]
    };
    const hardcodedLinks = {
      721385: [262919]
    };
    const dataIdsByCustomTalks = customTalks.reduce((acc, talk) => {
      if (!acc[talk.index]) {
        acc[talk.index] = [];
      }
      if (talk.SpecialLinks) {
        acc[talk.index].push(talk.SpecialLinks);
      }
      talk.Script.forEach(({ ScriptInstruction, ScriptArg }) => {
        if (talk.index === 721479) { // local fate shops
          if (ScriptInstruction.includes('FATESHOP_REWARD')) {
            const shop = specialShops.find(s => {
              return Object.entries(s).some(([k, v]) => k.startsWith('QuestItem') && k.endsWith('TargetID') && v === ScriptArg);
            });
            if (shop) {
              const tokenizedInstruction = ScriptInstruction.split('_');
              const placeNameEngrish = tokenizedInstruction[tokenizedInstruction.length - 1].slice(0, -1).replace('LAKELAND', 'LAKERAND'); // LAKERAND lmao
              const npcInstructionIndex = [0, 1, 2, 3, 4, 5, 6]
                .find(j => talk.Script[j].ScriptInstruction === `FATESHOP_ENPCID_${placeNameEngrish}`);
              preEndwalkerGemstoneShops[shop.index] = [talk.Script[npcInstructionIndex].ScriptArg];
            }
          }
        } else if (ScriptInstruction.includes('SHOP') || ScriptInstruction.includes('LOGMSG')) {
          acc[talk.index].push(ScriptArg);
        }
      });
      return acc;
    }, hardcodedLinks);

    return Object.keys(npcIdsByDataId)
      .reduce((acc, key) => {
        if (dataIdsByCustomTalks[key]) {
          return dataIdsByCustomTalks[key].reduce((obj, dataId) => {
            return {
              ...obj,
              [dataId]: [...(npcIdsByDataId[dataId] || []), ...(npcIdsByDataId[key] || [])]
            };
          }, acc);
        }
        return {
          ...acc,
          [key]: npcIdsByDataId[key]
        };
      }, preEndwalkerGemstoneShops);
  }
}
