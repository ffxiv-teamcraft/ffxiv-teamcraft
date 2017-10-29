import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {I18nName} from '../../model/list/i18n-name';
import {Observable} from 'rxjs/Observable';

@Injectable()
export class LocalizedDataService {

    private items: { [index: number]: I18nName };

    private places: { [index: number]: I18nName };

    private npcs: { [index: number]: I18nName };

    private mobs: { [index: number]: I18nName };

    private weathers: { [index: number]: I18nName };

    constructor(private http: HttpClient) {
        this.load('items').subscribe(items => this.items = items);
        this.load('places').subscribe(places => this.places = places);
        this.load('npcs').subscribe(npcs => this.npcs = npcs);
        this.load('mobs').subscribe(mobs => this.mobs = mobs);
        this.load('weathers').subscribe(weathers => this.weathers = weathers);
    }

    public getItem(id: number): I18nName {
        return this.getRow(this.items, id);
    }

    public getPlace(id: number): I18nName {
        return this.getRow(this.places, id);
    }

    public getNpc(id: number): I18nName {
        return this.getRow(this.npcs, id);
    }

    public getMob(id: number): I18nName {
        return this.getRow(this.mobs, id);
    }

    public getWeather(name: string): I18nName {
        return this.getRowByENName(this.weathers, name);
    }

    public getAreaIdByENName(name: string): number {
        return this.getIndexByENName(this.places, name);
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
