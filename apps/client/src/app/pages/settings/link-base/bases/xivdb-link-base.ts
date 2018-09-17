import { AbstractLinkBase } from '../abstract-link-base';
import { I18nName } from '../../../../model/common/i18n-name';

export class XivdbLinkBase extends AbstractLinkBase {

  getItemLink(name: I18nName, id: number): I18nName {
    return {
      fr: `https://fr.xivdb.com/item/${id}/${this.toUrl(name.fr)}`,
      en: `https://xivdb.com/item/${id}/${this.toUrl(name.en)}`,
      de: `https://de.xivdb.com/item/${id}/${this.toUrl(name.de)}`,
      ja: `https://ja.xivdb.com/item/${id}/${this.toUrl(name.ja)}`
    };
  }

  toUrl(name: string): string {
    return name.replace(/ /g, '+').toLowerCase();
  }
}
