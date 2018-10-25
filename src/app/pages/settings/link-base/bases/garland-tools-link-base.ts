import { AbstractLinkBase } from '../abstract-link-base';
import { I18nName } from '../../../../model/list/i18n-name';

export class GarlandToolsLinkBase extends AbstractLinkBase {

    getItemLink(name: I18nName, id: number): I18nName {
        return {
            fr: `http://garlandtools.org/files/#item/${id}`,
            en: `http://garlandtools.org/files/#item/${id}`,
            de: `http://garlandtools.org/files/#item/${id}`,
            ja: `http://garlandtools.org/files/#item/${id}`
        };
    }

}
