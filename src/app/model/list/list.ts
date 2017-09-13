import {ListRow} from './list-row';
import {FirebaseDataModel} from './firebase-data-model';
import {CraftAddition} from './craft-addition';
import {GarlandToolsService} from '../../core/api/garland-tools.service';
import {I18nToolsService} from '../../core/i18n-tools.service';
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
        return this.add(this.recipes, data);
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

    private add(array: ListRow[], data: ListRow): ListRow {
        const row = array.filter(r => {
            return r.id === data.id;
        });
        if (row.length === 0) {
            array.push(data);
        } else {
            row[0].amount += data.amount;
            if (row[0].amount < 0) {
                row[0].amount = 0;
            }
        }
        return array.filter((r) => {
            return r.id === data.id;
        })[0];
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
                this.setDone(requirementItem, Math.ceil(requirement.amount * amount) / requirementItem.yield);
            }
        }
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
                    const elementDetails = addition.data.getRelated(element.id);
                    if (elementDetails.isCraft()) {
                        const yields = elementDetails.craft[0].yield || 1;
                        const amount = element.amount * addition.amount / yields;
                        const preCraft = this.preCrafts.find(i => i.id === element.id);
                        this.addToPreCrafts({
                            id: elementDetails.id,
                            icon: elementDetails.icon,
                            amount: amount,
                            requires: elementDetails.craft[0].ingredients,
                            done: 0,
                            name: i18n.createI18nName(elementDetails),
                            yield: yields,
                            addedAt: Date.now()
                        });
                        // If adding a requirement doesn't add a craft (like if you need another 0.3
                        // of this item but it doesn't make 2 crafts.
                        if (preCraft !== undefined && Math.ceil(preCraft.amount + amount) === Math.ceil(preCraft.amount)) {
                            continue;
                        }
                        nextIteration.push({
                            item: elementDetails,
                            data: addition.data,
                            amount: Math.ceil(amount)
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
