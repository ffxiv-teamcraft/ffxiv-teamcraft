import { combineLatest } from 'rxjs';
import { AbstractExtractor } from '../abstract-extractor';
import { map } from 'rxjs/operators';
import { StaticData } from '../static-data';
import { uniq, uniqBy } from 'lodash';

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
  protected doExtract(): void {
    combineLatest([
      this.aggregateAllPages('https://xivapi.com/GilShop?columns=ID,Name_*,Items'),
      this.aggregateAllPages('https://xivapi.com/SpecialShop?columns=ID,QuestItem*,SpecialShopItemCategory*,ItemReceive*,CountReceive*,HQReceive*,ItemCost*,CountCost*,HQCost*,CollectabilityRatingCost*,UseCurrencyType'),
      this.aggregateAllPages('https://xivapi.com/GCScripShopItem?columns=ID,CostGCSeals,ItemTargetID,RequiredGrandCompanyRankTargetID'),
      this.aggregateAllPages('https://xivapi.com/GCScripShopCategory?columns=ID,GrandCompany,Tier'),
      this.aggregateAllPages('https://xivapi.com/TopicSelect?columns=ID,Name_*,Shop*,Url'),
      this.aggregateAllPages('https://xivapi.com/CustomTalk?columns=ID,Name_*,SpecialLinks*,ScriptInstruction*,ScriptArg*,Icon*'),
      this.aggregateAllPages('https://xivapi.com/PreHandler?columns=ID,TargetTargetID,UnlockQuestTargetID,Image'),
      this.aggregateAllPages('https://xivapi.com/EnpcResident?columns=ID,Base'),
      this.aggregateAllPages('https://xivapi.com/FateShop?columns=ID,SpecialShop0TargetID,SpecialShop1TargetID'),
      this.aggregateAllPages('https://xivapi.com/InclusionShop?columns=ID,Category*'),
      this.aggregateAllPages('https://xivapi.com/BnpcBase?columns=ID,ArrayEventHandler'),
      this.get('https://xivapi.com/mappy/json')
    ]).pipe(
      map(([gilShops,
             specialShops,
             gcShopItems, gcShopCategories,
             topicSelect, customTalk, preHandler, npcs,
             fateShops,
             inclusionShops,
             bnpcBases, mappyJSON]) => {
        console.log('SHOPS LOADED');
        const shops = uniqBy([
          ...this.handleGilShops(gilShops),
          ...this.handleSpecialShops(specialShops),
          ...this.handleGCShop(gcShopItems, gcShopCategories)
        ], 'id');
        console.log('SHOPS HANDLED');
        const mappyJSONRecord = mappyJSON.reduce((acc, e) => {
          if (e.Type !== 'BNPC') {
            return acc;
          }
          return {
            ...acc,
            [e.BNpcBaseID]: e.BNpcNameID
          };
        }, {});
        console.log('SHOPS MAPPY DONE');
        let linked = this.linkNpcs(shops, npcs, topicSelect, customTalk, preHandler, fateShops, inclusionShops, specialShops);
        console.log('SHOPS LINK NPC DONE');
        linked = this.linkBNPCs(shops, bnpcBases, mappyJSONRecord);
        console.log('SHOPS LINK BNPC DONE');
        return linked.map(shop => {
          if (shop.npcs.length === 0 && linked.some(s => this.hashShop(s) === this.hashShop(shop) && s.npcs.length > 0)) {
            return null;
          }
          return shop;
        }).filter(shop => !!shop);
      })
    ).subscribe((shops) => {
      console.log('SHOPS START PERSISTENCE');
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
        id: category.ID,
        type: 'GCShop',
        gc: category.GrandCompany.ID,
        npcs: [[1002387, 1002393, 1002390][category.GrandCompany.ID - 1]],
        trades: gcShopItems
          .filter(item => item.ID.startsWith(category.ID.toString()))
          .map(item => {
            return {
              requiredGCRank: item.RequiredGrandCompanyRankTargetID,
              currencies: [{
                id: [20, 21, 22][category.GrandCompany.ID - 1],
                amount: item.CostGCSeals
              }].filter(row => row.id > 0 && row.amount > 0),
              items: [{
                id: item.ItemTargetID,
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

  private handleGilShops(gilShops: any[]): Shop[] {

    return gilShops
      .filter(shop => shop.Items !== null)
      .map(gilShop => {
        return {
          id: gilShop.ID,
          type: 'GilShop',
          npcs: [],
          trades: gilShop.Items.map(item => {
            return {
              currencies: [{
                id: 1,
                amount: item.PriceMid
              }].filter(c => c.amount > 0),
              items: [{
                id: item.ID,
                amount: 1
              }]
            };
          }).filter(c => c.currencies.length > 0)
        };
      }).filter(shop => shop.trades.length > 0) as Shop[];
  }

  private handleSpecialShops(specialShops: any[]): Shop[] {
    return specialShops.map(specialShop => {
      const tradeIds = uniq(Object.keys(specialShop)
        .map(key => /ItemReceive(\d+)TargetID/.exec(key))
        .filter(res => res !== null)
        .map(match => {
          // Trade indexes are always **0 or 1 or 2, because trades in XIV can only take up to 3 items and give up to 3 items.
          return Math.floor(+match[1] / 10);
        }));
      const shop: Shop = {
        id: specialShop.ID,
        type: 'SpecialShop',
        npcs: [],
        trades: tradeIds.map(tradeID => {
          const tradeIndexes = [`${tradeID}0`, `${tradeID}1`, `${tradeID}2`];
          const trade: Trade = {
            currencies: tradeIndexes.map(tradeIndex => {
              const entry = {
                id: specialShop[`ItemCost${tradeIndex}TargetID`],
                amount: specialShop[`CountCost${tradeIndex}`] || (specialShop.UseCurrencyType === 8 ? specialShop[`ItemReceive${tradeIndex}`]?.PriceMid || 0 : 0),
                hq: specialShop[`HQCost${tradeIndex}`] === 1,
                collectability: specialShop[`CollectabilityRatingCost${tradeIndex}`]
              };

              if (!entry.hq) {
                delete entry.hq;
              }

              if (!entry.collectability) {
                delete entry.collectability;
              }

              if (specialShop.UseCurrencyType === 16) {
                entry.id = StaticData.CURRENCIES[entry.id] || entry.id;
              }

              if ([2, 4].includes(specialShop.UseCurrencyType) && entry.id < 10) {
                entry.id = { ...StaticData.CURRENCIES, ...StaticData.TOMESTONES }[entry.id];
              }
              return entry;
            }).filter(row => row.id > 0 && row.amount > 0),
            items: tradeIndexes.map(tradeIndex => {
              const entry = {
                id: specialShop[`ItemReceive${tradeIndex}TargetID`],
                amount: specialShop[`CountReceive${tradeIndex}`],
                hq: specialShop[`HQReceive${tradeIndex}`] === 1
              };

              if (!entry.hq) {
                delete entry.hq;
              }
              return entry;
            }).filter(row => row.id > 0 && row.amount > 0)
          };
          const req = specialShop[`QuestItem${tradeID}TargetID`];
          if (req > 0) {
            // This cannot be a quest, it's for fate shop rank flags !
            if (req < 120) {
              const allRanks = uniq(tradeIds.map(id => specialShop[`QuestItem${id}TargetID`])).sort();
              trade.requiredFateRank = allRanks.indexOf(req);
            }
          }
          return trade;
        }).filter(t => t.currencies.length > 0)
      };
      return shop;
    }).filter(shop => shop.trades.length > 0);
  }

  private hashShop(shop: Shop): string {
    return shop.trades.map(t => t.currencies.map(item => `${item.id}|${item.amount}|${item.hq}`).join(',')).join(':')
      + '/'
      + shop.trades.map(t => t.items.map(item => `${item.id}|${item.amount}|${item.hq}`).join(',')).join(':');
  }

  private linkNpcs(shops: Shop[], npcs: { ID: number, Base: any }[], topicSelect: any[], customTalk: any[], preHandler: any[], fateShops: any[], inclusionShops: any[], specialShops: any[]): Shop[] {
    const {
      npcsByShopID,
      topicSelects,
      questReqs
    } = this.buildShopLinkMaps(npcs, topicSelect, customTalk, preHandler, fateShops, inclusionShops, specialShops);

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

  private linkBNPCs(shops: Shop[], bnpcs: { ID: number, ArrayEventHandler: any }[], mappyJSON: Record<number, number>): Shop[] {
    const npcsByShopID = bnpcs.filter(bnpc => {
      return bnpc.ArrayEventHandler && Object.entries<string>(bnpc.ArrayEventHandler).some(([key, value]) => key.endsWith('Target') && value.endsWith('Shop'));
    }).reduce((acc, bnpc) => {
      const nameId = mappyJSON[bnpc.ID];
      if (!nameId) {
        return acc;
      }
      Object.keys(bnpc.ArrayEventHandler)
        .forEach(key => {
          if (key.endsWith('Target') && bnpc.ArrayEventHandler[key]?.endsWith('Shop')) {
            const shopID = bnpc.ArrayEventHandler[`${key}ID`];
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

  private buildShopLinkMaps(npcData: { ID: number, Base: any }[], topicSelect: any[], customTalk: any[], preHandlers: any[], fateShops: any[], inclusionShops: any[], specialShops: any[]): ShopLinkMaps {
    const questReqs = {};
    const topicSelects = {};

    let npcsByShopID = npcData.reduce((acc, npc) => {
      for (let i = 0; i < 32; i++) {
        const dataID = npc.Base[`ENpcData${i}`];
        if (!acc[dataID]) {
          acc[dataID] = [];
        }
        acc[dataID].push(npc.ID);
      }
      return acc;
    }, {});
    // First of all, link shops from CustomTalks, since talks can also provide some PreHandler or TopicSelect entries
    npcsByShopID = this.processCustomTalkLinks(customTalk, npcsByShopID, specialShops);

    topicSelect.forEach((topic) => {
      for (let i = 0; i < 10; i++) {
        const dataID = topic[`Shop${i}`];
        if (dataID > 0) {
          npcsByShopID[dataID] = [
            ...(npcsByShopID[dataID] || []),
            ...(npcsByShopID[topic.ID] || [])
          ];
          topicSelects[dataID] = topic.ID;
        }
      }
    });

    preHandlers.forEach(preHandler => {
      npcsByShopID[preHandler.TargetTargetID] = [...(npcsByShopID[preHandler.TargetTargetID] || []), ...(npcsByShopID[preHandler.ID] || [])];
    });

    // Then InclusionShops because they sometimes link from PreHandler
    inclusionShops.forEach(inclusionShop => {
      for (let i = 0; i < 30; i++) {
        const category = inclusionShop[`Category${i}`];
        if (!category) {
          continue;
        }
        category.InclusionShopSeries.forEach(shopSeries => {
          npcsByShopID[shopSeries.SpecialShopTargetID] = [...(npcsByShopID[shopSeries.SpecialShopTargetID] || []), ...(npcsByShopID[inclusionShop.ID] || [])];
        });
      }
    });

    fateShops.forEach(fateShop => {
      [0, 1].forEach(i => {
        const specialShopID = fateShop[`SpecialShop${i}TargetID`];
        if (specialShopID > 0) {
          npcsByShopID[specialShopID] = [fateShop.ID];
        }
      });
    });

    return { npcsByShopID, topicSelects, questReqs };
  }

  private processCustomTalkLinks(customTalks: any[], npcIdsByDataId: Record<number, number[]>, specialShops: any[]): Record<number, number[]> {
    const preEndwalkerGemstoneShops = {
      '1769958': [1027538],
      '1769957': [1027998]
    };
    const hardcodedLinks = {
      721385: [262919]
    };
    const dataIdsByCustomTalks = customTalks.reduce((acc, talk) => {
      if (!acc[talk.ID]) {
        acc[talk.ID] = [];
      }
      if (talk.SpecialLinks) {
        acc[talk.ID].push(talk.SpecialLinks);
      }
      for (let i = 0; i < 30; i++) {
        const scriptInstruction = talk[`ScriptInstruction${i}`];
        const scriptArg = talk[`ScriptArg${i}`];
        if (talk.ID === 721479) { // local fate shops
          if (scriptInstruction.includes('FATESHOP_REWARD')) {
            const shop = specialShops.find(s => {
              return Object.entries(s).some(([k, v]) => k.startsWith('QuestItem') && k.endsWith('TargetID') && v === scriptArg);
            });
            if (shop) {
              const tokenizedInstruction = scriptInstruction.split('_');
              const placeNameEngrish = tokenizedInstruction[tokenizedInstruction.length - 1].slice(0, -1).replace('LAKELAND', 'LAKERAND'); // LAKERAND lmao
              const npcInstructionIndex = [0, 1, 2, 3, 4, 5, 6]
                .find(j => talk[`ScriptInstruction${j}`] === `FATESHOP_ENPCID_${placeNameEngrish}`);
              preEndwalkerGemstoneShops[shop.ID] = [talk[`ScriptArg${npcInstructionIndex}`]];
            }
          }
        } else if (scriptInstruction.includes('SHOP')) {
          acc[talk.ID].push(scriptArg);
        }
      }
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
