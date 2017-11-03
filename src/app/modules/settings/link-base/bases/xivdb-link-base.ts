import {AbstractLinkBase} from '../abstract-link-base';
import {I18nName} from '../../../../model/list/i18n-name';

export class XivdbLinkBase extends AbstractLinkBase {

    getItemLink(name: I18nName, id: number): I18nName {
        return {
            fr: `http://fr.xivdb.com/item/${id}/${this.toUrl(name.fr)}`,
            en: `http://xivdb.com/item/${id}/${this.toUrl(name.en)}`,
            de: `http://de.xivdb.com/item/${id}/${this.toUrl(name.de)}`,
            ja: `http://ja.xivdb.com/item/${id}/${this.toUrl(name.ja)}`
        };
    }

    toUrl(name: string): string {
        return name.replace(/ /g, '+').toLowerCase();
    }
}
