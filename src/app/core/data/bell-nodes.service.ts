import {Injectable} from '@angular/core';
import {LocalizedDataService} from './localized-data.service';
import {TranslateService} from '@ngx-translate/core';
import {Language} from './language';
import {reductions} from './sources/reductions';

@Injectable()
export class BellNodesService {

    /**
     * Reference to global garlandtools data.
     */
    private nodes: any[] = (<any>window).gt.bell.nodes;

    private cache: { [index: number]: any[] } = {};

    constructor(private localizedDataService: LocalizedDataService, private i18n: TranslateService) {
    }

    getNodesByItemName(name: string): any[] {
        let itemIds = this.localizedDataService.getItemIdsByName(name, <Language>this.i18n.currentLang);
        for (const id of itemIds) {
            if (reductions[id] !== undefined) {
                itemIds = itemIds.splice(itemIds.indexOf(id), 1);
                itemIds.push(...reductions[id]);
            }
        }
        return [].concat.apply([], itemIds.map(id => this.getNodesByItemId(id)));
    }

    getNodesByItemId(id: number): any[] {
        if (this.cache[id] === undefined) {
            const results = [];
            this.nodes.forEach(node => {
                const match = node.items.find(item => item.id === id);
                if (match !== undefined) {
                    const nodeCopy = JSON.parse(JSON.stringify(node));
                    nodeCopy.icon = match.icon;
                    nodeCopy.itemId = id;
                    nodeCopy.slot = +match.slot;
                    nodeCopy.zoneid = this.localizedDataService.getAreaIdByENName(node.zone);
                    nodeCopy.areaid = this.localizedDataService.getAreaIdByENName(node.title);
                    results.push(nodeCopy);
                }
            });
            this.cache[id] = results;
        }
        return this.cache[id];
    }

    getNode(id: number): any {
        const node = this.nodes.find(n => n.id === id);
        if (node !== undefined) {
            node.itemId = id;
            node.zoneid = this.localizedDataService.getAreaIdByENName(node.zone);
            node.areaid = this.localizedDataService.getAreaIdByENName(node.title);
        }
        return node;
    }
}
