import {I18nName} from '../../model/list/i18n-name';

/**
 * A link abse is a constructor class for every external link in the app, allowing settings to change link types on the fly.
 */
export abstract class AbstractLinkBase {
    /**
     * Creates a link to the item specified using the base link.
     * @returns {string}
     * @param name
     * @param id
     */
    public abstract getItemLink(name: I18nName, id: number): I18nName;
}
