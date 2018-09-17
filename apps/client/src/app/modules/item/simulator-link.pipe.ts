import { Pipe, PipeTransform } from '@angular/core';
import { SettingsService } from '../../pages/settings/settings.service';
import { LocalizedDataService } from '../../core/data/localized-data.service';
import { Recipe } from '../../model/search/recipe';
import { I18nName } from '../../model/common/i18n-name';

@Pipe({
  name: 'simulatorLink',
  pure: true
})
export class SimulatorLinkPipe implements PipeTransform {

  constructor(private settings: SettingsService, private localizedData: LocalizedDataService) {
  }

  transform(craft: Recipe, baseLink: string): I18nName {
    return {
      en: `${baseLink}#/recipe?lang=en&class=${
        this.getJobName(craft)}&name=${this.localizedData.getItem(craft.itemId).en}`,
      fr: `${baseLink}#/recipe?lang=fr&class=${
        this.getJobName(craft)}&name=${this.localizedData.getItem(craft.itemId).fr}`,
      de: `${baseLink}#/recipe?lang=de&class=${
        this.getJobName(craft)}&name=${this.localizedData.getItem(craft.itemId).de}`,
      ja: `${baseLink}#/recipe?lang=ja&class=${
        this.getJobName(craft)}&name=${this.localizedData.getItem(craft.itemId).ja}`
    };
  }

  getJobName(craft: Recipe): string {
    const splitIcon = craft.icon.split('/');
    const lowerCaseJobName = splitIcon[splitIcon.length - 1].replace('.png', '');
    return lowerCaseJobName.charAt(0).toUpperCase() + lowerCaseJobName.slice(1);
  }

}
