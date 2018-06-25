import {ListRow} from './list-row';
import {CraftAddition} from './craft-addition';
import {GarlandToolsService} from '../../core/api/garland-tools.service';
import {I18nToolsService} from '../../core/tools/i18n-tools.service';
import {MathTools} from 'app/tools/math-tools';
import * as semver from 'semver';
import {ListTag} from './list-tag.enum';
import {LocalizedDataService} from '../../core/data/localized-data.service';
import {ResourceComment} from '../../modules/comments/resource-comment';
import {Craft} from '../garland-tools/craft';
import {DataWithPermissions} from '../../core/database/permissions/data-with-permissions';

declare const ga: Function;

export class List extends DataWithPermissions {
    name: string;
    recipes: ListRow[] = [];
    preCrafts: ListRow[] = [];
    gathers: ListRow[] = [];
    others: ListRow[] = [];
    crystals: ListRow[] = [];

    note = '';

    // noinspection JSUnusedGlobalSymbols
    createdAt: string = new Date().toISOString();

    version: string;

    favorites: string[] = [];

    tags: ListTag[] = [];

    public: boolean;

    forks = 0;

    ephemeral: boolean;

    comments: ResourceComment[];

    constructor() {
        super();
    }

    public isComplete(): boolean {
        return this.recipes.filter(recipe => recipe.done < recipe.amount).length === 0;
    }

    public clone(): List {
        const clone = new List();
        for (const prop of Object.keys(this)) {
            if (['recipes', 'preCrafts', 'gathers', 'others', 'crystals', 'note'].indexOf(prop) > -1) {
                clone[prop] = JSON.parse(JSON.stringify(this[prop]));
            }
        }
        clone.name = this.name;
        clone.version = this.version || '1.0.0';
        clone.tags = this.tags;
        delete clone.$key;
        ga('send', 'event', 'List', 'creation');
        ga('send', 'event', 'List', 'clone');
        this.forks++;
        clone.reset();
        return clone;
    }

    public reset(): void {
        this.recipes.forEach(recipe => this.resetDone(recipe));
    }

    /**
     * Iterates on others, gathers and preCrafts.
     * @param {(arg: ListRow) => void} method
     */
    public forEachItem(method: (arg: ListRow) => void): void {
        (this.others || []).forEach(method);
        (this.gathers || []).forEach(method);
        (this.preCrafts || []).forEach(method);
    }

    /**
     * Iterates on every item in the list, from recipes to crystals.
     * @param {(arg: ListRow) => void} method
     */
    public forEach(method: (arg: ListRow) => void): void {
        this.crystals.forEach(method);
        this.others.forEach(method);
        this.gathers.forEach(method);
        this.preCrafts.forEach(method);
        this.recipes.forEach(method);
    }

    /**
     * Iterates on recipes and preCrafts.
     * @param {(arg: ListRow) => void} method
     */
    public forEachCraft(method: (arg: ListRow) => void): void {
        (this.preCrafts || []).filter(row => row.craftedBy !== undefined && row.craftedBy.length > 0).forEach(method);
        (this.recipes || []).filter(row => row.craftedBy !== undefined && row.craftedBy.length > 0).forEach(method);
    }

    /**
     * Returns all items, which means everything except final recipes and crystals.
     * @returns {ListRow[]}
     */
    public get items(): ListRow[] {
        return (this.others || []).concat(this.gathers || []).concat(this.preCrafts || []);
    }

    public addToItems(data: ListRow): number {
        return this.add(this.recipes, data, true);
    }

    public addToPreCrafts(data: ListRow): number {
        return this.add(this.preCrafts, data);
    }

    public addToGathers(data: ListRow): number {
        return this.add(this.gathers, data);
    }

    public addToOthers(data: ListRow): number {
        return this.add(this.others, data);
    }

    public addToCrystals(data: ListRow): number {
        return this.add(this.crystals, data);
    }

    /**
     * Merges the list with another one, used for list additions to me more efficient.
     * @param {List} otherList
     * @returns {List}
     */
    public merge(otherList: List): List {
        otherList.crystals.forEach(crystal => {
            this.add(this.crystals, crystal);
        });
        otherList.gathers.forEach(gather => {
            this.add(this.gathers, gather);
        });
        otherList.others.forEach(other => {
            this.add(this.others, other);
        });
        otherList.preCrafts.forEach(preCraft => {
            this.add(this.preCrafts, preCraft, true);
        });
        otherList.recipes.forEach(recipe => {
            this.add(this.recipes, recipe, true);
        });
        return this.clean();
    }

