import { ListRow } from '../../modules/list/model/list-row';
import { FilterMethod } from './filter-method';
import { FilterResult } from './filter-result';
import { CraftedBy } from '../../modules/list/model/crafted-by';

export class LayoutRowFilter {

  static NONE = new LayoutRowFilter(() => false, 'NONE');

  static IS_CRAFT = new LayoutRowFilter(row => row.craftedBy !== undefined && row.craftedBy.length > 0, 'IS_CRAFT');

  static IS_GATHERING = new LayoutRowFilter(row => row.gatheredBy !== undefined, 'IS_GATHERING');

  static IS_TRADE = new LayoutRowFilter(row => row.tradeSources !== undefined && row.tradeSources.length > 0, 'IS_TRADE');

  static CAN_BE_BOUGHT = new LayoutRowFilter(row => {
    return row.vendors !== undefined && row.vendors.length > 0;
  }, 'CAN_BE_BOUGHT');

  static FROM_BEAST_TRIBE = new LayoutRowFilter(row => {
    if (row.tradeSources === undefined || row.vendors === undefined) {
      return false;
    }
    const beastTribeNpcs = [
      // Sylphic Vendor
      1005569,
      // Kobald Vendor
      1008909,
      // Sahagin Vendo
      1008907,
      // Amalj'aa Vendor
      1005554,
      // Ixali Vendor
      1009205,
      // Vath Stickpeddler
      1016804,
      // Luna Vanu
      1016093,
      // Mogmul Mogbelly
      1017172,
      // Shikitahe
      1024219,
      // Madhura
      1024774,
      // Gyosho
      1025604];
    return row.vendors.some(vendor => {
      return beastTribeNpcs.indexOf(vendor.npcId) > -1;
    }) || row.tradeSources.some(trade => {
      return trade.npcs.some(npc => {
        return beastTribeNpcs.indexOf(npc.id) > -1;
      });
    });
  }, 'FROM_BEAST_TRIBE');

  static IS_MONSTER_DROP = new LayoutRowFilter(row => row.drops !== undefined && row.drops.length > 0, 'IS_MONSTER_DROP');

  static IS_DUNGEON_DROP = new LayoutRowFilter(row => row.instances !== undefined && row.instances.length > 0, 'IS_DUNGEON_DROP');

  static IS_GC_TRADE = new LayoutRowFilter(row => row.tradeSources !== undefined && row.tradeSources
    .find(source => source.trades
        .find(trade => trade.currencies.find(currency => [20, 21, 22].indexOf(+currency.id) > -1) !== undefined)
      !== undefined) !== undefined, 'IS_GC_TRADE');

  static IS_TOKEN_TRADE = new LayoutRowFilter(row => {
    if (row.tradeSources !== undefined) {
      // These ids are for voidrake and Althyk lavender.
      for (const tokenId of [15858, 15857]) {
        if (row.tradeSources.some(source => {
          return source.trades.some(trade => {
            return trade.currencies.some(c => c.id === tokenId);
          });
        })) {
          return true;
        }
      }
    }
    return false;
  }, 'IS_TOKEN_TRADE');

  static IS_TOME_TRADE = new LayoutRowFilter(row => {
    if (row.tradeSources !== undefined) {
      const tomeIds = [
        28,
        35,
        36,
        37,
        7811,
        9383,
        14298,
        16928,
        19107,
        21789
      ];

      for (const tokenId of tomeIds) {
        if (row.tradeSources
          .some(source => source.trades
            .some(trade => trade.currencies.some(c => c.id === tokenId)
            )
          )) {
          return true;
        }
      }
    }
    return false;
  }, 'IS_TOME_TRADE');

  static IS_SCRIPT_TRADE = new LayoutRowFilter(row => {
    if (row.tradeSources !== undefined) {
      const scriptIds = [
        10309,
        10311,
        17833,
        17834
      ];

      for (const tokenId of scriptIds) {
        if (row.tradeSources.some(source => {
          return source.trades.some(trade => {
            return trade.currencies.some(c => c.id === tokenId);
          });
        })) {
          return true;
        }
      }
    }
    return false;
  }, 'IS_SCRIPT_TRADE');

  static IS_VENTURE = new LayoutRowFilter(row => row.ventures !== undefined && row.ventures.length > 0, 'IS_VENTURE');

  static IS_MASTERCRAFT = LayoutRowFilter.IS_CRAFT
    ._and(new LayoutRowFilter(row => row.craftedBy.find(craft => craft.masterbook !== undefined) !== undefined,
      'IS_MASTERCRAFT'));

  static IS_FOLKLORE = LayoutRowFilter.IS_GATHERING
    ._and(new LayoutRowFilter(row => row.gatheredBy.nodes.find(node => node.limitType !== undefined) !== undefined, 'IS_FOLKLORE'));

  static IS_TIMED = new LayoutRowFilter(row => {
    const isTimedGathering = row.gatheredBy !== undefined &&
      row.gatheredBy.nodes.filter(node => node.time !== undefined).length > 0;
    const isTimedReduction = row.reducedFrom !== undefined &&
      row.reducedFrom
        .map(reduction => {
          if (reduction.obj !== undefined) {
            return reduction.obj.i;
          }
          return reduction;
        })
        .filter(reduction => {
          return (<any>window).gt.bell.nodes.find(node => {
            return node.items.find(item => item.id === reduction) !== undefined;
          }) !== undefined;
        }).length > 0;
    return isTimedGathering || isTimedReduction;
  }, 'IS_TIMED');

  static IS_REDUCTION = new LayoutRowFilter(row => row.reducedFrom !== undefined && row.reducedFrom.length > 0, 'IS_REDUCTION');

