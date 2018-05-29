import {Injectable} from '@angular/core';
import {I18nName} from '../../model/list/i18n-name';
import * as items from './sources/items.json';
import * as places from './sources/places.json';
import * as mobs from './sources/mobs.json';
import * as weathers from './sources/weathers.json';
import * as npcs from './sources/npcs.json';
import * as craftingActions from './sources/craft-actions.json';
import * as actions from './sources/actions.json';
import * as ventures from './sources/ventures.json';
import {Language} from './language';

@Injectable()
export class LocalizedDataService {

    indentRegexp = new RegExp('<Indent/>', 'i');

    constructor() {
    }

    public getItem(id: number): I18nName {
        const row = this.getRow(items, id);
        if (row !== undefined) {
            row.fr = row.fr.replace(this.indentRegexp, '');
        }
        return row;
    }

    public getItemIdsByName(name: string, language: Language): number[] {
        if (['en', 'fr', 'de', 'ja'].indexOf(language) === -1) {
            language = 'en';
        }
        const regex = new RegExp(`${name}`, 'i');
        const res = [];
        const keys = Object.keys(items);
        for (const key of keys) {
            if (regex.test(items[key][language])) {
                res.push(key);
            }
        }
        // Return a number array with the keys as values, so we have to convert them to numbers.
        return res.map(id => +id);
    }

    public getPlace(id: number): I18nName {
        return this.getRow(places, id);
    }

    public getNpc(id: number): I18nName {
        return this.getRow(npcs, id);
    }

    public getMob(id: number): I18nName {
        return this.getRow(mobs, id);
    }

    public getVenture(id: number): I18nName {
        return this.getRow(ventures, id);
    }

    public getWeather(name: string): I18nName {
        return this.getRowByName(weathers, name, 'en');
    }

    public getAreaIdByENName(name: string): number {
        return this.getIndexByName(places, name, 'en');
    }

    public getCraftingActionIdByName(name: string, language: Language): number {
        let res = this.getIndexByName(craftingActions, name, language);
        if (res === -1) {
            res = this.getIndexByName(actions, name, language);
        }
        if (res === -1) {
            throw new Error('Data row not found.');
        }
        return res;
    }

    public getCraftingActionByName(name: string, language: Language): I18nName {
        const result = this.getRowByName(craftingActions, name, language) || this.getRowByName(actions, name, language);
        if (result === undefined) {
            throw new Error('Data row not found.');
        }
        return result;
    }

    public getCraftingAction(id: number): I18nName {
        const result = this.getRow(craftingActions, id) || this.getRow(actions, id);
        if (result === undefined) {
            throw new Error('Data row not found.');
        }
        return result;
    }

    private getRow(array: any, id: number | string): I18nName {
        if (array === undefined) {
            return undefined;
        }
        return array[id];
    }

    /**
     * Specific case for weather, might be usefule for other data.
     * @param array
     * @param name
     * @param language
     * @returns {I18nName}
     */
    private getRowByName(array: any, name: string, language: Language): I18nName {
        const res = this.getIndexByName(array, name, language);
        if (res === -1) {
            return undefined;
        }
        return array[res];
    }

    /**
     * Gets the id of a row by name.
     * @param  array
     * @param {string} name
     * @param language
     * @returns {number}
     */
    private getIndexByName(array: any, name: string, language: string): number {
        if (array === undefined) {
            return -1;
        }
        if (['en', 'fr', 'de', 'ja'].indexOf(language) === -1) {
            language = 'en';
        }
        let res = -1;
        const keys = Object.keys(array);
        for (const key of keys) {
            if (array[key][language] === name) {
                res = +key;
                break;
            }
        }
        return res;
    }
}