    private add(array: ListRow[], data: ListRow, recipe = false): number {
        let previousAmount = 0;
        let row = array.find(r => {
            return r.id === data.id;
        });
        if (row === undefined) {
            array.push(data);
            row = array[array.length - 1];
        } else {
            row.amount = MathTools.absoluteCeil(row.amount + data.amount);
            previousAmount = row.amount_needed;
        }
        row.amount_needed = Math.ceil(row.amount / row.yield);
        const added = row.amount_needed - previousAmount;
        if (added < 0 && recipe) {
            const previousDone = row.done;
            if (previousDone > row.amount_needed) {
                this.setDone(row, row.amount_needed - previousDone);
            }
        }
        return added;
    }

    /**
     * Cleans the list, checking amounts and removing useless rows (with amount <= 0).
     * @returns {List}
     */
    public clean(): List {
        for (const prop of Object.keys(this)) {
            if (['recipes', 'preCrafts', 'gathers', 'others', 'crystals'].indexOf(prop) > -1) {
                // We don't want to check the amount of items required for recipes, as they can't be wrong (provided by the user only).
                if (prop !== 'recipes') {
                    this[prop].forEach(row => {
                        if (prop !== 'preCrafts') {
                            row.amount = row.amount_needed = this.totalAmountRequired(<ListRow>row);
                        } else {
                            row.amount = this.totalAmountRequired(<ListRow>row);
                            row.amount_needed = Math.ceil(row.amount / row.yield);
                        }
                    });
                }
                this[prop] = this[prop].filter(row => row.amount > 0);
            }
        }
        return this;
    }

    /**
     * Gets the total amount needed for a given item based on requirements of the crafts in the list.
     * @param {ListRow} item
     * @returns {number}
     */
    private totalAmountRequired(item: ListRow): number {
        if (this.getItemById(item.id) === undefined) {
            return 0;
        }
        let count = 0;
        this.forEachCraft(craft => {
            // We have to use filter because some items (airships) might require twice the same item.
            const requirements = craft.requires.filter(req => req.id === item.id);
            if (requirements.length > 0) {
                requirements.forEach(requirement => {
                    count += craft.amount_needed * requirement.amount;
                });
            }
        });
        return count;
    }

    /**
     * Checks if a list is large or not, mostly used for display purpose.
     * @returns {boolean}
     */
    public isLarge(): boolean {
        let items = 0;
        items += this.crystals.length;
        items += this.gathers.length;
        items += this.preCrafts.length;
        items += this.recipes.length;
        items += this.others.length;
        return items > 100;
    }

    public isEmpty(): boolean {
        return this.recipes.length === 0 &&
            this.preCrafts.length === 0 &&
            this.gathers.length === 0 &&
            this.others.length === 0 &&
            this.crystals.length === 0;
    }

    public getItemById(id: number, excludeRecipes: boolean = false): ListRow {
        for (const array of Object.keys(this).filter(key => excludeRecipes ? key !== 'recipes' : true)) {
            for (const row of this[array]) {
                if (row === undefined) {
                    continue;
                }
                if (row.id === id) {
                    return row;
                }
            }
        }
        return undefined;
    }


    orderCrystals(): ListRow[] {
        if (this.crystals === null) {
            return [];
        }
        return this.crystals === null ? null : this.crystals.sort((a, b) => a.id - b.id);
    }

    orderGatherings(dataService: LocalizedDataService): ListRow[] {
        if (this.gathers === null) {
            return [];
        }
        return this.gathers.sort((a, b) => {
            if (dataService.getItem(b.id).en > dataService.getItem(a.id).en) {
                if (dataService.getItem(a.id).en > dataService.getItem(b.id).en) {
                    return 1;
                } else {
                    return -1;
                }
            } else {
                if (dataService.getItem(a.id).en > dataService.getItem(b.id).en) {
                    return 1;
                } else {
                    return 0;
                }
            }
        });
    }

