import {AbstractExtractor} from './abstract-extractor';
import {GatheredBy} from '../../../../model/list/gathered-by';
import {ItemData} from '../../../../model/garland-tools/item-data';
import {DataType} from '../data-type';
import {LocalizedDataService} from '../../../data/localized-data.service';
import {HtmlToolsService} from '../../../tools/html-tools.service';
import {GarlandToolsService} from '../../../api/garland-tools.service';
import {StoredNode} from 'app/model/list/stored-node';
import {Item} from '../../../../model/garland-tools/item';
import * as nodePositions from '../../../data/sources/node-positions.json';

export class GatheredByExtractor extends AbstractExtractor<GatheredBy> {

    constructor(private gt: GarlandToolsService, private htmlTools: HtmlToolsService, private localized: LocalizedDataService) {
        super();
    }

    protected canExtract(item: Item): boolean {
        return item.hasNodes() || (item.fishingSpots !== undefined && item.fishingSpots.length > 0);
    }

    protected doExtract(item: Item, itemData: ItemData): GatheredBy {
        const gatheredBy: GatheredBy = {
            icon: '',
            stars_tooltip: '',
            level: 0,
            nodes: [],
            type: -1,
        };
        // If it's a node gather (not a fish)
        if (item.hasNodes()) {
            for (const node of item.nodes) {
                const partial = itemData.getPartial(node.toString(), 'node').obj;
                let details;
                if (partial.lt !== undefined) {
                    details = this.gt.getBellNode(node);
                }
                gatheredBy.type = partial.t;
                gatheredBy.icon = [
                    './assets/icons/Mineral_Deposit.png',
                    './assets/icons/MIN.png',
                    './assets/icons/Mature_Tree.png',
                    './assets/icons/BTN.png',
                    'https://garlandtools.org/db/images/FSH.png'
                ][partial.t];
                gatheredBy.stars_tooltip = this.htmlTools.generateStars(partial.s);
                gatheredBy.level = +partial.l;
                if (partial.n !== undefined) {
                    const storedNode: StoredNode = {
                        zoneid: partial.z,
                        areaid: this.localized.getAreaIdByENName(partial.n),
                    };
                    if (details !== undefined) {
                        const detailsItem = details.items.find(i => i.id === item.id);
                        storedNode.slot = detailsItem !== undefined ? detailsItem.slot : '?';
                        storedNode.time = details.time;
                        storedNode.uptime = details.uptime;
                        storedNode.limitType = {en: partial.lt, de: partial.lt, fr: partial.lt, ja: partial.lt};
                        storedNode.coords = details.coords;
                    }
                    // If we don't have position for this node in data provided by garlandtools,w e might have it inside our data.
                    if (storedNode.coords === undefined && nodePositions[node] !== undefined) {
                        storedNode.coords = [nodePositions[node].x, nodePositions[node].y];
                    }
                    // We need to cleanup the node object to avoid database issues with undefined value.
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
            for (const spot of item.fishingSpots) {
                const details = this.gt.getFishingSpot(spot);
                gatheredBy.icon = 'https://garlandtools.org/db/images/FSH.png';
                if (details.areaid !== undefined) {
                    gatheredBy.nodes.push(details);
                }
                gatheredBy.level = (gatheredBy.level === 0 || gatheredBy.level > details.lvl) ? details.lvl : gatheredBy.level;
            }
        }
        return gatheredBy;
    }

    isAsync(): boolean {
        return false;
    }

    getDataType(): DataType {
        return DataType.GATHERED_BY;
    }

    protected extractsArray(): boolean {
        return false;
    }

}
