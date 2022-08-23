import { getItemSource, ListRow } from '../../modules/list/model/list-row';
import { FilterMethod } from './filter-method';
import { FilterResult } from './filter-result';
import { CraftedBy } from '../../modules/list/model/crafted-by';
import { List } from '../../modules/list/model/list';
import { beastTribeNpcs } from '../data/sources/beast-tribe-npcs';
import { DataType } from '../../modules/list/data/data-type';
import { SettingsService } from '../../modules/settings/settings.service';
import { Vendor } from '../../modules/list/model/vendor';
import { housingMaterialSuppliers } from '../data/sources/housing-material-suppliers';

export class LayoutRowFilter {

  static NONE = new LayoutRowFilter(() => false, 'NONE');

  static IS_CRAFT = new LayoutRowFilter(row => getItemSource(row, DataType.CRAFTED_BY).length > 0, 'IS_CRAFT');

  static IS_CRYSTAL = new LayoutRowFilter(row => row.id > 1 && row.id < 20, 'IS_CRYSTAL');

  static IS_FINAL_ITEM = new LayoutRowFilter(row => row.finalItem === true, 'IS_FINAL_ITEM');

  static IS_GATHERING = new LayoutRowFilter(row => getItemSource(row, DataType.GATHERED_BY, true).type !== undefined, 'IS_GATHERING');

  static IS_TRADE = new LayoutRowFilter(row => getItemSource(row, DataType.TRADE_SOURCES).length > 0, 'IS_TRADE');

  static CAN_BE_BOUGHT = new LayoutRowFilter((row, _, settings) => {
    let vendors = getItemSource<Vendor[]>(row, DataType.VENDORS);
    if (settings.maximumVendorPrice > 0) {
      vendors = vendors.filter(vendor => vendor.price <= settings.maximumVendorPrice);
    }
    if (settings.maximumTotalVendorPrice > 0) {
      vendors = vendors.filter(vendor => vendor.price * row.amount <= settings.maximumTotalVendorPrice);
    }
    return vendors.length > 0;
  }, 'CAN_BE_BOUGHT');

  static IS_FROM_HOUSING_VENDOR = new LayoutRowFilter((row, _, settings) => {
    let vendors = getItemSource<Vendor[]>(row, DataType.VENDORS).filter(s => {
      return housingMaterialSuppliers.includes(s.npcId);
    });
    if (settings.maximumVendorPrice > 0) {
      vendors = vendors.filter(vendor => vendor.price <= settings.maximumVendorPrice);
    }
    if (settings.maximumTotalVendorPrice > 0) {
      vendors = vendors.filter(vendor => vendor.price * row.amount <= settings.maximumTotalVendorPrice);
    }
    return vendors.length > 0;
  }, 'IS_FROM_HOUSING_VENDOR');

  static IS_ONLY_FROM_VENDOR = LayoutRowFilter.CAN_BE_BOUGHT._and(new LayoutRowFilter(row => {
    return row.sources.length === 1 || row.sources.length === 2 &&
      (
        getItemSource(row, DataType.TRADE_SOURCES).length > 0
        || getItemSource(row, DataType.QUESTS).length > 0
      );
  }, 'IS_ONLY_FROM_VENDOR'));

  static IS_HQ = new LayoutRowFilter((row, list) => {
    const recipesNeedingItem = list.finalItems
      .filter(item => item.requires !== undefined)
      .filter(item => {
        return (item.requires || []).some(req => req.id === row.id);
      });
    if (row.requiredAsHQ) {
      return true;
    }
    if (list.disableHQSuggestions) {
      return false;
    }
    if (recipesNeedingItem.length === 0 || row.requiredAsHQ === false) {
      return false;
    } else {
      let count = 0;
      recipesNeedingItem.forEach(recipe => {
        count += recipe.requires.find(req => req.id === row.id).amount * recipe.amount;
      });
      return count > 0;
    }
  }, 'IS_HQ');

  static IS_FATE_ITEM = new LayoutRowFilter(row => {
    return getItemSource(row, DataType.TRADE_SOURCES).some(ts => ts.trades.some(trade => trade.currencies.some(c => c.id === 26807)));
  }, 'IS_FATE_ITEM');

  static FROM_BEAST_TRIBE = LayoutRowFilter.CAN_BE_BOUGHT._and(new LayoutRowFilter(row => {
    return getItemSource(row, DataType.VENDORS).some(vendor => {
      return beastTribeNpcs.indexOf(vendor.npcId) > -1;
    }) || getItemSource(row, DataType.TRADE_SOURCES).some(trade => {
      return trade.npcs.some(npc => {
        return beastTribeNpcs.indexOf(npc.id) > -1;
      });
    });
  }, 'FROM_BEAST_TRIBE'));

