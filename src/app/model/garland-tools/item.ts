import {Craft} from './craft';
import {I18nData} from '../list/i18n-data';
import {TradeData} from './trade-data';
import {I18nDataRow} from '../list/i18n-data-row';
import {DeserializeFieldName} from '@kaiu/serializer';
import {GatheredBy} from '../list/gathered-by';
import {GarlandToolsService} from '../../core/api/garland-tools.service';
import {HtmlToolsService} from '../../core/html-tools.service';

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

    public getGatheredBy(gt: GarlandToolsService, htmlTools: HtmlToolsService): GatheredBy {
        const gatheredBy: GatheredBy = {
            icon: '',
            stars_tooltip: '',
            level: 0,
            nodes: []
        };
        // If it's a node gather (not a fish)
        if (this.hasNodes()) {
            for (const node of this.nodes) {
                const details = gt.getNode(node);
                if (details.type <= 1) {
                    gatheredBy.icon = 'https://garlandtools.org/db/images/MIN.png';
                } else if (details.type < 4) {
                    gatheredBy.icon = 'https://garlandtools.org/db/images/BTN.png';
                } else {
                    gatheredBy.icon = 'https://garlandtools.org/db/images/FSH.png';
                }
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
