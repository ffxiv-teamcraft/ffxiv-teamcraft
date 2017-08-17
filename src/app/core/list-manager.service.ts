import {Injectable} from '@angular/core';
import {List} from '../model/list';
import {Observable} from 'rxjs';
import {ListRow} from '../model/list-row';
import {DataService} from './data.service';
import {CraftedBy} from '../model/crafted-by';
import {I18nName} from '../model/i18n-name';
import {GarlandToolsService} from 'app/core/garland-tools.service';
import {CraftAddition} from '../model/craft-addition';

@Injectable()
export class ListManagerService {

    constructor(protected db: DataService, private gt: GarlandToolsService) {
    }

    protected getI18nName(item: any): I18nName {
        return {
            fr: item.fr.name,
            en: item.en.name,
            de: item.de.name,
            ja: item.ja.name,
        };
    }

    protected getCraftedBy(item: any): Observable<CraftedBy[]> {
        const result = [];
        for (const craft of item.craft) {
            let stars_tooltip = '';
            for (let i = 0; i < craft.stars; i++) {
                stars_tooltip += '★';
            }
            const craftedBy: CraftedBy = {
                icon: `https://secure.xivdb.com/img/classes/set2/${this.gt.getJob(craft.job).name.toLowerCase()}.png`,
                level: craft.lvl,
                stars_tooltip: stars_tooltip
            };
            if (craft.unlockId !== undefined) {
                result.push(this.db.getItem(craft.unlockId).map(masterbook => {
                    craftedBy.masterbook = {
                        name: this.getI18nName(masterbook.item),
                        id: masterbook.item.id
                    };
                    return craftedBy;
                }));
            } else {
                result.push(Observable.of(craftedBy));
            }
        }
        return Observable.combineLatest(result);
    }

    protected getCraft(item: any, id: number): any {
        return item.craft.filter(c => c.id === id);
    }

    public addToList(itemId: number, plist: List, recipeId: number, amount = 1): Observable<List> {
        return Observable
            .of(this.initList(plist))
            .mergeMap(list => {
                return this.db.getItem(itemId)
                    .mergeMap(data => {
                        const toAdd: ListRow = {
                            id: data.item.id,
                            name: this.getI18nName(data.item),
                            icon: this.getIcon(data.item),
                            amount: amount,
                            done: 0,
                            recipeId: recipeId
                        };
                        return this.getCraftedBy(data.item).map(crafted => {
                            toAdd.craftedBy = crafted;
                            const added = this.add(list.recipes, toAdd);
                            added.requires = this.getCraft(data.item, recipeId)[0].ingredients;
                            return this.addCraft([{item: data.item, data: data, amount: amount}], list);
                        });
                    })
                    .map(l => this.cleanList(l))
                    .debounceTime(500);
            });
    }

    protected getRelated(data: any, id: number): any {
        return data.related.find(item => {
            return item.id === id;
        });
    }

    protected getIcon(item: any): string {
        return `https://www.garlandtools.org/db/icons/item/${item.icon}.png`;
    }

    protected addCraft(additions: CraftAddition[], list: List): List {
        const nextIteration: CraftAddition[] = [];
        for (const addition of additions) {
            for (const element of addition.item.craft[0].ingredients) {
                // If this is a crystal
                if (element.id < 20 && element.id > 1) {
                    const crystal = this.gt.getCrystalDetails(element.id);
                    this.add(list.crystals, {
                        id: element.id,
                        name: this.getI18nName(crystal),
                        icon: this.getIcon(crystal),
                        amount: element.amount * addition.amount,
                        done: 0
                    });
                } else {
                    const elementDetails = this.getRelated(addition.data, element.id);
                    if (elementDetails.craft !== undefined) {
                        this.add(list.preCrafts, {
                            id: elementDetails.id,
                            icon: this.getIcon(elementDetails),
                            amount: element.amount * addition.amount,
                            requires: elementDetails.craft[0].ingredients,
                            done: 0,
                            name: this.getI18nName(elementDetails)
                        });
                        nextIteration.push({
                            item: elementDetails,
                            data: addition.data,
                            amount: element.amount * addition.amount
                        });
                    } else if (elementDetails.nodes !== undefined) {
                        this.add(list.gathers, {
                            id: elementDetails.id,
                            icon: this.getIcon(elementDetails),
                            amount: element.amount * addition.amount,
                            done: 0,
                            name: this.getI18nName(elementDetails)
                        });
                    } else {
                        this.add(list.others, {
                            id: elementDetails.id,
                            icon: this.getIcon(elementDetails),
                            amount: element.amount * addition.amount,
                            done: 0,
                            name: this.getI18nName(elementDetails)
                        });
                    }
                }
            }
        }
        if (nextIteration.length > 0) {
            return this.addCraft(nextIteration, list);
        }
        return list;
    }

    public setDone(itemId: number, amount: number, list: List): void {
        const item = this.getById(itemId, list);
        item.done += amount;
        if (item.done > item.amount) {
            item.done = item.amount;
        }
        if (item.requires !== undefined) {
            for (const requirement of item.requires) {
                const requirementItem = this.getById(requirement.id, list);
                this.setDone(requirementItem.id, requirement.amount * amount, list);
            }
        }
    }

    public resetDone(item: ListRow, list: List): void {
        item.done = 0;
        if (item.requires !== undefined) {
            item.requires.forEach(requirement => {
                const requirementItem = this.getById(requirement.id, list);
                this.resetDone(requirementItem, list);
            });
        }
    }

    protected getById(id: number, list: List): ListRow {
        for (const prop of Object.keys(list)) {
            if (prop !== 'name') {
                for (const row of list[prop]) {
                    if (row.id === id) {
                        return row;
                    }
                }
            }
        }
        return undefined;
    }

    protected cleanList(list: List): List {
        for (const prop of Object.keys(list)) {
            if (prop !== 'name') {
                for (const row of list[prop]) {
                    if (row.amount <= 0) {
                        const index = list[prop].indexOf(row);
                        list[prop].splice(index, 1);
                    }
                }
            }
        }
        return list;
    }

    protected add(array: ListRow[], data: ListRow): ListRow {
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

    protected initList(list): List {
        list.recipes = list.recipes || [];
        list.preCrafts = list.preCrafts || [];
        list.gathers = list.gathers || [];
        list.others = list.others || [];
        list.crystals = list.crystals || [];
        return list;
    }
}