    /**
     * Adds items to a given row and tags them as used if they're "done" from another craft.
     *
     * For instance, if you already have Iron ingots, you'll check them into the list, and it'll check the ores needed for the craft,
     * it will also mark them as used as you aren't supposed to have them in your inventory as you used them for the craft.
     *
     * @param {ListRow} pitem
     * @param {number} amount
     * @param {boolean} setUsed
     * @param {boolean} excludeRecipes
     * @param initialAddition
     */
    public setDone(pitem: ListRow, amount: number, excludeRecipes = false, setUsed = false, initialAddition = amount): void {
        const item = this.getItemById(pitem.id, excludeRecipes);
        const previousDone = MathTools.absoluteCeil(item.done / item.yield);
        if (setUsed) {
            // Save previous used amount
            const previousUsed = item.used;
            // Update used amount
            item.used += amount;
            // Set amount to the amount of items to add to the total.
            amount = amount - (item.done - previousUsed);
            // Only add more if used > done
            if (amount > 0) {
                item.done += amount;
            }
            if (item.used > item.amount) {
                item.used = item.amount;
            }
            if (item.used < 0) {
                item.used = 0;
            }
        } else {
            item.done += amount;
        }
        if (item.done > item.amount) {
            item.done = item.amount;
        }
        if (item.done < 0) {
            item.done = 0;
        }
        amount = MathTools.absoluteCeil(amount / pitem.yield);
        const newDone = MathTools.absoluteCeil(item.done / item.yield);
        if (item.requires !== undefined && newDone !== previousDone) {
            for (const requirement of item.requires) {
                const requirementItem = this.getItemById(requirement.id, excludeRecipes);
                if (requirementItem !== undefined) {
                    let nextAmount = requirement.amount * amount;
                    // If this is not a precraft, we have to take yields in consideration.
                    if (requirementItem.requires === undefined) {
                        nextAmount = MathTools.absoluteCeil(nextAmount / requirementItem.yield);
                    }
                    // If both nextAmount and the addition to used are same sign, we can propagate changes, else we don't want to go further
                    // because it's probably because we added items but the requirements is not only for this item,
                    // so we don't want to reduce the amount.
                    if ((nextAmount < 0) === (newDone - previousDone < 0)
                        && (nextAmount < 0) === (initialAddition < 0)
                        && (newDone - previousDone < 0) === (initialAddition < 0)) {
                        // If the amount of items we did in this iteration hasn't changed, no need to mark requirements as used,
                        // as we didn't use more.
                        this.setDone(requirementItem, nextAmount, true, previousDone !== item.done, initialAddition);
                    }
                }
            }
        }
    }

    canBeCrafted(item: ListRow): boolean {
        if (item.craftedBy === undefined || item.craftedBy.length === 0 || item.requires === undefined) {
            return false;
        }
        let canCraft = true;
        for (const requirement of item.requires) {
            // If the requirement is a crystal, don't mind it.
            if (requirement.id < 20 && requirement.id > 1) {
                continue;
            }
            const requirementItem = this.getItemById(requirement.id, true);
            if (requirementItem !== undefined) {
                // While each requirement has enough items remaining, you can craft the item.
                // If only one misses, then this will turn false for the rest of the loop
                canCraft = canCraft &&
                    (requirementItem.done - requirementItem.used) >= requirement.amount * (item.amount_needed - (item.done / item.yield));
            }
        }
        return canCraft;
    }

    /**
     * Checks if the list is outdated, the implementation is meant to change.
     * @returns {boolean}
     */
    public isOutDated(): boolean {
        if (this.isEmpty()) {
            return false;
        }
        let res = false;
        res = res || (this.version === undefined);
        res = res || semver.ltr(this.version, '4.1.7');
        return res;
    }

    public resetDone(item: ListRow): void {
        item.done = 0;
        item.used = 0;
        if (item.requires !== undefined) {
            item.requires.forEach(requirement => {
                const requirementItem = this.getItemById(requirement.id, true);
                this.resetDone(requirementItem);
            });
        }
    }

    public addCraft(additions: CraftAddition[], gt: GarlandToolsService, i18n: I18nToolsService, recipeId?: string): List {
        const nextIteration: CraftAddition[] = [];
        for (const addition of additions) {
            let craft: Craft;
            if (recipeId !== undefined) {
                craft = addition.item.craft.find(c => c.id.toString() === recipeId.toString());
            } else {
                craft = addition.item.craft[0];
            }
            for (const element of craft.ingredients) {
                // If this is a crystal
                if (element.id < 20 && element.id > 1) {
                    const crystal = gt.getCrystalDetails(element.id);
                    this.addToCrystals({
                        id: element.id,
                        icon: crystal.icon,
                        amount: element.amount * addition.amount,
                        done: 0,
                        used: 0,
                        yield: 1
                    });
                } else {
                    const elementDetails = addition.data.getIngredient(element.id);
                    if (elementDetails.isCraft()) {
                        const yields = elementDetails.craft[0].yield || 1;
                        const added = this.addToPreCrafts({
                            id: elementDetails.id,
                            icon: elementDetails.icon,
                            amount: element.amount * addition.amount,
                            requires: elementDetails.craft[0].ingredients,
                            done: 0,
                            used: 0,
                            yield: yields
                        });
                        nextIteration.push({
                            item: elementDetails,
                            data: addition.data,
                            amount: added
                        });
                    } else if (elementDetails.hasNodes() || elementDetails.hasFishingSpots()) {
                        this.addToGathers({
                            id: elementDetails.id,
                            icon: elementDetails.icon,
                            amount: element.amount * addition.amount,
                            done: 0,
                            used: 0,
                            yield: 1
                        });
                    } else {
                        this.addToOthers({
                            id: elementDetails.id,
                            icon: elementDetails.icon,
                            amount: element.amount * addition.amount,
                            done: 0,
                            used: 0,
                            yield: 1
                        });
                    }
                }
            }
        }
        if (nextIteration.length > 0) {
            return this.addCraft(nextIteration, gt, i18n);
        }
        return this;
    }
}
