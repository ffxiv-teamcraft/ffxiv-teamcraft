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
        return this.nodes.filter(node => {
            const match = node.items.find(item => item.id === id);
            if (match !== undefined) {
                node.icon = match.icon;
                node.itemId = id;
                node.slot = +match.slot;
                node.zoneid = this.localizedDataService.getAreaIdByENName(node.zone);
                node.areaid = this.localizedDataService.getAreaIdByENName(node.title);
                return true;
            }
            return false;
        });
    }

    getNode(id: number): any {
        return this.nodes.find(node => node.id === id);
    }
}
