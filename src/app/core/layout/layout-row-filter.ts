import {ListRow} from '../../model/list/list-row';
import {FilterMethod} from './filter-method';
import {FilterResult} from './filter-result';
import {CraftedBy} from '../../model/list/crafted-by';

export class LayoutRowFilter {

    static NONE = new LayoutRowFilter(() => false, 'NONE');

    static IS_CRAFT = new LayoutRowFilter(row => row.craftedBy !== undefined, 'IS_CRAFT');

    static IS_GATHERING = new LayoutRowFilter(row => row.gatheredBy !== undefined, 'IS_GATHERING');

    static CAN_BE_BOUGHT = new LayoutRowFilter(row => row.vendors !== undefined, 'CAN_BE_BOUGHT');

    static IS_MASTERCRAFT = LayoutRowFilter.IS_CRAFT
        ._and(new LayoutRowFilter(row => row.craftedBy.find(craft => craft.masterbook !== undefined) !== undefined,
            'IS_MASTERCRAFT'));

    static IS_FOLKLORE = LayoutRowFilter.IS_GATHERING
        ._and(new LayoutRowFilter(row => row.gatheredBy.legend !== undefined, 'IS_FOLKLORE'));

    static IS_TIMED = new LayoutRowFilter(row => {
        const isTimedGathering = row.gatheredBy !== undefined &&
            row.gatheredBy.nodes.filter(node => node.time !== undefined).length > 0;
        const isTimedReduction = row.reducedFrom !== undefined &&
            row.reducedFrom.filter(reduction => {
                return (<any>window).gt.bell.nodes.find(node => {
                    return node.items.find(item => item.id === reduction) !== undefined;
                }) !== undefined;
            }).length > 0;
        return isTimedGathering || isTimedReduction;
    }, 'IS_TIMED');

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
            return row.gatheredBy.type === 4;
        }, 'IS_GATHERED_BY_FSH'));

    static ANYTHING = new LayoutRowFilter(() => true, 'ANYTHING');

    static get ALL(): LayoutRowFilter[] {
        return LayoutRowFilter.ALL_NAMES.map(key => LayoutRowFilter[key]);
    }

    static get ALL_NAMES(): string[] {
        return Object.keys(LayoutRowFilter)
            .filter(key => ['ALL', 'ALL_NAMES', 'ANYTHING', 'fromString', 'processRows', 'not'].indexOf(key) === -1);
    }

    static fromString(filterString: string): LayoutRowFilter {
        const parsed = filterString.split(':');
        const baseFilterString: string = parsed.shift();
        const baseFilter: LayoutRowFilter = LayoutRowFilter[baseFilterString];
        if (parsed.length > 1) {
            return LayoutRowFilter.processRows(parsed, baseFilter);
        }
        return baseFilter;
    }

    private static processRows(stringRows: string[], filter: LayoutRowFilter): LayoutRowFilter {
        const operator = stringRows.shift();
        let filterString = stringRows.shift();
        if (operator !== undefined && filterString !== undefined) {
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

    public static not(baseFilter: LayoutRowFilter): LayoutRowFilter {
        return new LayoutRowFilter((row: ListRow) => {
            return !baseFilter._filter(row);
        }, `!${baseFilter.name}`);
    }

    /**
     * A filter needs a method, and eventually a base string for serialization (used to resolve filter chains).
     * @param {FilterMethod} _filter
     * @param _name
     */
    constructor(private _filter: FilterMethod, private _name: string) {
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

    // noinspection JSValidateJSDoc
    /**
     * Filters a list with the filter
     * @param rows
     * @param args
     * @returns {accepted: ListRow[]; rejected: ListRow[]} A set of data with rejected and accepted rows.
     */
    filter(rows: ListRow[]): FilterResult {
        const result = {accepted: [], rejected: []};
        for (const row of rows) {
            if (this._filter(row)) {
                result.accepted.push(row);
            } else {
                result.rejected.push(row);
            }
        }
        return result;
    }

    public get name(): string {
        return this._name;
    }
}
