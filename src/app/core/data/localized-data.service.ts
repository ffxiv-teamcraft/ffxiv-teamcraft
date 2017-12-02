import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {I18nName} from '../../model/list/i18n-name';
import {Observable} from 'rxjs/Observable';
import {items} from './sources/items';
import {places} from './sources/places';
import {mobs} from './sources/mobs';
import {weathers} from './sources/weathers';
import {npcs} from './sources/npcs';

@Injectable()
export class LocalizedDataService {

    constructor(private http: HttpClient) {
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
        return this.getRowByENName(weathers, name);
    }

    public getAreaIdByENName(name: string): number {
        return this.getIndexByENName(places, name);
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
     * @returns {I18nName}
     */
    private getRowByENName(array: { [index: number]: I18nName }, name: string): I18nName {
        const res = this.getIndexByENName(array, name);
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

    private getIndexByENName(array: { [index: number]: I18nName }, name: string): number {
        if (array === undefined) {
            return -1;
        }
        let res = -1;
        const keys = Object.keys(array);
        for (const key of keys) {
            if (array[key].en === name) {
                res = +key;
                break;
            }
        }
        return res;
    }

    private load(fileName: string): Observable<{ [index: number]: I18nName }> {
        return this.http.get<{ [index: number]: I18nName }>(`/assets/data/${fileName}.json`);
    }
}
