import {Injectable} from '@angular/core';
import {List} from '../model/list';
import {Observable} from 'rxjs';
import {ListRow} from '../model/list-row';
import {XivdbService} from './xivdb.service';
import {CraftedBy} from '../model/crafted-by';

@Injectable()
export class ListManagerService {

    constructor(private xivdb: XivdbService) {
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

    private getById(id: number, list: List): ListRow {
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

    private getCraftedBy(recipe: any): CraftedBy[] {
        let stars_tooltip = '';
        for (let i = 0; i < recipe.stars; i++) {
            stars_tooltip += '★';
        }
        const craftedBy: CraftedBy = {
            icon: `https://secure.xivdb.com/img/classes/set2/${recipe.classjob.icon}.png`,
            level: recipe.level_view,
            stars_html: recipe.stars_html,
            stars_tooltip: stars_tooltip
        };

        if (recipe.masterbook !== undefined) {
            craftedBy.masterbook = {
                name: recipe.masterbook.name,
                id: recipe.masterbook.id
            };
        }
        return [craftedBy];
    }

    public addToList(recipeId: number, plist: List, amount = 1): Observable<List> {
        return Observable.of(this.initList(plist))
            .mergeMap(list => {
                return this.xivdb.getRecipe(recipeId)
                    .mergeMap(recipe => {
                        const added = this.add(list.recipes, {
                            id: recipe.item.id,
                            name: recipe.name,
                            icon: recipe.item.icon,
                            amount: amount,
                            done: 0,
                            craftedBy: this.getCraftedBy(recipe)
                        });
                        return this.addCrafts(added, recipe, list, amount);
                    });
            })
            .map(list => this.cleanList(list))
            .debounceTime(200);
    }

    private cleanList(list: List): List {
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

    private addCrafts(p: ListRow, r: any, l: List, a: number): Observable<List> {
        return Observable.of([{parent: p, recipe: r, list: l, amount: a}])
            .expand(dataArray => {
                const res = [];
                for (const data of dataArray) {
                    if (data.recipe === undefined) {
                        return Observable.empty();
                    }
                    for (const element of data.recipe.tree) {
                        if (parent !== undefined) {
                            data.parent.requires = data.parent.requires || [];
                            this.addRequirement(data.parent, element.id, element.quantity);
                        }
                        if (element.category_name === 'Crystal') {
                            this.add(data.list.crystals, {
                                id: element.id,
                                name: element.name,
                                icon: element.icon,
                                amount: element.quantity * data.amount,
                                done: 0
                            });
                        } else {
                            if (element.connect_craftable > 0) {
                                let craftedBy = [];
                                const synth = element.synths[Object.keys(element.synths)[0]];
                                Object.keys(element.synths).forEach(s => {
                                    craftedBy = [...this.getCraftedBy(element.synths[s]), ...craftedBy];
                                });
                                res.push(
                                    this.xivdb.getRecipe(synth.id)
                                        .map(recipe => {
                                            const added = this.add(data.list.preCrafts, {
                                                id: element.id,
                                                name: element.name,
                                                icon: element.icon,
                                                amount: element.quantity * data.amount,
                                                done: 0,
                                                craftedBy: craftedBy
                                            });
                                            return {
                                                parent: added,
                                                recipe: recipe,
                                                list: data.list,
                                                amount: element.quantity * data.amount
                                            };
                                        })
                                );
                            } else if (element.connect_gathering >= 1) {
                                this.add(data.list.gathers, {
                                    id: element.id,
                                    name: element.name,
                                    icon: element.icon,
                                    amount: element.quantity * data.amount,
                                    done: 0
                                });

                            } else {
                                this.add(data.list.others, {
                                    id: element.id,
                                    name: element.name,
                                    icon: element.icon,
                                    amount: element.quantity * data.amount,
                                    done: 0
                                });
                            }
                        }
                    }
                }
                if (res.length > 0) {
                    return Observable.concat(Observable.combineLatest(res));
                }
                return Observable.empty();
            })
            .map(d => d[0].list);
    }

    private add(array: ListRow[], data: ListRow): ListRow {
        const row = array.filter(r => {
            return r.id === data.id;
        });
        if (row.length === 0) {
            array.push(data);
        } else {
            row[0].amount += data.amount;
        }
        return array.filter((r) => {
            return r.id === data.id;
        })[0];
    }

    private addRequirement(item: ListRow, id: number, amount: number): ListRow {
        const row = item.requires.filter(r => {
            return r.id === id;
        });
        if (row.length === 0) {
            item.requires.push({id: id, amount: amount, done: 0});
        }
        return item.requires.filter((r) => {
            return r.id === id;
        })[0];
    }

    private initList(list): List {
        list.recipes = list.recipes || [];
        list.preCrafts = list.preCrafts || [];
        list.gathers = list.gathers || [];
        list.others = list.others || [];
        list.crystals = list.crystals || [];
        return list;
    }
}
