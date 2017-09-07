import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {CraftedBy} from '../model/crafted-by';
import {HtmlToolsService} from './html-tools.service';
import {GarlandToolsService} from './api/garland-tools.service';
import {DataService} from './api/data.service';
import {I18nToolsService} from './i18n-tools.service';
import {ListRow} from '../model/list-row';

@Injectable()
export class ListBuilderService {

    constructor(private htmlTools: HtmlToolsService,
                private gt: GarlandToolsService,
                private db: DataService,
                private i18n: I18nToolsService) {
    }


    public addCraftedBy(item: any): Observable<CraftedBy[]> {
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
                        name: this.i18n.createI18nName(masterbook.item),
                        id: masterbook.item.id
                    };
                    return craftedBy;
                }));
            } else {
                result.push(Observable.of(craftedBy));
            }
        }
        return Observable.combineLatest(result)
            .map(crafted => {
            const craft = this.getCraft(item, recipeId);
            const toAdd: ListRow = {
                id: data.item.id,
                name: this.i18n.createI18nName(data.item),
                icon: this.getIcon(data.item),
                amount: amount,
                done: 0,
                yield: craft.yield || 1,
                recipeId: recipeId,
                requires: craft.ingredients,
                craftedBy: crafted,
                addedAt: Date.now()
            };
            this.add(list.recipes, toAdd);;
    }
}
