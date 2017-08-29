import { Injectable } from '@angular/core';
import { List } from '../model/list';
import { Observable } from 'rxjs';
import { ListRow } from '../model/list-row';
import { DataService } from './data.service';
import { CraftedBy } from '../model/crafted-by';
import { I18nName } from '../model/i18n-name';
import { GarlandToolsService } from 'app/core/garland-tools.service';
import { CraftAddition } from '../model/craft-addition';
import { GatheredBy } from '../model/gathered-by';
import { TradeSource } from '../model/trade-source';
import { Trade } from '../model/trade';
import { Instance } from 'app/model/instance';
import { Vendor } from '../model/vendor';

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

    protected generateStars(amount: number): string {
        let stars = '';
        for (let i = 0; i < amount; i++) {
            stars += '★';
        }
        return stars;
    }

    protected getCraftedBy(item: any): Observable<CraftedBy[]> {
        const result = [];
        for (const craft of item.craft) {
            const craftedBy: CraftedBy = {
                itemId: item.id,
                icon: `https://secure.xivdb.com/img/classes/set2/${this.gt.getJob(craft.job).name.toLowerCase()}.png`,
                level: craft.lvl,
                stars_tooltip: this.generateStars(craft.stars)
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

    protected getGatheredBy(item: any): GatheredBy {
        const gatheredBy: GatheredBy = {
            icon: '',
            stars_tooltip: '',
            level: 0,
            nodes: []
        };
        // If it's a node gather (not a fish)
        if (item.nodes !== undefined) {
            for (const node of item.nodes) {
                const details = this.gt.getNode(node);
                if (details.type <= 1) {
                    gatheredBy.icon = 'https://garlandtools.org/db/images/MIN.png';
                } else if (details.type < 4) {
                    gatheredBy.icon = 'https://garlandtools.org/db/images/BTN.png';
                } else {
                    gatheredBy.icon = 'https://garlandtools.org/db/images/FSH.png';
                }
                gatheredBy.stars_tooltip = this.generateStars(details.stars);
                gatheredBy.level = details.lvl;
                if (details.areaid !== undefined) {
                    gatheredBy.nodes.push(details);
                }
            }
        } else {
            // If it's a fish, we have to handle it in another way
            for (const spot of item.fishingSpots) {
                const details = this.gt.getFishingSpot(spot);
                gatheredBy.icon = 'https://garlandtools.org/db/images/FSH.png';
                if (details.areaid !== undefined) {
                    gatheredBy.nodes.push(details);
                }
                gatheredBy.level = details.lvl;
            }
        }
        return gatheredBy;
    }

    protected getTradeSources(item: any): Observable<TradeSource[]> {
        const tradeSources: Observable<TradeSource>[] = [];
        for (const ts of Object.keys(item.tradeSources)) {
            const tradeObs = Observable
                .of({
                    npcName: '',
                    zoneName: {fr: '', de: '', en: '', ja: ''}
                })
                .mergeMap((tradeSource: TradeSource) => {
                    return this.db.getNpc(+ts)
                        .map(data => {
                            tradeSource.npcName = data.npc.name;
                            if (data.npc.zoneid === undefined) {
                                return undefined;
                            }
                            tradeSource.zoneName = this.gt.getLocation(data.npc.zoneid).name;
                            return tradeSource as TradeSource;
                        });
                })
                .mergeMap((tradeSource: TradeSource) => {
                    const trades: Observable<Trade>[] = [];
                    for (const row of item.tradeSources[ts]) {
                        const obs: Observable<Trade> = Observable
                            .of({
                                itemIcon: 0,
                                itemAmount: 0,
                                currencyIcon: 0,
                                currencyAmount: 0,
                                itemHQ: false
                            })
                            .mergeMap(trade => {
                                return this.db.getItem(+row.item[0].id)
                                    .map(data => {
                                        trade.itemIcon = data.item.icon;
                                        trade.itemAmount = row.item[0].amount;
                                        trade.itemHQ = row.item[0].hq === 1;
                                        return trade;
                                    });
                            })
                            .mergeMap(trade => {
                                return this.db.getItem(+row.currency[0].id)
                                    .map(data => {
                                        trade.currencyIcon = data.item.icon;
                                        trade.currencyAmount = row.currency[0].amount;
                                        return trade;
                                    });
                            });
                        trades.push(obs);
                    }
                    return Observable.combineLatest(...trades, (...ptrades: Trade[]) => {
                        if (tradeSource === undefined) {
                            return undefined;
                        }
                        tradeSource.trades = ptrades;
                        return tradeSource;
                    });
                });
            tradeSources.push(tradeObs);
        }
        return Observable.combineLatest(...tradeSources, (...ts) => {
            return ts.filter(t => t !== undefined);
        });
    }

    protected getVendors(item: any): Observable<Vendor[]> {
        const vendors: Observable<Vendor>[] = [];
        for (const id of item.vendors) {
            const vendorObs: Observable<Vendor> = Observable
                .of({
                    npcName: '',
                    zoneName: {fr: '', de: '', en: '', ja: ''}
                }).mergeMap((vendor: Vendor) => {
                    return this.db.getNpc(+id)
                        .map(data => {
                            vendor.npcName = data.npc.name;
                            if (data.npc.zoneid === undefined) {
                                return undefined;
                            }
                            vendor.zoneName = this.gt.getLocation(data.npc.zoneid).name;
                            const tradeInfo = data.partials.find(o => o.obj.i === item.id);
                            vendor.price = tradeInfo.obj.p;
                            if (data.npc.coords !== undefined) {
                                vendor.coords = {
                                    x: data.npc.coords[0],
                                    y: data.npc.coords[1]
                                };
                            }
                            return vendor as Vendor;
                        });
                });
            vendors.push(vendorObs);
        }
        return Observable.combineLatest(vendors);
    }

    protected getReducedFrom(item: any): Observable<I18nName[]> {
        const reductions: Observable<I18nName>[] = [];
        for (const id of item.reducedFrom) {
            const reductionObs = Observable
                .of({fr: '', de: '', en: '', ja: ''})
                .mergeMap((name: I18nName) => {
                    return this.db.getItem(id).map(data => {
                        name = this.getI18nName(data.item);
                        return name;
                    });
                });
            reductions.push(reductionObs);
        }
        return Observable.combineLatest(reductions);
    }

    protected getDesynths(item: any): Observable<I18nName[]> {
        const desynths: Observable<I18nName>[] = [];
        for (const id of item.desynthedFrom) {
            const desynthObs = Observable
                .of({fr: '', de: '', en: '', ja: ''})
                .mergeMap((name: I18nName) => {
                    return this.db.getItem(id).map(data => {
                        name = this.getI18nName(data.item);
                        return name;
                    });
                });
            desynths.push(desynthObs);
        }
        return Observable.combineLatest(desynths);
    }

    protected getCraft(item: any, id: number): any {
        return item.craft.filter(c => c.id === id);
    }

    protected forEachItem(list: List, method: (arg: ListRow) => void) {
        list.others.forEach(method);
        list.gathers.forEach(method);
        list.preCrafts.forEach(method);
    }

    public addToList(itemId: number, plist: List, recipeId: number, amount = 1): Observable<List> {
        return Observable
            .of(this.initList(plist))
            .mergeMap(list => {
                return this.db.getItem(itemId)
                    .mergeMap(data => {
                        return this.getCraftedBy(data.item)
                            .map(crafted => {
                                const craft = this.getCraft(data.item, recipeId)[0];
                                const toAdd: ListRow = {
                                    id: data.item.id,
                                    name: this.getI18nName(data.item),
                                    icon: this.getIcon(data.item),
                                    amount: amount,
                                    done: 0,
                                    recipeId: recipeId,
                                    yield: craft.yield || 1,
                                    requires: craft.ingredients,
                                    craftedBy: crafted,
                                    addedAt: Date.now()
                                };
                                this.add(list.recipes, toAdd);
                                return this.addCraft([{item: data.item, data: data, amount: Math.ceil(amount / toAdd.yield)}], list);
                            })
                            .mergeMap(l => {
                                const precrafts = [];
                                l.preCrafts.forEach(craft => {
                                    if (craft.craftedBy === undefined) {
                                        precrafts.push(this.getCraftedBy(this.getRelated(data, craft.id)));
                                    }
                                });
                                if (precrafts.length > 0) {
                                    return Observable.combineLatest(...precrafts, (...details: any[]) => {
                                        const crafts = [].concat.apply([], details);
                                        l.preCrafts.forEach(craft => {
                                            if (craft.craftedBy === undefined) {
                                                craft.craftedBy = crafts.filter(c => c.itemId === craft.id);
                                            }
                                        });
                                        return l;
                                    });
                                }
                                return Observable.of(l);
                            })
                            .mergeMap(l => {
                                const trades: Observable<{ item: any, tradeSources: TradeSource[] }>[] = [];
                                this.forEachItem(list, item => {
                                    const related = this.getRelated(data, item.id);
                                    if (related !== undefined && related.tradeSources !== undefined) {
                                        trades.push(this.getTradeSources(related).map(ts => {
                                            return {item: item, tradeSources: ts};
                                        }));
                                    }
                                });
                                if (trades.length > 0) {
                                    return Observable.combineLatest(...trades, (...ptrades) => {
                                        ptrades.forEach(ptrade => {
                                            ptrade.item.tradeSources = ptrade.tradeSources;
                                        });
                                        return l;
                                    });
                                } else {
                                    return Observable.of(l);
                                }
                            })
                            .mergeMap(l => {
                                const vendors: Observable<{ item: any, vendors: Vendor[] }>[] = [];
                                this.forEachItem(list, item => {
                                    const related = this.getRelated(data, item.id);
                                    if (related !== undefined && related.vendors !== undefined) {
                                        vendors.push(this.getVendors(related).map(ts => {
                                            return {item: item, vendors: ts};
                                        }));
                                    }
                                });
                                if (vendors.length > 0) {
                                    return Observable.combineLatest(...vendors, (...pvendors) => {
                                        pvendors.forEach(v => {
                                            v.item.vendors = v.vendors;
                                        });
                                        return l;
                                    });
                                } else {
                                    return Observable.of(l);
                                }
                            })
                            .mergeMap(l => {
                                const reductions: Observable<{ item: any, reducedFrom: I18nName[] }>[] = [];
                                this.forEachItem(list, i => {
                                    const related = this.getRelated(data, i.id);
                                    if (related !== undefined && related.reducedFrom !== undefined) {
                                        reductions.push(this.getReducedFrom(related).map(rs => {
                                            return {item: i, reducedFrom: rs};
                                        }));
                                    }
                                });
                                if (reductions.length > 0) {
                                    return Observable.combineLatest(...reductions, (...results) => {
                                        results.forEach(res => {
                                            res.item.reducedFrom = res.reducedFrom;
                                        });
                                        return l;
                                    });
                                } else {
                                    return Observable.of(l);
                                }
                            })
                            .mergeMap(l => {
                                const desynths: Observable<{ item: any, desynths: I18nName[] }>[] = [];
                                this.forEachItem(list, i => {
                                    const related = this.getRelated(data, i.id);
                                    if (related !== undefined && related.desynthedFrom !== undefined) {
                                        desynths.push(this.getDesynths(related).map(rs => {
                                            return {item: i, desynths: rs};
                                        }));
                                    }
                                });
                                if (desynths.length > 0) {
                                    return Observable.combineLatest(...desynths, (...results) => {
                                        results.forEach(res => {
                                            res.item.desynths = res.desynths;
                                        });
                                        return l;
                                    });
                                } else {
                                    return Observable.of(l);
                                }
                            })
                            .map(l => {
                                this.forEachItem(l, o => {
                                    const related = this.getRelated(data, o.id);
                                    if (related !== undefined && related.instances !== undefined) {
                                        const instances: Instance[] = [];
                                        related.instances.forEach(id => {
                                            const instance = this.gt.getInstance(id);
                                            instances.push(instance);
                                        });
                                        o.instances = instances;
                                    }
                                });
                                return l;
                            })
                            .map(l => {
                                l.gathers.forEach(g => {
                                    if (g.gatheredBy === undefined) {
                                        g.gatheredBy = this.getGatheredBy(this.getRelated(data, g.id));
                                    }
                                });
                                return l;
                            })
                            .map(l => {
                                this.forEachItem(l, o => {
                                    const related = this.getRelated(data, o.id);
                                    if (related !== undefined && related.seed !== undefined) {
                                        o.gardening = true;
                                    }
                                });
                                return l;
                            })
                            .map(l => {
                                this.forEachItem(l, o => {
                                    const related = this.getRelated(data, o.id);
                                    if (related !== undefined && related.drops !== undefined) {
                                        related.drops.forEach(d => {
                                            if (o.drops === undefined) {
                                                o.drops = [];
                                            }
                                            o.drops.push(this.gt.getDrop(d));
                                        });
                                    }
                                });
                                return l;
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
                        done: 0,
                        yield: 1,
                        addedAt: Date.now()
                    });
                } else {
                    const elementDetails = this.getRelated(addition.data, element.id);
                    if (elementDetails.craft !== undefined) {
                        const yields = elementDetails.craft[0].yield || 1;
                        const amount = Math.ceil(element.amount * addition.amount / yields);
                        this.add(list.preCrafts, {
                            id: elementDetails.id,
                            icon: this.getIcon(elementDetails),
                            amount: amount,
                            requires: elementDetails.craft[0].ingredients,
                            done: 0,
                            name: this.getI18nName(elementDetails),
                            yield: yields,
                            addedAt: Date.now()
                        });
                        nextIteration.push({
                            item: elementDetails,
                            data: addition.data,
                            amount: amount
                        });
                    } else if (elementDetails.nodes !== undefined || elementDetails.fishingSpots !== undefined) {
                        this.add(list.gathers, {
                            id: elementDetails.id,
                            icon: this.getIcon(elementDetails),
                            amount: element.amount * addition.amount,
                            done: 0,
                            name: this.getI18nName(elementDetails),
                            yield: 1,
                            addedAt: Date.now()
                        });
                    } else {
                        this.add(list.others, {
                            id: elementDetails.id,
                            icon: this.getIcon(elementDetails),
                            amount: element.amount * addition.amount,
                            done: 0,
                            name: this.getI18nName(elementDetails),
                            yield: 1,
                            addedAt: Date.now()
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

    public setDone(pitem: ListRow, amount: number, list: List): void {
        const item = this.getById(pitem.id, list, pitem.addedAt);
        item.done += amount;
        if (item.done > item.amount) {
            item.done = item.amount;
        }
        if (item.requires !== undefined) {
            for (const requirement of item.requires) {
                const requirementItem = this.getById(requirement.id, list);
                this.setDone(requirementItem, requirement.amount * amount, list);
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

    protected getById(id: number, list: List, addedAt?: number): ListRow {
        for (const prop of Object.keys(list)) {
            if (prop !== 'name') {
                for (const row of list[prop]) {
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

    protected cleanList(list: List): List {
        for (const prop of Object.keys(list)) {
            if (['recipes', 'preCrafts', 'gathers', 'others', 'crystals'].indexOf(prop) > -1) {
                list[prop] = list[prop].filter(row => {
                    return row.amount > 0;
                });
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
