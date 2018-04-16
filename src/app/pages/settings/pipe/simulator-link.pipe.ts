import {Pipe, PipeTransform} from '@angular/core';
import {I18nName} from '../../../model/list/i18n-name';
import {SettingsService} from '../settings.service';
import {LocalizedDataService} from '../../../core/data/localized-data.service';
import {Recipe} from '../../../model/list/recipe';

@Pipe({
    name: 'simulatorLink',
    pure: true
})
export class SimulatorLinkPipe implements PipeTransform {

    constructor(private settings: SettingsService, private localizedData: LocalizedDataService) {
    }

    transform(craft: Recipe): I18nName {
        return {
            en: `${this.settings.baseSimulatorLink}#/recipe?lang=en&class=${this.getJobName(craft)}&name=${this.localizedData.getItem(craft.itemId).en}`,
            fr: `${this.settings.baseSimulatorLink}#/recipe?lang=fr&class=${this.getJobName(craft)}&name=${this.localizedData.getItem(craft.itemId).fr}`,
            de: `${this.settings.baseSimulatorLink}#/recipe?lang=de&class=${this.getJobName(craft)}&name=${this.localizedData.getItem(craft.itemId).de}`,
            ja: `${this.settings.baseSimulatorLink}#/recipe?lang=ja&class=${this.getJobName(craft)}&name=${this.localizedData.getItem(craft.itemId).ja}`
        };
    }

    getJobName(craft: Recipe): string {
        const splitIcon = craft.icon.split('/');
        const lowerCaseJobName = splitIcon[splitIcon.length - 1].replace('.png', '');
        return lowerCaseJobName.charAt(0).toUpperCase() + lowerCaseJobName.slice(1);
    }

}