  static IS_MONSTER_DROP = new LayoutRowFilter(row => getItemSource(row, DataType.DROPS).length > 0, 'IS_MONSTER_DROP');

  static IS_DUNGEON_DROP = new LayoutRowFilter(row => getItemSource(row, DataType.INSTANCES).length > 0, 'IS_DUNGEON_DROP');

  static IS_GC_TRADE = new LayoutRowFilter(row => getItemSource(row, DataType.TRADE_SOURCES)
    .find(source => source.trades
        .find(trade => trade.currencies.find(currency => [20, 21, 22].indexOf(+currency.id) > -1) !== undefined)
      !== undefined) !== undefined, 'IS_GC_TRADE');

  static IS_TOKEN_TRADE = new LayoutRowFilter(row => {
    // These ids are for voidrake and Althyk lavender.
    for (const tokenId of [15858, 15857]) {
      if (getItemSource(row, DataType.TRADE_SOURCES).some(source => {
        return source.trades.some(trade => {
          return trade.currencies.some(c => c.id === tokenId);
        });
      })) {
        return true;
      }
    }
    return false;
  }, 'IS_TOKEN_TRADE');

  static IS_TOME_TRADE = new LayoutRowFilter(row => {
    const tomeIds = [
      28,
      35,
      36,
      37,
      38,
      39,
      40,
      41,
      42,
      43,
      44,
      7811,
      9383,
      14298,
      16928,
      19107,
      21789
    ];

    for (const tokenId of tomeIds) {
      if (getItemSource(row, DataType.TRADE_SOURCES)
        .some(source => source.trades
          .some(trade => trade.currencies.some(c => c.id === tokenId)
          )
        )) {
        return true;
      }
    }

    return false;
  }, 'IS_TOME_TRADE');

  static IS_SCRIPT_TRADE = new LayoutRowFilter(row => {
    const scripIds = [
      10309,
      10311,
      17833,
      17834,
      25199,
      25200,
      33913,
      33914
    ];

    for (const tokenId of scripIds) {
      if (getItemSource(row, DataType.TRADE_SOURCES).some(source => {
        return source.trades.some(trade => {
          return trade.currencies.some(c => c.id === tokenId);
        });
      })) {
        return true;
      }
    }
    return false;
  }, 'IS_SCRIPT_TRADE');

  static IS_VENTURE = new LayoutRowFilter(row => getItemSource(row, DataType.VENTURES).length > 0, 'IS_VENTURE');

  static IS_VOYAGE = new LayoutRowFilter(row => getItemSource(row, DataType.VOYAGES).length > 0, 'IS_VOYAGE');

  static IS_MASTERCRAFT = LayoutRowFilter.IS_CRAFT
    ._and(new LayoutRowFilter(row => getItemSource(row, DataType.CRAFTED_BY).find(craft => craft.masterbook !== undefined) !== undefined,
      'IS_MASTERCRAFT'));

  static IS_FOLKLORE = LayoutRowFilter.IS_GATHERING
    ._and(new LayoutRowFilter(row => (getItemSource(row, DataType.GATHERED_BY, true).nodes || []).find(node => node.folklore !== undefined) !== undefined, 'IS_FOLKLORE'));

  static IS_TIMED = new LayoutRowFilter(row => {
    const isTimedGathering = (getItemSource(row, DataType.GATHERED_BY, true).nodes || []).filter(node => node.limited).length > 0;
    const isTimedReduction = getItemSource(row, DataType.REDUCED_FROM)
      .filter(reduction => {
        return (<any>window).gt.bell.nodes.find(node => {
          return node.items.find(item => item.id === reduction) !== undefined;
        }) !== undefined;
      }).length > 0;
    return isTimedGathering || isTimedReduction;
  }, 'IS_TIMED');

  static IS_NORMAL_GATHERING = LayoutRowFilter.IS_GATHERING
    ._and(LayoutRowFilter.not(LayoutRowFilter.IS_TIMED))
    ._and(new LayoutRowFilter(() => true, 'IS_NORMAL_GATHERING'));

  static IS_END_CRAFT_MATERIAL = new LayoutRowFilter((row, list) => {
    for (const item of list.finalItems) {
      if (item.requires.some(req => req.id === row.id)) {
        return true;
      }
    }
    return false;
  }, 'IS_END_CRAFT_MATERIAL');

  static IS_REDUCTION = new LayoutRowFilter(row => getItemSource(row, DataType.REDUCED_FROM).length > 0, 'IS_REDUCTION');

  /**
   * CRAFTED BY FILTERS
   */

