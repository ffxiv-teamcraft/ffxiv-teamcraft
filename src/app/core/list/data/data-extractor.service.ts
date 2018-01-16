import {Inject, Injectable, InjectionToken} from '@angular/core';
import {AbstractExtractor} from './extractor/abstract-extractor';
import {ItemData} from '../../../model/garland-tools/item-data';
import {DataType} from './data-type';
import {CraftedBy} from '../../../model/list/crafted-by';
import {TradeSource} from '../../../model/list/trade-source';
import {Vendor} from '../../../model/list/vendor';
import {Instance} from '../../../model/list/instance';
import {GatheredBy} from '../../../model/list/gathered-by';
import {I18nName} from '../../../model/list/i18n-name';
import {Drop} from '../../../model/list/drop';

export const EXTRACTORS = new InjectionToken('EXTRACTORS');

@Injectable()
export class DataExtractorService {

    constructor(@Inject(EXTRACTORS) private extractors: AbstractExtractor<any>[]) {
    }


    /**
     * Extracts informations about where to drop a given item.
     * @param {number} id
     * @param {ItemData} data
     * @returns {Drop[]}
     */
    extractDrops(id: number, data: ItemData): Drop[] {
        return this.extract<Drop[]>(DataType.DROPS, id, data);
    }

    /**
     * Extracts gathering informations for a given item.
     * @param {number} id
     * @param {ItemData} data
     * @returns {GatheredBy}
     */
    extractVoyages(id: number, data: ItemData): I18nName[] {
        return this.extract<I18nName[]>(DataType.VOYAGES, id, data);
    }

    /**
     * Extracts gathering informations for a given item.
     * @param {number} id
     * @param {ItemData} data
     * @returns {GatheredBy}
     */
    extractGardening(id: number, data: ItemData): boolean {
        return this.extract<boolean>(DataType.GARDENING, id, data);
    }

    /**
     * Extracts gathering informations for a given item.
     * @param {number} id
     * @param {ItemData} data
     * @returns {GatheredBy}
     */
    extractGatheredBy(id: number, data: ItemData): GatheredBy {
        return this.extract<GatheredBy>(DataType.GATHERED_BY, id, data);
    }

    /**
     * Extracts the instances where you can obtain a given item.
     * @param {number} id
     * @param {ItemData} data
     * @returns {Instance[]}
     */
    extractInstances(id: number, data: ItemData): Instance[] {
        return this.extract<Instance[]>(DataType.INSTANCES, id, data);
    }

    /**
     * Extracts the id of the items you can desynth to obtain the given item.
     * @param {number} id
     * @param {ItemData} data
     */
    extractDesynths(id: number, data: ItemData): number[] {
        return this.extract<number[]>(DataType.DESYNTHS, id, data);
    }

    /**
     * Extracts the ids of the items you can reduce to obtain the given item.
     * @param {number} id
     * @param {ItemData} data
     * @returns {number[]}
     */
    extractReducedFrom(id: number, data: ItemData): number[] {
        return this.extract<number[]>(DataType.REDUCED_FROM, id, data);
    }

    /**
     * Extracts informations about the vendors of an item (trades for gil).
     * @param {number} id
     * @param {ItemData} data
     * @returns {CraftedBy}
     */
    extractVendors(id: number, data: ItemData): Vendor[] {
        return this.extract<Vendor[]>(DataType.VENDORS, id, data);
    }

    /**
     * Extracts informations about the trade sources of a given item.
     * @param {number} id
     * @param {ItemData} data
     * @returns {CraftedBy}
     */
    extractTradeSources(id: number, data: ItemData): TradeSource[] {
        return this.extract<TradeSource[]>(DataType.TRADE_SOURCES, id, data);
    }

    /**
     * Extracts informations about which job crafts a given item.
     * @param {number} id
     * @param {ItemData} data
     * @returns {CraftedBy}
     */
    extractCraftedBy(id: number, data: ItemData): CraftedBy[] {
        return this.extract<CraftedBy[]>(DataType.CRAFTED_BY, id, data);
    }

    /**
     * Extracts data using the proper extractor.
     * @param {DataType} type
     * @param {number} id
     * @param {ItemData} data
     * @returns {T}
     */
    private extract<T>(type: DataType, id: number, data: ItemData): T {
        return this.extractors.find(ex => ex.getDataType() === type).extract(id, data);
    }
}