  /**
   * CRAFTED BY FILTERS
   */

  static IS_CRAFTED_BY_ALC = LayoutRowFilter.IS_CRAFT
    ._and(new LayoutRowFilter((row: ListRow) => {
      return row.craftedBy.find((craftedByRow: CraftedBy) => {
        return craftedByRow.icon.toLowerCase().indexOf('alchemist') > -1;
      }) !== undefined;
    }, 'IS_CRAFTED_BY_ALC'));

  static IS_CRAFTED_BY_ARM = LayoutRowFilter.IS_CRAFT
    ._and(new LayoutRowFilter((row: ListRow) => {
      return row.craftedBy.find((craftedByRow: CraftedBy) => {
        return craftedByRow.icon.toLowerCase().indexOf('armorer') > -1;
      }) !== undefined;
    }, 'IS_CRAFTED_BY_ARM'));

  static IS_CRAFTED_BY_BSM = LayoutRowFilter.IS_CRAFT
    ._and(new LayoutRowFilter((row: ListRow) => {
      return row.craftedBy.find((craftedByRow: CraftedBy) => {
        return craftedByRow.icon.toLowerCase().indexOf('blacksmith') > -1;
      }) !== undefined;
    }, 'IS_CRAFTED_BY_BSM'));

  static IS_CRAFTED_BY_CRP = LayoutRowFilter.IS_CRAFT
    ._and(new LayoutRowFilter((row: ListRow) => {
      return row.craftedBy.find((craftedByRow: CraftedBy) => {
        return craftedByRow.icon.toLowerCase().indexOf('carpenter') > -1;
      }) !== undefined;
    }, 'IS_CRAFTED_BY_CRP'));

  static IS_CRAFTED_BY_CUL = LayoutRowFilter.IS_CRAFT
    ._and(new LayoutRowFilter((row: ListRow) => {
      return row.craftedBy.find((craftedByRow: CraftedBy) => {
        return craftedByRow.icon.toLowerCase().indexOf('culinarian') > -1;
      }) !== undefined;
    }, 'IS_CRAFTED_BY_CUL'));

  static IS_CRAFTED_BY_GSM = LayoutRowFilter.IS_CRAFT
    ._and(new LayoutRowFilter((row: ListRow) => {
      return row.craftedBy.find((craftedByRow: CraftedBy) => {
        return craftedByRow.icon.toLowerCase().indexOf('goldsmith') > -1;
      }) !== undefined;
    }, 'IS_CRAFTED_BY_GSM'));

  static IS_CRAFTED_BY_LTW = LayoutRowFilter.IS_CRAFT
    ._and(new LayoutRowFilter((row: ListRow) => {
      return row.craftedBy.find((craftedByRow: CraftedBy) => {
        return craftedByRow.icon.toLowerCase().indexOf('leatherworker') > -1;
      }) !== undefined;
    }, 'IS_CRAFTED_BY_LTW'));

  static IS_CRAFTED_BY_WVR = LayoutRowFilter.IS_CRAFT
    ._and(new LayoutRowFilter((row: ListRow) => {
      return row.craftedBy.find((craftedByRow: CraftedBy) => {
        return craftedByRow.icon.toLowerCase().indexOf('weaver') > -1;
      }) !== undefined;
    }, 'IS_CRAFTED_BY_WVR'));

  /**
   * GATHERED BY FILTERS
   */
  static IS_GATHERED_BY_BTN = LayoutRowFilter.IS_GATHERING
    ._and(new LayoutRowFilter((row: ListRow) => {
      return [2, 3].indexOf(row.gatheredBy.type) > -1;
    }, 'IS_GATHERED_BY_BTN'));

  static IS_GATHERED_BY_MIN = LayoutRowFilter.IS_GATHERING
    ._and(new LayoutRowFilter((row: ListRow) => {
      return [0, 1].indexOf(row.gatheredBy.type) > -1;
    }, 'IS_GATHERED_BY_MIN'));

  static IS_GATHERED_BY_FSH = LayoutRowFilter.IS_GATHERING
    ._and(new LayoutRowFilter((row: ListRow) => {
      return row.gatheredBy.icon.indexOf('FSH') > -1;
    }, 'IS_GATHERED_BY_FSH'));

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
      .filter(key => ['ALL', 'ALL_NAMES', 'ANYTHING', 'fromString', 'processRows', 'not'].indexOf(key) === -1);
  }

  public get name(): string {
    return this._name;
  }

  static fromString(filterString: string): LayoutRowFilter {
    const parsed = filterString.split(':');
    const baseFilterString: string = parsed.shift().replace('!', '');
    const baseFilter: LayoutRowFilter = LayoutRowFilter[baseFilterString];
    if (parsed.length > 1 && baseFilter !== undefined) {
      return LayoutRowFilter.processRows(parsed, baseFilter);
    }
    return baseFilter;
  }

  public static not(baseFilter: LayoutRowFilter): LayoutRowFilter {
    return new LayoutRowFilter((row: ListRow) => {
      return !baseFilter._filter(row);
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
    return new LayoutRowFilter((row: ListRow) => {
      return this._filter(row) && pipedFilter._filter(row);
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
    return new LayoutRowFilter((row: ListRow) => {
      return this._filter(row) || pipedFilter._filter(row);
    }, newName);
  }

  // noinspection JSValidateJSDoc
  /**
   * Filters a list with the filter
   * @param rows
   * @param args
   * @returns {accepted: ListRow[]; rejected: ListRow[]} A set of data with rejected and accepted rows.
   */
  filter(rows: ListRow[]): FilterResult {
    const result = { accepted: [], rejected: [] };
    for (const row of rows) {
      if (this._filter(row)) {
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
