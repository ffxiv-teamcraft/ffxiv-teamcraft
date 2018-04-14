import {AbstractExtractor} from './abstract-extractor';
import {CraftedBy} from '../../../../model/list/crafted-by';
import {ItemData} from '../../../../model/garland-tools/item-data';
import {DataType} from '../data-type';
import {GarlandToolsService} from '../../../api/garland-tools.service';
import {HtmlToolsService} from '../../../tools/html-tools.service';
import {Item} from '../../../../model/garland-tools/item';

export class CraftedByExtractor extends AbstractExtractor<CraftedBy[]> {

    constructor(private gt: GarlandToolsService, private htmlTools: HtmlToolsService) {
        super();
    }

    protected canExtract(item: Item): boolean {
        return item.isCraft();
    }

    protected doExtract(item: Item, itemData: ItemData): CraftedBy[] {
        const result = [];
        for (const craft of item.craft) {
            const craftedBy: CraftedBy = {
                itemId: item.id,
                icon: `https://secure.xivdb.com/img/classes/set2/${this.gt.getJob(craft.job).name.toLowerCase()}.png`,
                level: craft.lvl,
                stars_tooltip: this.htmlTools.generateStars(craft.stars),
                recipeId: craft.id
            };
            if (craft.job === 0) {
                craftedBy.icon = '';
            }
            if (craft.unlockId !== undefined) {
                const masterbookPartial = itemData.getPartial(craft.unlockId.toString(), 'item');
                if (masterbookPartial !== undefined) {
                    craftedBy.masterbook = {
                        icon: masterbookPartial.obj.c,
                        id: craft.unlockId
                    };
                }
            }
            result.push(craftedBy);
        }
        return result;
    }

    public isAsync(): boolean {
        return false;
    }

    public getDataType(): DataType {
        return DataType.CRAFTED_BY;
    }

}
