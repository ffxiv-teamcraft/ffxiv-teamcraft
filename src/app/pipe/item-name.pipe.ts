import {Pipe, PipeTransform} from '@angular/core';
import {LocalizedDataService} from '../core/data/localized-data.service';
import {I18nName} from '../model/list/i18n-name';

@Pipe({
    name: 'itemName',
    pure: false
})
export class ItemNamePipe implements PipeTransform {

    constructor(private data: LocalizedDataService) {
    }

    transform(id: number): I18nName {
        return this.data.getItem(id);
    }

}
