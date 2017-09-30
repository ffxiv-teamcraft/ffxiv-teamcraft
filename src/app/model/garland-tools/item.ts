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
import {I18nToolsService} from '../../core/i18n-tools.service';
import {Trade} from '../list/trade';

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

    public get icon(): string {
        return `https://www.garlandtools.org/db/icons/item/${this._icon}.png`;
    }


    public getCraftedBy(htmlTools: HtmlToolsService, db: DataService, gt: GarlandToolsService,
                        i18n: I18nToolsService): Observable<CraftedBy[]> {
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
                        name: i18n.createI18nName(masterbook.item),
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

    public getTradeSources(db: DataService, gt: GarlandToolsService, i18n: I18nToolsService): Observable<TradeSource[]> {
        const tradeSources: Observable<TradeSource> [] = [];
        for (const ts of Object.keys(this.tradeSources)) {
            const tradeObs = Observable
                .of({
                    npcName: {fr: '', de: '', en: '', ja: ''},
                    zoneName: {fr: '', de: '', en: '', ja: ''}
                })
                .mergeMap((tradeSource: TradeSource) => {
                    return db.getNpc(+ts)
                        .map(data => {
                            tradeSource.npcName = i18n.createI18nName(data.npc);
                            if (data.npc.zoneid === undefined) {
                                return undefined;
                            }
                            tradeSource.zoneName = gt.getLocation(data.npc.zoneid).name;
                            return tradeSource as TradeSource;
                        });
                })
                .mergeMap((tradeSource: TradeSource) => {
                    const trades: Observable<Trade>[] = [];
                    for (const row of this.tradeSources[ts]) {
                        const obs: Observable<Trade> = Observable
                            .of({
                                itemIcon: '',
                                itemAmount: 0,
                                currencyIcon: '',
                                currencyAmount: 0,
                                itemHQ: false
                            })
                            .mergeMap(trade => {
                                return db.getItem(+row.item[0].id)
                                    .map(data => {
                                        trade.itemIcon = data.item.icon;
                                        trade.itemAmount = row.item[0].amount;
                                        trade.itemHQ = row.item[0].hq === 1;
                                        return trade;
                                    });
                            })
                            .mergeMap(trade => {
                                return db.getItem(+row.currency[0].id)
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

    public getVendors(db: DataService, gt: GarlandToolsService, i18n: I18nToolsService): Observable<Vendor[]> {
        const vendors: Observable<Vendor> [] = [];
        for (const id of this.vendors) {
            const vendorObs: Observable<Vendor> = Observable
                .of({
                    npcName: {fr: '', de: '', en: '', ja: ''},
                    zoneName: {fr: '', de: '', en: '', ja: ''}
                }).mergeMap((vendor: Vendor) => {
                    return db.getNpc(+id)
                        .map(data => {
                            vendor.npcName = i18n.createI18nName(data.npc);
                            if (data.npc.zoneid === undefined) {
                                return undefined;
                            }
                            vendor.zoneName = gt.getLocation(data.npc.zoneid).name;
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

    public getReducedFrom(db: DataService, i18n: I18nToolsService): Observable<I18nName[]> {
        const reductions: Observable<I18nName> [] = [];
        for (const id of this.reducedFrom) {
            const reductionObs = Observable
                .of({fr: '', de: '', en: '', ja: ''})
                .mergeMap((name: I18nName) => {
                    return db.getItem(id).map(data => {
                        name = i18n.createI18nName(data.item);
                        return name;
                    });
                });
            reductions.push(reductionObs);
        }
        return Observable.combineLatest(reductions);
    }

    public getDesynths(db: DataService, i18n: I18nToolsService): Observable<I18nName[]> {
        const desynths: Observable<I18nName> [] = [];
        for (const id of this.desynthedFrom) {
            const desynthObs = Observable
                .of({fr: '', de: '', en: '', ja: ''})
                .mergeMap((name: I18nName) => {
                    return db.getItem(id).map(data => {
                        name = i18n.createI18nName(data.item);
                        return name;
                    });
                });
            desynths.push(desynthObs);
        }
        return Observable.combineLatest(desynths);
    }

    public getGatheredBy(gt: GarlandToolsService, htmlTools: HtmlToolsService): GatheredBy {
        const gatheredBy: GatheredBy = {
            icon: '',
            stars_tooltip: '',
            level: 0,
            nodes: [],
            type: -1
        };
        // If it's a node gather (not a fish)
        if (this.hasNodes()) {
            for (const node of this.nodes) {
                const details = gt.getNode(node);
                gatheredBy.type = details.type;
                gatheredBy.icon = [
                    '/assets/icons/Mineral_Deposit.png',
                    '/assets/icons/MIN.png',
                    '/assets/icons/Mature_Tree.png',
                    '/assets/icons/BTN.png',
                    'https://garlandtools.org/db/images/FSH.png'
                ][details.type];
                gatheredBy.stars_tooltip = htmlTools.generateStars(details.stars);
                gatheredBy.level = details.lvl;
                if (details.areaid !== undefined) {
                    gatheredBy.nodes.push(details);
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
