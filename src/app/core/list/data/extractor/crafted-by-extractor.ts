import {AbstractExtractor} from './abstract-extractor';
import {CraftedBy} from '../../../../model/list/crafted-by';
import {ItemData} from '../../../../model/garland-tools/item-data';
import {DataType} from '../data-type';
import {Observable} from 'rxjs/Observable';
import {GarlandToolsService} from '../../../api/garland-tools.service';
import {HtmlToolsService} from '../../../tools/html-tools.service';
import {DataService} from '../../../api/data.service';
import {Item} from '../../../../model/garland-tools/item';

export class CraftedByExtractor extends AbstractExtractor<CraftedBy[]> {

    constructor(private gt: GarlandToolsService, private htmlTools: HtmlToolsService, private db: DataService) {
        super();
    }

    protected canExtract(item: Item): boolean {
        return item.isCraft();
    }

    protected doExtract(item: Item, itemData: ItemData): Observable<CraftedBy[]> {
        const result = [];
        for (const craft of item.craft) {
            const craftedBy: CraftedBy = {
                itemId: item.id,
                icon: `https://secure.xivdb.com/img/classes/set2/${this.gt.getJob(craft.job).name.toLowerCase()}.png`,
                level: craft.lvl,
                stars_tooltip: this.htmlTools.generateStars(craft.stars)
            };
            if (craft.job === 0) {
                craftedBy.icon = '';
            }
            if (craft.unlockId !== undefined) {
                result.push(this.db.getItem(craft.unlockId).map(masterbook => {
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

    public isAsync(): boolean {
        return true;
    }

    public getDataType(): DataType {
        return DataType.CRAFTED_BY;
    }

}
