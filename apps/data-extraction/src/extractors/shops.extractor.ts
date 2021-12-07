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
  requiredFCRank?: number;
}

interface Shop {
  id: number;
  topicSelectId?: number;
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
      this.aggregateAllPages('https://xivapi.com/GilShop?columns=ID,Name_*,Items,Icon'),
      this.aggregateAllPages('https://xivapi.com/SpecialShop?columns=ID,QuestItem*,SpecialShopItemCategory*,ItemReceive*,CountReceive*,HQReceive*,ItemCost*,CountCost*,HQCost*,CollectabilityRatingCost*,UseCurrencyType'),
      this.aggregateAllPages('https://xivapi.com/GCScripShopItem?columns=ID,CostGCSeals,ItemTargetID,RequiredGrandCompanyRankTargetID'),
      this.aggregateAllPages('https://xivapi.com/GCScripShopCategory?columns=ID,GrandCompany,Tier'),
      this.aggregateAllPages('https://xivapi.com/TopicSelect?columns=ID,Name_*,Shop*,Url'),
      this.aggregateAllPages('https://xivapi.com/CustomTalk?columns=ID,MainOption_*,Name_*,SpecialLinks*,ScriptInstruction*,ScriptArg*,Icon*'),
      this.aggregateAllPages('https://xivapi.com/PreHandler?columns=ID,TargetTargetID,UnlockQuestTargetID,Image'),
      this.aggregateAllPages('https://xivapi.com/EnpcResident?columns=ID,Base'),
      this.aggregateAllPages('https://xivapi.com/FateShop?columns=ID,SpecialShop0TargetID,SpecialShop1TargetID')
    ]).pipe(
      map(([gilShops, specialShops, gcShopItems, gcShopCategories, topicSelect, customTalk, preHandler, npcs, fateShops]) => {
        this.progress.stop();
        const shops = uniqBy([
          ...this.handleGilShops(gilShops),
          ...this.handleSpecialShops(specialShops),
          ...this.handleGCShop(gcShopItems, gcShopCategories)
        ], 'id');
        const linked = this.linkNpcs(shops, npcs, topicSelect, customTalk, preHandler, fateShops);
        return linked.map(shop => {
          if (shop.npcs.length === 0 && linked.some(s => this.hashShop(s) === this.hashShop(shop) && s.npcs.length > 0)) {
            return null;
          }
          return shop;
        }).filter(shop => !!shop);
      })
    ).subscribe((shops) => {
      this.progress.stop();
      console.log('\n');
      console.log(`Shops without NPC : ${shops.filter(s => s.npcs.length === 0).length}/${shops.length}`);
      console.log(shops.filter(s => s.npcs.length === 0).slice(0, 10).map(s => `${s.type}#${s.id}`));
      this.persistToJsonAsset('shops', shops);
      this.done();
    });
  }

  private handleGCShop(gcShopItems: any[], gcShopCategories: any[]): Shop[] {
    return gcShopCategories.map(category => {
      const shop: Shop = {
        id: category.ID,
        type: 'GCShop',
        npcs: [],
        trades: gcShopItems
          .filter(item => item.ID.startsWith(category.ID.toString()))
          .map(item => {
            return {
              requiredGCRank: item.RequiredGrandCompanyRankTargetID,
              currencies: [{
                id: [20, 21, 22][category.GrandCompany.ID],
                amount: item.CostGCSeals
              }],
              items: [{
                id: item.ItemTargetID,
                amount: 1
              }]
            };
          }).flat()
      };
      return shop;
    }).flat();
  }

  private handleGilShops(gilShops: any[]): Shop[] {
    return gilShops
      .filter(shop => !!shop.Name_en)
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
        npcs: [], // Handled later on
        trades: tradeIds.map(tradeID => {
          const tradeIndexes = [`${tradeID}0`, `${tradeID}1`, `${tradeID}2`];
          return {
            currencies: tradeIndexes.map(tradeIndex => {
              // For debugging, you'll need this
              // if (specialShop.ID === 1770233 && specialShop[`ItemCost${tradeIndex}TargetID`] > 0) {
              //   console.log(`ItemCost${tradeIndex}TargetID`, specialShop[`ItemCost${tradeIndex}TargetID`]);
              //   console.log(`CountCost${tradeIndex}`, specialShop[`CountCost${tradeIndex}`]);
              //   console.log(`HQCost${tradeIndex}`, specialShop[`HQCost${tradeIndex}`]);
              //   console.log(`CollectabilityRatingCost${tradeIndex}`, specialShop[`CollectabilityRatingCost${tradeIndex}`]);
              //   console.log('--------------------------');
              //   console.log(`ItemReceive${tradeIndex}TargetID`, specialShop[`ItemReceive${tradeIndex}TargetID`]);
              //   console.log(`CountReceive${tradeIndex}`, specialShop[`CountReceive${tradeIndex}`]);
              //   console.log(`HQReceive${tradeIndex}`, specialShop[`HQReceive${tradeIndex}`]);
              //   console.log('==========================');
              // }
              const entry = {
                id: specialShop[`ItemCost${tradeIndex}TargetID`],
                amount: specialShop[`CountCost${tradeIndex}`],
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
                entry.id = StaticData.CURRENCIES[entry.id];
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

  private linkNpcs(shops: Shop[], npcs: { ID: number, Base: any }[], topicSelect: any[], customTalk: any[], preHandler: any[], fateShops: any[]): Shop[] {
    const { npcsByShopID, topicSelects, questReqs } = this.buildShopLinkMaps(npcs, topicSelect, customTalk, preHandler, fateShops);

    return shops.map(shop => {
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

  getName(): string {
    return 'shops';
  }

  private buildShopLinkMaps(npcData: { ID: number, Base: any }[], topicSelect: any[], customTalk: any[], preHandlers: any[], fateShops: any[]): ShopLinkMaps {
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
    npcsByShopID = this.processCustomTalkLinks(customTalk, npcsByShopID);

    const questReqs = {};
    const topicSelects = {};

    topicSelect.forEach((topic) => {
      for (let i = 0; i < 10; i++) {
        const dataID = topic[`Shop${i}`];
        if (dataID > 0) {
          npcsByShopID[dataID] = [
            ...(npcsByShopID[dataID] || []),
            topic.ID
          ];
          topicSelects[dataID] = topic.ID;
        }
      }
    });

    preHandlers.forEach(preHandler => {
      npcsByShopID[preHandler.TargetTargetID] = [...(npcsByShopID[preHandler.TargetTargetID] || []), npcsByShopID[preHandler.ID]];
      delete npcsByShopID[preHandler.ID];
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

  private processCustomTalkLinks(customTalks: any[], npcIdsByDataId: Record<number, number[]>): Record<number, number[]> {
    const dataIdsByCustomTalks = customTalks.reduce((acc, talk) => {
      if (!acc[talk.ID]) {
        acc[talk.ID] = [];
      }
      if (talk.SpecialLinks) {
        acc[talk.ID].push(talk.SpecialLinks);
      }
      for (let i = 0; i < 30; i++) {
        const scriptInstruction = talk[`ScriptInstruction${i}`];
        if (scriptInstruction.includes('SHOP')) {
          acc[talk.ID].push(talk[`ScriptArg${i}`]);
        }
      }
      return acc;
    }, {});

    return Object.keys(npcIdsByDataId)
      .reduce((acc, key) => {
        if (dataIdsByCustomTalks[key]) {
          return dataIdsByCustomTalks[key].reduce((obj, dataId) => {
            return {
              ...obj,
              [dataId]: [...(npcIdsByDataId[dataId] || []), npcIdsByDataId[key]]
            };
          }, acc);
        }
        return {
          ...acc,
          [key]: npcIdsByDataId[key]
        };
      }, {});
  }
}
