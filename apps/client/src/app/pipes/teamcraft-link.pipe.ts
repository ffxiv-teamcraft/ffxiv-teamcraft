import { Pipe, PipeTransform } from '@angular/core';
import { LocalizedDataService } from '../core/data/localized-data.service';
import { I18nName } from '../model/common/i18n-name';
import { LinkToolsService } from '../core/tools/link-tools.service';

@Pipe({
  name: 'tcLink'
})
export class TeamcraftLinkPipe implements PipeTransform {

  constructor(private linkTools: LinkToolsService) {
  }

  transform(path: string): string {
    return this.linkTools.getLink(path);
  }

}
