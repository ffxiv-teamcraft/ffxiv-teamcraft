import {ListRow} from './list-row';
import {FirebaseDataModel} from './firebase-data-model';
import {CraftAddition} from './craft-addition';
import {GarlandToolsService} from '../../core/api/garland-tools.service';
import {I18nToolsService} from '../../core/i18n-tools.service';
import {MathTools} from 'app/tools/math-tools';

export class List extends FirebaseDataModel {
    name: string;
    recipes: ListRow[] = [];
    preCrafts: ListRow[] = [];
    gathers: ListRow[] = [];
    others: ListRow[] = [];
    crystals: ListRow[] = [];
    createdAt: string = new Date().toISOString();

    constructor() {
        super();
    }

    public forEachItem(method: (arg: ListRow) => void): void {
        (this.others || []).forEach(method);
        (this.gathers || []).forEach(method);
        (this.preCrafts || []).forEach(method);
    }

    public addToRecipes(data: ListRow): ListRow {
        return this.add(this.recipes, data, true);
    }

    public addToPreCrafts(data: ListRow): ListRow {
        return this.add(this.preCrafts, data);
    }

    public addToGathers(data: ListRow): ListRow {
        return this.add(this.gathers, data);
    }

    public addToOthers(data: ListRow): ListRow {
        return this.add(this.others, data);
    }

    public addToCrystals(data: ListRow): ListRow {
        return this.add(this.crystals, data);
    }

    private add(array: ListRow[], data: ListRow, recipe = false): ListRow {
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
            }
        }
        if (!recipe) {
            row.amount_needed = MathTools.absoluteCeil(row.amount / row.yield);
        } else {
            row.amount_needed = row.amount;
        }
        return row;
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

    public setDone(pitem: ListRow, amount: number): void {
        const item = this.getItemById(pitem.id, pitem.addedAt);
        item.done += amount;
        if (item.done > item.amount) {
            item.done = item.amount;
        }
        if (item.done < 0) {
            item.done = 0;
        }
        if (item.requires !== undefined) {
            for (const requirement of item.requires) {
                const requirementItem = this.getItemById(requirement.id);
                this.setDone(requirementItem, MathTools.absoluteCeil(requirement.amount * amount / requirementItem.yield));
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
        let res = true;
        this.forEachItem(i => {
            res = res && (i.amount_needed === undefined);
        });
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
                        name: i18n.createI18nName(crystal),
                        icon: crystal.icon,
                        amount: element.amount * addition.amount,
                        done: 0,
                        yield: 1,
                        addedAt: Date.now()
                    });
                } else {
                    const elementDetails = addition.data.getIngredient(element.id);
                    if (elementDetails.isCraft()) {
                        const yields = elementDetails.craft[0].yield || 1;
                        const resultRow = this.addToPreCrafts({
                            id: elementDetails.id,
                            icon: elementDetails.icon,
                            amount: element.amount * addition.amount,
                            requires: elementDetails.craft[0].ingredients,
                            done: 0,
                            name: i18n.createI18nName(elementDetails),
                            yield: yields,
                            addedAt: Date.now()
                        });
                        nextIteration.push({
                            item: elementDetails,
                            data: addition.data,
                            amount: resultRow.amount_needed
                        });
                    } else if (elementDetails.hasNodes() || elementDetails.hasFishingSpots()) {
                        this.addToGathers({
                            id: elementDetails.id,
                            icon: elementDetails.icon,
                            amount: element.amount * addition.amount,
                            done: 0,
                            name: i18n.createI18nName(elementDetails),
                            yield: 1,
                            addedAt: Date.now()
                        });
                    } else {
                        this.addToOthers({
                            id: elementDetails.id,
                            icon: elementDetails.icon,
                            amount: element.amount * addition.amount,
                            done: 0,
                            name: i18n.createI18nName(elementDetails),
                            yield: 1,
                            addedAt: Date.now()
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
