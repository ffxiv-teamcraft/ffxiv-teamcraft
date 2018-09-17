import { AbstractLinkBase } from '../abstract-link-base';
import { I18nName } from '../../../../model/common/i18n-name';

export class GamerEscapeLinkBase extends AbstractLinkBase {

  getItemLink(name: I18nName, id: number): I18nName {
    return {
      fr: `https://ffxiv.gamerescape.com/wiki/${name.en}`,
      en: `https://ffxiv.gamerescape.com/wiki/${name.en}`,
      de: `https://ffxiv.gamerescape.com/wiki/${name.en}`,
      ja: `https://ffxiv.gamerescape.com/wiki/${name.en}`
    };
  }

}
