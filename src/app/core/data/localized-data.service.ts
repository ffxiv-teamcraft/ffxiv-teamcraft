import {Injectable} from '@angular/core';
import {I18nName} from '../../model/list/i18n-name';
import {items} from './sources/items';
import {places} from './sources/places';
import {mobs} from './sources/mobs';
import {weathers} from './sources/weathers';
import {npcs} from './sources/npcs';
import {Language} from './language';

@Injectable()
export class LocalizedDataService {

    constructor() {
    }

    public getItem(id: number): I18nName {
        return this.getRow(items, id);
    }

    public getItemIdsByName(name: string, language: Language): number[] {
        const regex = new RegExp(`${name}`, 'gi');
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

    public getWeather(name: string): I18nName {
        return this.getRowByName(weathers, name, 'en');
    }

    public getAreaIdByENName(name: string): number {
        return this.getIndexByName(places, name, 'en');
    }

    private getRow(array: { [index: number]: I18nName }, id: number): I18nName {
        if (array === undefined) {
            // I18n strings (comment used for search matching)
            return {
                'en': 'Loading',
                'fr': 'Chargement en cours',
                'ja': 'ロード中',
                'de': 'Laden'
            };
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
    private getRowByName(array: { [index: number]: I18nName }, name: string, language: Language): I18nName {
        const res = this.getIndexByName(array, name, language);
        if (res === -1) {
            // I18n strings (comment used for search matching)
            return {
                'en': 'Loading',
                'fr': 'Chargement en cours',
                'ja': 'ロード中',
                'de': 'Laden'
            };
        }
        return array[res];
    }

    /**
     * Gets the id of a row by english name.
     * @param  array
     * @param {string} name
     * @param language
     * @returns {number}
     */
    private getIndexByName(array: { [index: number]: I18nName }, name: string, language: Language): number {
        if (array === undefined) {
            return -1;
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
