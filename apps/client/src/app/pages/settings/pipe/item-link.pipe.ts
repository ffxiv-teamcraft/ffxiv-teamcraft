import { Pipe, PipeTransform } from '@angular/core';
import { I18nName } from '../../../model/list/i18n-name';
import { SettingsService } from '../settings.service';
import { LocalizedDataService } from '../../../core/data/localized-data.service';
import { LinkBase } from '../link-base/link-base.enum';

@Pipe({
  name: 'itemLink',
  pure: true
})
export class ItemLinkPipe implements PipeTransform {


  constructor(private settings: SettingsService, private localizedData: LocalizedDataService) {
  }

  transform(id: number): I18nName {
    return LinkBase.byName(this.settings.baseLink).getItemLink(this.localizedData.getItem(id), id);
  }

}
