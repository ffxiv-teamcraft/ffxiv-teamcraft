import {Injectable} from '@angular/core';
import {List} from '../model/list';
import {Observable} from 'rxjs';
import {ListRow} from '../model/list-row';
import {XivdbService} from './xivdb.service';

@Injectable()
export class ListManagerService {

    constructor(private xivdb: XivdbService) {
    }

    public setDone(item: ListRow, amount: number, list: List): void {
        item.done += amount;
        if (item.done > item.amount) {
            item.done = item.amount;
        }
        if (item.requires !== undefined) {
            item.requires.forEach(requirement => {
                const requirementItem = this.getById(requirement.id, list);
                this.setDone(requirementItem, requirement.amount * amount, list);
            });
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

    public addToList(recipeId: number, plist: List, amount = 1): Observable<List> {
        return Observable.of(this.initList(plist))
            .mergeMap(list => {
                return this.xivdb.getRecipe(recipeId)
                    .mergeMap(recipe => {
                        const added = this.add(list.recipes, recipe.item.id, amount);
                        added.name = recipe.name;
                        added.icon = recipe.item.icon;
                        added.recipeId = recipeId;
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
                            this.add(data.list.crystals, element.id, element.quantity * data.amount);
                        } else {
                            if (element.connect_craftable > 0) {
                                const synth = element.synths[Object.keys(element.synths)[0]];
                                res.push(
                                    this.xivdb.getRecipe(synth.id)
                                        .map(recipe => {
                                            const added = this.add(data.list.preCrafts, synth.item.id,
                                                element.quantity * data.amount);
                                            console.log(element.name, 'needs', element.quantity * data.amount, synth.item.name);
                                            return {
                                                parent: added,
                                                recipe: recipe,
                                                list: data.list,
                                                amount: element.quantity * data.amount
                                            };
                                        })
                                );
                            } else if (element.connect_gathering >= 1) {
                                this.add(data.list.gathers, element.id, element.quantity * data.amount);
                            } else {
                                this.add(data.list.others, element.id, element.quantity * data.amount);
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

    private add(array: ListRow[], id: number, amount: number): ListRow {
        const row = array.filter(r => {
            return r.id === id;
        });
        if (row.length === 0) {
            array.push({id: id, amount: amount, done: 0});
        } else {
            row[0].amount += amount;
        }
        return array.filter((r) => {
            return r.id === id;
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