  static IS_CRAFTED_BY_ALC = LayoutRowFilter.IS_CRAFT
    ._and(new LayoutRowFilter((row: ListRow) => {
      return getItemSource(row, DataType.CRAFTED_BY).find((craftedByRow: CraftedBy) => {
        return craftedByRow.job === 14;
      }) !== undefined;
    }, 'IS_CRAFTED_BY_ALC'));

  static IS_CRAFTED_BY_ARM = LayoutRowFilter.IS_CRAFT
    ._and(new LayoutRowFilter((row: ListRow) => {
      return getItemSource(row, DataType.CRAFTED_BY).find((craftedByRow: CraftedBy) => {
        return craftedByRow.job === 10;
      }) !== undefined;
    }, 'IS_CRAFTED_BY_ARM'));

  static IS_CRAFTED_BY_BSM = LayoutRowFilter.IS_CRAFT
    ._and(new LayoutRowFilter((row: ListRow) => {
      return getItemSource(row, DataType.CRAFTED_BY).find((craftedByRow: CraftedBy) => {
        return craftedByRow.job === 9;
      }) !== undefined;
    }, 'IS_CRAFTED_BY_BSM'));

  static IS_CRAFTED_BY_CRP = LayoutRowFilter.IS_CRAFT
    ._and(new LayoutRowFilter((row: ListRow) => {
      return getItemSource(row, DataType.CRAFTED_BY).find((craftedByRow: CraftedBy) => {
        return craftedByRow.job === 8;
      }) !== undefined;
    }, 'IS_CRAFTED_BY_CRP'));

  static IS_CRAFTED_BY_CUL = LayoutRowFilter.IS_CRAFT
    ._and(new LayoutRowFilter((row: ListRow) => {
      return getItemSource(row, DataType.CRAFTED_BY).find((craftedByRow: CraftedBy) => {
        return craftedByRow.job === 15;
      }) !== undefined;
    }, 'IS_CRAFTED_BY_CUL'));

  static IS_CRAFTED_BY_GSM = LayoutRowFilter.IS_CRAFT
    ._and(new LayoutRowFilter((row: ListRow) => {
      return getItemSource(row, DataType.CRAFTED_BY).find((craftedByRow: CraftedBy) => {
        return craftedByRow.job === 11;
      }) !== undefined;
    }, 'IS_CRAFTED_BY_GSM'));

  static IS_CRAFTED_BY_LTW = LayoutRowFilter.IS_CRAFT
    ._and(new LayoutRowFilter((row: ListRow) => {
      return getItemSource(row, DataType.CRAFTED_BY).find((craftedByRow: CraftedBy) => {
        return craftedByRow.job === 12;
      }) !== undefined;
    }, 'IS_CRAFTED_BY_LTW'));

  static IS_CRAFTED_BY_WVR = LayoutRowFilter.IS_CRAFT
    ._and(new LayoutRowFilter((row: ListRow) => {
      return getItemSource(row, DataType.CRAFTED_BY).find((craftedByRow: CraftedBy) => {
        return craftedByRow.job === 13;
      }) !== undefined;
    }, 'IS_CRAFTED_BY_WVR'));

  /**
   * GATHERED BY FILTERS
   */
  static IS_GATHERED_BY_BTN = LayoutRowFilter.IS_GATHERING
    ._and(new LayoutRowFilter((row: ListRow) => {
      return [2, 3].indexOf(getItemSource(row, DataType.GATHERED_BY, true).type) > -1;
    }, 'IS_GATHERED_BY_BTN'));

  static IS_GATHERED_BY_MIN = LayoutRowFilter.IS_GATHERING
    ._and(new LayoutRowFilter((row: ListRow) => {
      return [0, 1].indexOf(getItemSource(row, DataType.GATHERED_BY, true).type) > -1;
    }, 'IS_GATHERED_BY_MIN'));

  static IS_GATHERED_BY_FSH = LayoutRowFilter.IS_GATHERING
    ._and(new LayoutRowFilter((row: ListRow) => {
      return getItemSource(row, DataType.GATHERED_BY, true).type === 4 || getItemSource(row, DataType.GATHERED_BY, true).type === -5;
    }, 'IS_GATHERED_BY_FSH'));

  static REQUIRES_WEATHER = LayoutRowFilter.IS_GATHERED_BY_FSH
    ._and(new LayoutRowFilter((row: ListRow) => {
      return getItemSource(row, DataType.GATHERED_BY).nodes.some(node => node.weathers && node.weathers.length > 0);
    }, 'REQUIRES_WEATHER'));

  static ANYTHING = new LayoutRowFilter(() => true, 'ANYTHING');

