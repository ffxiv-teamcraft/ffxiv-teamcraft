import { AbstractExtractor } from '../abstract-extractor';
import { XivDataService } from '../xiv/xiv-data.service';

export class ItemsExtractor extends AbstractExtractor {
  getSlotName(equipSlotCategoryId: number): string {
    return [
      '1HWpn%',
      'OH%',
      'Head%',
      'Chest%',
      'Hands%',
      'Waist%',
      'Legs%',
      'Feet%',
      'Earring%',
      'Necklace%',
      'Bracelet%',
      'Ring%',
      '2HWpn%',
      '1HWpn%',
      'ChestHead%',
      'ChestHeadLegsFeet%',
      '',
      'LegsFeet%',
      'HeadChestHandsLegsFeet%',
      'ChestLegsGloves%',
      'ChestLegsFeet%',
      ''
    ][equipSlotCategoryId - 1];
  };

  protected doExtract(xiv: XivDataService): any {

    const names = {};
    const rarities = {};
    const itemIcons = {};
    const ilvls = {};
    const stackSizes = {};
    const equipment = {};
    const itemStats = {};
    const itemMainAttributes = {};
    const itemMeldingData = {};
    const hqFlags = {};
    const tradeFlags = {};
    const equipSlotCategoryId = {};
    const itemPatch = {};
    const itemSetBonuses = {};
    const marketItems = [];
    const baits = [];
    const extractableItems = {};
    const aetherialReduce = {};
    const collectableFlags = {};

    this.getSheet<any>(xiv, 'Item',
      ['AlwaysCollectable', 'AetherialReduce', 'Patch', 'DamagePhys', 'DamageMag', 'DefensePhys', 'DefenseMag', 'ID', 'Name', 'Description',
        'IsUnique', 'IsUntradable', 'MaterializeType', 'CanBeHq', 'Rarity', 'Icon', 'LevelItem', 'LevelEquip', 'StackSize',
        'EquipSlotCategory', 'ClassJobCategory', 'MateriaSlotCount', 'BaseParamModifier', 'IsAdvancedMeldingPermitted',
        'ItemSearchCategory', 'ItemSeries', 'BaseParamSpecial', 'BaseParamValueSpecial'], 1)
      .subscribe(items => {
        items.forEach(item => {
          itemIcons[item.index] = this.getIconHD(item.Icon);
          names[item.index] = {
            en: item.Name_en,
            de: item.Name_de,
            ja: item.Name_ja,
            fr: item.Name_fr
          };
          rarities[item.index] = item.Rarity;
          ilvls[item.index] = item.LevelItem.index;
          stackSizes[item.index] = item.StackSize;
          if (item.CanBeHq) {
            hqFlags[item.index] = 1;
          }
          if (item.IsUntradable === false) {
            tradeFlags[item.index] = 1;
          }
          if (item.ItemSearchCategory.index >= 9) {
            marketItems.push(item.index);
          }
          if ([30].includes(item.ItemSearchCategory.index)) {
            // -1: Universal
            // 1: Saltwater
            // 2: Freshwater
            // 3: Dune
            // 4: Sky
            // 5: Clouds
            // 6: Magma
            // 7: Aetherochemical pool
            // 8: Salt Lake
            // 9: Space
            const handmadeCategories = {
              28634: [-1],// Metal Spinner
              30136: [-1], // Signature Skyball
              29717: [-1] // Versatile Lure
            };

            const labels = item.Description_en?.toString().match(/(freshwater|ocean|dunefishing|skyfishing|salt lake|cloud|lakeland|sea|saltwater|aetherfishing|starfishing|hellfishing|coast|river)/gm);
            const categoryIndex = {
              'ocean': 1,
              'sea': 1,
              'saltwater': 1,
              'coast': 1,
              'freshwater': 2,
              'lake': 2,
              'land': 2,
              'dunefishing': 3,
              'skyfishing': 4,
              'cloud': 5,
              'hellfishing': 6,
              'salt lake': 6,
              'aetherfishing': 7,
              'starfishing': 9
            };
            let categories = [];
            const hardcoded = handmadeCategories[item.index];
            if (!hardcoded) {
              if (labels && labels.length > 0) {
                categories = labels.map(label => categoryIndex[label]);
              }
            } else {
              categories = hardcoded;
            }
            baits.push({
              id: item.index,
              categories
            });
          }
          if (item.MaterializeType > 0) {
            extractableItems[item.index] = 1;
          }
          if (item.AetherialReduce) {
            aetherialReduce[item.index] = item.AetherialReduce;
          }
          if (item.AlwaysCollectable) {
            collectableFlags[item.index] = 1;
          }
          if (item.ItemSeries?.index > 0) {
            itemSetBonuses[item.index] = {
              itemSeriesId: item.ItemSeries.index,
              bonuses: [0, 1, 2, 3, 4, 5]
                .filter(i => item.BaseParamSpecial[i] > 0 && item.BaseParamValueSpecial[i] > 0)
                .map(i => {
                  return {
                    baseParam: item.BaseParamSpecial[i],
                    value: item.BaseParamValueSpecial[i],
                    amountRequired: i
                  };
                })
            };
          }
          // TODO migrate these
          itemPatch[item.index] = item.Patch;
          if (item.Stats) {
            itemStats[item.index] = Object.values(item.Stats);
            itemMainAttributes[item.index] = [];
            if (item.DamagePhys || item.DamageMag) {
              if (item.DamagePhys > item.DamageMag) {
                itemMainAttributes[item.index].push(
                  {
                    ID: 12,
                    NQ: item.DamagePhys,
                    HQ: Number(item.DamagePhys) + Number(item.BaseParamValueSpecial0)
                  });
              } else {
                itemMainAttributes[item.index].push(
                  {
                    ID: 13,
                    NQ: item.DamageMag,
                    HQ: Number(item.DamageMag) + Number(item.BaseParamValueSpecial1)
                  });
              }
            }
            if (item.DefensePhys || item.DefenseMag) {
              itemMainAttributes[item.index].push({
                  ID: 21,
                  NQ: item.DefensePhys,
                  HQ: Number(item.DefensePhys) + Number(item.BaseParamValueSpecial0)
                },
                {
                  ID: 24,
                  NQ: item.DefenseMag,
                  HQ: Number(item.DefenseMag) + Number(item.BaseParamValueSpecial1)
                });
            }
            if (itemMainAttributes[item.index].length === 0) {
              delete itemMainAttributes[item.index];
            }
          }

          if (item.EquipSlotCategory.index && !item.Name_en.toString().startsWith('Dated ')) {
            equipSlotCategoryId[item.index] = item.EquipSlotCategory.index;
            equipment[item.index] = {
              equipSlotCategory: item.EquipSlotCategory.index,
              level: item.LevelEquip,
              unique: item.IsUnique,
              jobs: Object.keys(item.ClassJobCategory).filter(jobAbbr => Boolean(item.ClassJobCategory[jobAbbr]))
            };
            itemMeldingData[item.index] = {
              modifier: item.BaseParamModifier,
              prop: this.getSlotName(item.EquipSlotCategory.index),
              slots: item.MateriaSlotCount,
              overmeld: item.IsAdvancedMeldingPermitted
            };
          }
        });
        this.persistToJsonAsset('item-icons', itemIcons);
        this.persistToJsonAsset('items', names);
        this.persistToJsonAsset('rarities', rarities);
        this.persistToJsonAsset('ilvls', ilvls);
        this.persistToJsonAsset('stack-sizes', stackSizes);
        this.persistToJsonAsset('equipment', equipment);
        this.persistToJsonAsset('item-main-attributes', itemMainAttributes);
        this.persistToJsonAsset('item-melding-data', itemMeldingData);
        this.persistToJsonAsset('hq-flags', hqFlags);
        this.persistToTypescript('sync-hq-flags', 'syncHqFlags', hqFlags);
        this.persistToJsonAsset('trade-flags', tradeFlags);
        this.persistToJsonAsset('item-equip-slot-category', equipSlotCategoryId);
        this.persistToJsonAsset('market-items', marketItems);
        this.persistToJsonAsset('baits', baits);
        this.persistToJsonAsset('extractable-items', extractableItems);
        this.persistToJsonAsset('item-set-bonuses', itemSetBonuses);
        this.persistToJsonAsset('aetherial-reduce', aetherialReduce);
        this.persistToJsonAsset('collectable-flags', collectableFlags);
        // TODO prob a separate extractor? Later will still need xivapi imo
        // this.persistToJsonAsset('item-stats', itemStats);
        // this.persistToJsonAsset('item-patch', itemPatch);
        this.done();
      });
  }

  getName(): string {
    return 'items';
  }

}
