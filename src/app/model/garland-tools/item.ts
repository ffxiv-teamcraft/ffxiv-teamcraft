import {Craft} from './craft';
import {I18nData} from '../list/i18n-data';
import {TradeData} from './trade-data';
import {I18nDataRow} from '../list/i18n-data-row';
import {DeserializeFieldName} from '@kaiu/serializer';
import {GatheredBy} from '../list/gathered-by';
import {GarlandToolsService} from '../../core/api/garland-tools.service';
import {HtmlToolsService} from '../../core/html-tools.service';
import {Observable} from 'rxjs/Observable';
import {CraftedBy} from '../list/crafted-by';
import {TradeSource} from '../list/trade-source';
import {Vendor} from '../list/vendor';
import {I18nName} from '../list/i18n-name';
import {DataService} from '../../core/api/data.service';
import {Trade} from '../list/trade';
import {Fish} from './fish';
import {ItemData} from './item-data';
import {StoredNode} from '../list/stored-node';
import {LocalizedDataService} from '../../core/data/localized-data.service';

export class Item implements I18nData {

    fr: I18nDataRow;
    en: I18nDataRow;
    de: I18nDataRow;
    ja: I18nDataRow;

    id: number;
    patch: number;
    patchCategory: number;
    ilvl: number;
    category: number;
    rarity: number;

    @DeserializeFieldName('icon')
    _icon: number;
    strengths: string[];
    attr: Attr;

    tradeable?: number;
    craft?: Craft[];
    vendors?: number[];
    tradeSources?: { [index: number]: TradeData };
    drops?: number[];
    nodes?: number[];
    ventures?: number[];
    voyages?: string[];
    instances?: number[];
    reducedFrom?: number[];
    desynthedFrom?: number[];
    fishingSpots?: number[];
    fish?: Fish;
    seeds?: number[];

    public hasNodes(): boolean {
        return this.nodes !== undefined;
    }

    public hasFishingSpots(): boolean {
        return this.fishingSpots !== undefined;
    }

    public isCraft(): boolean {
        return this.craft !== undefined;
    }

    public get icon(): number {
        return this._icon;
    }


