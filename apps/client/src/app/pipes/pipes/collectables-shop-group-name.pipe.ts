import { Pipe, PipeTransform } from '@angular/core';
import { LocalizedDataService } from '../../core/data/localized-data.service';
import { I18nName } from '../../model/common/i18n-name';
import { LazyDataService } from '../../core/data/lazy-data.service';

@Pipe({
  name: 'collectablesShopGroupName'
})
export class CollectablesShopGroupNamePipe implements PipeTransform {

  constructor(private l12n: LocalizedDataService, private lazyData: LazyDataService) {
  }

  transform(id: number, fallback?: string): I18nName {
    return this.lazyData.data.collectablesShopItemGroup[id] || fallback;
  }

}
