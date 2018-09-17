import { AbstractLinkBase } from '../abstract-link-base';
import { I18nName } from '../../../../model/common/i18n-name';

export class GarlandToolsLinkBase extends AbstractLinkBase {

  getItemLink(name: I18nName, id: number): I18nName {
    return {
      fr: `http://garlandtools.org/db/#item/${id}`,
      en: `http://garlandtools.org/db/#item/${id}`,
      de: `http://garlandtools.org/db/#item/${id}`,
      ja: `http://garlandtools.org/db/#item/${id}`
    };
  }

}
