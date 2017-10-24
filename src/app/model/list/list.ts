import {ListRow} from './list-row';
import {FirebaseDataModel} from './firebase-data-model';
import {CraftAddition} from './craft-addition';
import {GarlandToolsService} from '../../core/api/garland-tools.service';
import {I18nToolsService} from '../../core/i18n-tools.service';
import {MathTools} from 'app/tools/math-tools';
import * as semver from 'semver';

declare const ga: Function;

export class List extends FirebaseDataModel {
    name: string;
    recipes: ListRow[] = [];
    preCrafts: ListRow[] = [];
    gathers: ListRow[] = [];
    others: ListRow[] = [];
    crystals: ListRow[] = [];
    createdAt: string = new Date().toISOString();
    version: string;

    favorites: string[] = [];

    constructor() {
        super();
    }

    public clone(): List {
        const clone = new List();
        for (const prop of Object.keys(this)) {
            if (['recipes', 'preCrafts', 'gathers', 'others', 'crystals'].indexOf(prop) > -1) {
                clone[prop] = this[prop];
            }
        }
        clone.name = this.name;
        clone.version = this.version || '1.0.0';
        delete clone.$key;
        ga('send', 'event', 'List', 'creation');
        ga('send', 'event', 'List', 'clone');
        return clone;
    }

    public forEachItem(method: (arg: ListRow) => void): void {
        (this.others || []).forEach(method);
        (this.gathers || []).forEach(method);
        (this.preCrafts || []).forEach(method);
    }

    public forEach(method: (arg: ListRow) => void): void {
        (this.crystals || []).forEach(method);
        (this.others || []).forEach(method);
        (this.gathers || []).forEach(method);
        (this.preCrafts || []).forEach(method);
        (this.recipes || []).forEach(method);
    }

    public addToRecipes(data: ListRow): number {
        return this.add(this.recipes, data);
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

    private add(array: ListRow[], data: ListRow): number {
        let previousAmount = 0;
        let row = array.find(r => {
            return r.id === data.id;
        });
        if (row === undefined) {
            array.push(data);
            row = array[array.length - 1];
        } else {
            row.amount = MathTools.round(row.amount + data.amount);
            if (row.amount < 0) {
                row.amount = 0;
                row.amount_needed = row.amount;
            }
            previousAmount = row.amount_needed;
        }
        row.amount_needed = MathTools.absoluteCeil(row.amount / row.yield);
        return row.amount_needed - previousAmount;
    }

    public clean(): List {
        for (const prop of Object.keys(this)) {
            if (['recipes', 'preCrafts', 'gathers', 'others', 'crystals'].indexOf(prop) > -1) {
                this[prop] = this[prop].filter(row => {
                    return row.amount > 0;
                });
            }
        }
        return this;
    }

    public isEmpty(): boolean {
        return this.recipes.length === 0 &&
            this.preCrafts.length === 0 &&
            this.gathers.length === 0 &&
            this.others.length === 0 &&
            this.crystals.length === 0;
    }

    public getItemById(id: number, addedAt?: number): ListRow {
        for (const prop of Object.keys(this)) {
            if (prop !== 'name') {
                for (const row of this[prop]) {
                    if (row.id === id) {
                        if (addedAt !== undefined) {
                            if (addedAt === row.addedAt) {
                                return row;
                            }
                        } else {
                            return row;
                        }
                    }
                }
            }
        }
        return undefined;
    }

    public setDone(pitem: ListRow, amount: number, recipe: boolean = false): void {
        const item = this.getItemById(pitem.id, pitem.addedAt);
        item.done += amount;
        if (item.done > item.amount) {
            item.done = item.amount;
        }
        if (item.done < 0) {
            item.done = 0;
        }
        amount = MathTools.absoluteCeil(amount / pitem.yield);
        if (item.requires !== undefined) {
            for (const requirement of item.requires) {
                const requirementItem = this.getItemById(requirement.id);
                let nextAmount = requirement.amount * amount;
                // If this is not a precraft, we have to take yields in consideration.
                if (requirementItem.requires === undefined) {
                    nextAmount = MathTools.absoluteCeil(nextAmount / requirementItem.yield);
                }
                this.setDone(requirementItem, nextAmount);
            }
        }
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
        this.forEachItem(i => {
            res = res || (i.amount_needed === undefined);
            if (i.gatheredBy !== undefined) {
                res = res || (i.gatheredBy.type === undefined);
            }
        });
        res = res || (this.version === undefined);
        res = res || semver.ltr(this.version, '2.3.0');
        return res;
    }

    public resetDone(item: ListRow): void {
        item.done = 0;
        if (item.requires !== undefined) {
            item.requires.forEach(requirement => {
                const requirementItem = this.getItemById(requirement.id);
                this.resetDone(requirementItem);
            });
        }
    }

    public addCraft(additions: CraftAddition[], gt: GarlandToolsService, i18n: I18nToolsService): List {
        const nextIteration: CraftAddition[] = [];
        for (const addition of additions) {
            for (const element of addition.item.craft[0].ingredients) {
                // If this is a crystal
                if (element.id < 20 && element.id > 1) {
                    const crystal = gt.getCrystalDetails(element.id);
                    this.addToCrystals({
                        id: element.id,
                        icon: crystal.icon,
                        amount: element.amount * addition.amount,
                        done: 0,
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
                            yield: yields,
                            addedAt: Date.now()
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
                            yield: 1
                        });
                    } else {
                        if (element.id === 19849) {
                            console.log(element.amount, addition.amount);
                        }
                        this.addToOthers({
                            id: elementDetails.id,
                            icon: elementDetails.icon,
                            amount: element.amount * addition.amount,
                            done: 0,
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