  /**
   * A filter needs a method, and eventually a base string for serialization (used to resolve filter chains).
   * @param {FilterMethod} _filter
   * @param _name
   */
  constructor(private _filter: FilterMethod, private _name: string) {
  }

  static get ALL(): LayoutRowFilter[] {
    return LayoutRowFilter.ALL_NAMES.map(key => LayoutRowFilter[key]);
  }

  static get ALL_NAMES(): string[] {
    return Object.keys(LayoutRowFilter)
      .filter(key => ['ALL', 'ALL_NAMES', 'fromString', 'processRows', 'not', 'getData'].indexOf(key) === -1);
  }

  public get name(): string {
    return this._name;
  }

  static fromString(filterString: string): LayoutRowFilter {
    const parsed = filterString.split(':');
    const baseFilterString: string = parsed.shift();
    const baseFilter: LayoutRowFilter = LayoutRowFilter[baseFilterString.replace('!', '')];
    if (parsed.length > 1 && baseFilter !== undefined) {
      return LayoutRowFilter.processRows(parsed, baseFilter);
    }
    if (baseFilterString[0] === '!') {
      return LayoutRowFilter.not(baseFilter);
    }
    return baseFilter;
  }

  public static not(baseFilter: LayoutRowFilter): LayoutRowFilter {
    return new LayoutRowFilter((row: ListRow, list: List, settings: SettingsService) => {
      return !baseFilter._filter(row, list, settings);
    }, `!${baseFilter.name}`);
  }

  private static processRows(stringRows: string[], filter: LayoutRowFilter): LayoutRowFilter {
    const operator = stringRows.shift();
    let filterString = stringRows.shift();
    if (operator !== undefined && filterString !== undefined && filter !== undefined) {
      const notGate = filterString.charAt(0) === '!';
      if (notGate) {
        filterString = filterString.substr(1);
      }
      let nextFilter: LayoutRowFilter = LayoutRowFilter[filterString];
      if (notGate) {
        nextFilter = LayoutRowFilter.not(nextFilter);
      }
      filter = filter[operator](nextFilter);
      return LayoutRowFilter.processRows(stringRows, filter);
    }
    return filter;
  }

  /**
   * Creates a new filter by combining a filter with a new filter function, making it able to create dependencies between filters
   * E.G, a timed node is a node, meaning that it's matching the IS_GATHERING filter and a filter checking that it is timed.
   * @returns {LayoutRowFilter}
   * @param pipedFilter
   * @param buildNewName
   */
  public and(pipedFilter: LayoutRowFilter, buildNewName = true): LayoutRowFilter {
    const newName = buildNewName ? `${this.name}:and:${pipedFilter.name}` : pipedFilter.name;
    return new LayoutRowFilter((row: ListRow, list: List, settings: SettingsService) => {
      return this._filter(row, list, settings) && pipedFilter._filter(row, list, settings);
    }, newName);
  }

  /**
   * Creates a new filter by combining a filter with a new filter function with an OR boolean.
   * @returns {LayoutRowFilter}
   * @param pipedFilter
   * @param buildNewName
   */
  public or(pipedFilter: LayoutRowFilter, buildNewName = true): LayoutRowFilter {
    const newName = buildNewName ? `${this.name}:or:${pipedFilter.name}` : pipedFilter.name;
    return new LayoutRowFilter((row: ListRow, list: List, settings: SettingsService) => {
      return this._filter(row, list, settings) || pipedFilter._filter(row, list, settings);
    }, newName);
  }

  // noinspection JSValidateJSDoc
  /**
   * Filters a list with the filter
   * @param rows
   * @param list
   * @param settings
   * @returns {accepted: ListRow[]; rejected: ListRow[]} A set of data with rejected and accepted rows.
   */
  filter(rows: ListRow[], list: List, settings: SettingsService): FilterResult {
    const result = { accepted: [], rejected: [] };
    for (const row of rows) {
      if (this._filter(row, list, settings)) {
        result.accepted.push(row);
      } else {
        result.rejected.push(row);
      }
    }
    return result;
  }

  /**
   * private version of AND that doesn't update name, in order to avoid rebuilding an entire filter when it's already build-in.
   * @param {LayoutRowFilter} pipedFilter
   * @returns {LayoutRowFilter}
   * @private
   */
  private _and(pipedFilter: LayoutRowFilter): LayoutRowFilter {
    return this.and(pipedFilter, false);
  }

  /**
   * private version of OR that doesn't update name, in order to avoid rebuilding an entire filter when it's already build-in.
   * @param {LayoutRowFilter} pipedFilter
   * @returns {LayoutRowFilter}
   * @private
   */
  private _or(pipedFilter: LayoutRowFilter): LayoutRowFilter {
    return this.or(pipedFilter, false);
  }
}
