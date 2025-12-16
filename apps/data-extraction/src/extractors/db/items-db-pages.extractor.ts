import { AbstractExtractor } from '../../abstract-extractor';
import { XivDataService } from '../../xiv/xiv-data.service';
import { omitBy } from 'lodash';
import { LazyGcSupply } from '@ffxiv-teamcraft/data/model/lazy-gc-supply';
import { combineLatest } from 'rxjs';

export class ItemsDbPagesExtractor extends AbstractExtractor {
  protected doExtract(xiv: XivDataService): void {
    const dbData = {};
    const koNames = this.requireLazyFileByKey('koItems');
    const zhNames = this.requireLazyFileByKey('zhItems');
    const koDescriptions = this.requireLazyFileByKey('koItemDescriptions');
    const zhDescriptions = this.requireLazyFileByKey('zhItemDescriptions');
    const fishes = this.requireLazyFileByKey('fishes');
    const equipment = this.requireLazyFileByKey('equipment');
    const melding = this.requireLazyFileByKey('itemMeldingData');
    const bonuses = this.requireLazyFileByKey('itemBonuses');
    const stats = this.requireLazyFileByKey('itemStats');
    const recipesLookup = this.requireLazyFileByKey('recipesIngredientLookup');
    const reduction = this.requireLazyFileByKey('reverseReduction');
    const desynth = this.requireLazyFileByKey('desynth');
    const collectables = this.requireLazyFileByKey('collectables');
    const loots = this.requireLazyFileByKey('lootSources');
    const usedInQuests = this.requireLazyFileByKey('usedInQuests');
    const usedForLeves = this.requireLazyFileByKey('levesPerItem');
    const gcSupply = this.requireLazyFileByKey('gcSupply');
    const recipes = this.requireLazyFileByKey('recipes');
    const nodes = Object.entries(this.requireLazyFileByKey('nodes'));
    const fishParameters = Object.values(this.requireLazyFileByKey('fishParameter'));
    const trades = this.requireLazyFileByKey('shops');
    const itemPatch = this.requireLazyFileByKey('itemPatch');

    const supplies = Object.values(gcSupply)
      .map(row => Object.values(row))
      .flat()
      .flat()
      .reduce((acc, row: LazyGcSupply) => {
        return {
          ...acc,
          [row.itemId]: {
            amount: row.count,
            xp: row.reward.xp,
            seals: row.reward.seals
          }
        };
      }, {});

    const recipesUnlock: Record<number, number[]> = recipes.reduce((acc, recipe) => {
      if (recipe.masterbook) {
        const masterbookId: string | number = (recipe.masterbook as any)?.id || recipe.masterbook;
        return {
          ...acc,
          [+masterbookId]: [
            ...(acc[+masterbookId] || []),
            recipe.id
          ]
        };
      }
      return acc;
    }, {});
    const nodesUnlock: Record<number, number[]> = nodes.reduce((acc, [id, node]) => {
      if (node.folklore) {
        return {
          ...acc,
          [+node.folklore]: [
            ...(acc[+node.folklore] || []),
            ...node.items
          ]
        };
      }
      return acc;
    }, {});

    const fishUnlock: Record<number, number[]> = fishParameters.reduce((acc, fish) => {
      if (fish.folklore) {
        return {
          ...acc,
          [+fish.folklore]: [
            ...(acc[+fish.folklore] || []),
            +fish.itemId
          ]
        };
      }
      return acc;
    }, {});

    // TODO maybe use that eventually to find ItemKind, but that used to be a handmade sheet in XIVAPI and meh for ko/zh support
    const ItemKind = [
      [
        1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
        84, 87, 88, 89, 96, 97, 98
      ],
      [
        12, 13, 14, 15, 16, 17, 18, 19, 20,
        21, 22, 23, 24, 25, 26, 27, 28, 29,
        30, 31, 32, 33, 99
      ],
      [
        11, 34, 35, 36, 37, 38, 39
      ],
      [
        40, 41, 42, 43
      ],
      [
        44, 45, 46, 47
      ],
      [
        48, 49, 50, 51, 52, 53, 54, 55, 56
      ]
    ];


    combineLatest([
      this.getSheet<any>(xiv, 'Item', ['ClassJobRepair#', 'PriceMid', 'PriceLow', 'ItemSeries#', 'ItemAction.Data#','ItemAction.Action#',
        'AdditionalData#', 'Name', 'Description', 'IsUntradable', 'ClassJobUse#', 'ClassJobCategory#', 'LevelEquip#', 'LevelItem#',
        'BaseParamValueSpecial#', 'CanBeHq', 'ItemSearchCategory#', 'ItemUICategory#', 'Icon', 'IsUnique', 'DyeCount'], false, 1)      ,
      this.getSheet(xiv, 'GcSupplyDutyReward', ['SealsExpertDelivery'])
    ])
      .subscribe(([items, supplyDutyReward]) => {
        items.forEach(item => {
          const kind = ItemKind.findIndex(row => row.includes(item.ItemUICategory)) || 7;

          const lazyDesynths = Object.keys(desynth)
            .filter((key) => desynth[key].includes(item.index))
            .map((key) => +key);

          const lootEntries = Object.keys(loots).filter(key => {
            return loots[key].includes(item.index);
          });

          const tradeEntries = trades
            .filter(shop => {
              return shop.trades.some(trade => trade.currencies.some(c => c.id === item.index));
            })
            .map(shop => {
              return {
                ...shop,
                trades: shop.trades.filter(trade => trade.currencies.some(c => c.id === item.index))
              };
            });

          dbData[item.index] = {
            id: item.index,
            icon: item.Icon,
            name: {
              en: item.Name_en,
              ja: item.Name_ja,
              de: item.Name_de,
              fr: item.Name_fr,
              ...(koNames[item.index] || {}),
              ...(zhNames[item.index] || {})
            },
            description: {
              en: item.Description_en,
              ja: item.Description_ja,
              de: item.Description_de,
              fr: item.Description_fr,
              ...(koDescriptions[item.index] || {}),
              ...(zhDescriptions[item.index] || {})
            },
            gcReward: supplyDutyReward.find(r => r.index === item.LevelItem)?.SealsExpertDelivery,
            kind: item.ItemKind,
            unique: item.IsUnique,
            dyeCount: item.DyeCount,
            searchCategory: item.ItemSearchCategory,
            patch: itemPatch[item.index],
            equipable: !!equipment[item.index],
            sockets: melding[item.index]?.slots || 0,
            overmeld: melding[item.index]?.overmeld || false,
            repair: item.ClassJobRepair,
            price: item.PriceMid,
            sellPrice: item.PriceLow,
            isFish: fishes.includes(item.index),
            hasMoreDetails: !!item.ItemSeries,
            action: item.ItemAction.Action,
            actionData: item.ItemAction.Data[0],
            bonuses: bonuses[item.index],
            stats: stats[item.index],
            trade: !item.IsUntradable,
            additionalData: item.AdditionalData,
            cjUse: item.ClassJobUse,
            cjc: item.ClassJobCategory,
            elvl: item.LevelEquip,
            ilvl: item.LevelItem,
            bpSpecial: item.BaseParamValueSpecial,
            hq: item.CanBeHq,
            ingredientFor: (item.index > 100 ? recipesLookup.searchIndex[item.index] || [] : [])
              .map(id => {
                const recipe = recipesLookup.recipes[id];
                return {
                  itemId: recipe.itemId,
                  lvl: recipe.lvl,
                  stars: recipe.stars,
                  job: recipe.job
                }
              }),
            reductions: reduction[item.index] || [],
            collectable: collectables[item.index],
            desynths: lazyDesynths || [],
            loots: lootEntries || [],
            usedForLeves: usedForLeves[item.index] || [],
            usedInQuests: usedInQuests[item.index] || [],
            supply: supplies[item.index],
            recipesUnlock: recipesUnlock[item.index]?.map(recipeId => {
              return recipesLookup.recipes[recipeId];
            }),
            nodesUnlock: [...(nodesUnlock[item.index] || []), ...(fishUnlock[item.index] || [])],
            tradeEntries: tradeEntries,
            ...(equipment[item.index] || {})
          };

          if (dbData[item.index].isFish) {
            dbData[item.index].ingameDrawing = item.Icon.split('/')
              .map((fragment) => {
                if (+fragment > 0 || fragment.endsWith('.png')) {
                  return `07${fragment.slice(2)}`;
                }
                return fragment;
              })
              .join('/');
          }

          dbData[item.index] = omitBy(dbData[item.index], (value, key) => {
            return !value || value?.length === 0;
          });
        });
        this.persistToMinifiedJsonAsset('db/items-database-pages', dbData);
        this.done();
      });
  }

  getName(): string {
    return 'items-db-pages';
  }

}
