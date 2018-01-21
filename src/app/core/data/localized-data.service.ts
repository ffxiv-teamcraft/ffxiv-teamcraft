import {Injectable} from '@angular/core';
import {I18nName} from '../../model/list/i18n-name';
import {items} from './sources/items';
import {places} from './sources/places';
import {mobs} from './sources/mobs';
import {weathers} from './sources/weathers';
import {npcs} from './sources/npcs';
import {craftingActions} from './sources/crafting-actions';
import {actions} from './sources/actions';

@Injectable()
export class LocalizedDataService {

    constructor() {
    }

    public getItem(id: number): I18nName {
        return this.getRow(items, id);
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

    public getCraftingActionByName(name: string, language: 'en' | 'fr' | 'de' | 'ja'): I18nName {
        const result = this.getRowByName(craftingActions, name, language) || this.getRowByName(actions, name, language);
        if (result === undefined) {
            throw new Error('Data row not found.');
        }
        return result;
    }

    private getRow(array: { [index: number]: I18nName }, id: number): I18nName {
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
    private getRowByName(array: { [index: number]: I18nName }, name: string, language: 'en' | 'fr' | 'de' | 'ja'): I18nName {
        const res = this.getIndexByName(array, name, language);
        if (res === -1) {
            return undefined;
        }
        return array[res];
    }

    private getIndexByName(array: { [index: number]: I18nName }, name: string, language: string): number {
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