    public getCraftedBy(htmlTools: HtmlToolsService, db: DataService, gt: GarlandToolsService): Observable<CraftedBy[]> {
        if (!this.isCraft()) {
            return Observable.of([]);
        }
        const result = [];
        for (const craft of this.craft) {
            const craftedBy: CraftedBy = {
                itemId: this.id,
                icon: `https://secure.xivdb.com/img/classes/set2/${gt.getJob(craft.job).name.toLowerCase()}.png`,
                level: craft.lvl,
                stars_tooltip: htmlTools.generateStars(craft.stars)
            };
            if (craft.job === 0) {
                craftedBy.icon = '';
            }
            if (craft.unlockId !== undefined) {
                result.push(db.getItem(craft.unlockId).map(masterbook => {
                    craftedBy.masterbook = {
                        icon: masterbook.item.icon,
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

    public getTradeSources(db: DataService): Observable<TradeSource[]> {
        const tradeSources: Observable<TradeSource> [] = [];
        for (const ts of Object.keys(this.tradeSources)) {
            const tradeObs = Observable
                .of({
                    npcId: +ts,
                    zoneId: 0
                })
                .switchMap((tradeSource: TradeSource) => {
                    return db.getNpc(+ts)
                        .map(data => {
                            if (data.npc.zoneid === undefined) {
                                return undefined;
                            }
                            tradeSource.zoneId = data.npc.zoneid;
                            return tradeSource as TradeSource;
                        });
                })
                .switchMap((tradeSource: TradeSource) => {
                    const trades: Observable<Trade>[] = [];
                    for (const row of this.tradeSources[ts]) {
                        const obs: Observable<Trade> = Observable
                            .of({
                                itemIcon: 0,
                                itemAmount: 0,
                                itemId: 0,
                                currencyIcon: 0,
                                currencyAmount: 0,
                                currencyId: 0,
                                itemHQ: false
                            })
                            .switchMap(trade => {
                                return db.getItem(+row.item[0].id)
                                    .map(data => {
                                        trade.itemIcon = data.item.icon;
                                        trade.itemAmount = row.item[0].amount;
                                        trade.itemId = data.item.id;
                                        trade.itemHQ = row.item[0].hq === 1;
                                        return trade;
                                    });
                            })
                            .switchMap(trade => {
                                return db.getItem(+row.currency[0].id)
                                    .map(data => {
                                        trade.currencyIcon = data.item.icon;
                                        trade.currencyAmount = row.currency[0].amount;
                                        trade.currencyId = data.item.id;
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

    public getVoyages(): I18nName[] {
        const voyages: I18nName[] = [];
        if (this.voyages !== undefined) {
            this.voyages.forEach(v => {
                voyages.push({
                    en: v,
                    fr: v,
                    de: v,
                    ja: v
                });
            });
        }
        return voyages;
    }

    public getVendors(db: DataService): Observable<Vendor[]> {
        const vendors: Observable<Vendor> [] = [];
        for (const id of this.vendors) {
            const vendorObs: Observable<Vendor> = Observable
                .of({
                    npcId: 0,
                    zoneId: 0
                }).switchMap((vendor: Vendor) => {
                    return db.getNpc(+id)
                        .map(data => {
                            vendor.npcId = +id;
                            if (data.npc.zoneid === undefined) {
                                return undefined;
                            }
                            vendor.zoneId = data.npc.zoneid;
                            const tradeInfo = data.partials.find(o => o.obj.i === this.id);
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
        return Observable.combineLatest(...vendors, (...vs) => {
            return vs.filter(v => v !== undefined);
        });
    }

    public getReducedFrom(): number[] {
        return this.reducedFrom;
    }

    public getDesynths(): number[] {
        return this.desynthedFrom;
    }

    public getGatheredBy(gt: GarlandToolsService, htmlTools: HtmlToolsService, data: ItemData,
                         localized: LocalizedDataService): GatheredBy {
        const gatheredBy: GatheredBy = {
            icon: '',
            stars_tooltip: '',
            level: 0,
            nodes: [],
            type: -1,
        };
        // If it's a node gather (not a fish)
        if (this.hasNodes()) {
            for (const node of this.nodes) {
                const partial = data.getPartial(node.toString(), 'node').obj;
                let details;
                if (partial.lt !== undefined) {
                    details = gt.getBellNode(node);
                }
                gatheredBy.type = partial.t;
                gatheredBy.icon = [
                    '/assets/icons/Mineral_Deposit.png',
                    '/assets/icons/MIN.png',
                    '/assets/icons/Mature_Tree.png',
                    '/assets/icons/BTN.png',
                    'https://garlandtools.org/db/images/FSH.png'
                ][partial.t];
                gatheredBy.stars_tooltip = htmlTools.generateStars(partial.s);
                gatheredBy.level = +partial.l;
                if (partial.n !== undefined) {
                    const storedNode: StoredNode = {
                        zoneid: partial.z,
                        areaid: localized.getAreaIdByENName(partial.n),
                    };
                    if (details !== undefined) {
                        storedNode.slot = details.items.find(item => item.id === this.id).slot;
                        storedNode.time = details.time;
                        storedNode.uptime = details.uptime;
                        storedNode.limitType = {en: partial.lt, de: partial.lt, fr: partial.lt, ja: partial.lt};
                        storedNode.coords = details.coords;
                    }
                    // We need to cleanup the node object to avoid firebase issues with undefined value.
                    Object.keys(storedNode).forEach(key => {
                        if (storedNode[key] === undefined) {
                            delete storedNode[key];
                        }
                    });
                    gatheredBy.nodes.push(storedNode);
                }
            }
        } else {
            // If it's a fish, we have to handle it in another way
            for (const spot of this.fishingSpots) {
                const details = gt.getFishingSpot(spot);
                gatheredBy.icon = 'https://garlandtools.org/db/images/FSH.png';
                if (details.areaid !== undefined) {
                    gatheredBy.nodes.push(details);
                }
                gatheredBy.level = details.lvl;
            }
        }
        return gatheredBy;
    }
}
