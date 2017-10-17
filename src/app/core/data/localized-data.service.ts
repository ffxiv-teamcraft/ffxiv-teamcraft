import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {I18nName} from '../../model/list/i18n-name';
import {Observable} from 'rxjs/Observable';

@Injectable()
export class LocalizedDataService {

    private items: { [index: number]: I18nName };

    private places: { [index: number]: I18nName };

    private npcs: { [index: number]: I18nName };

    constructor(private http: HttpClient) {
        this.load('items').subscribe(items => this.items = items);
        this.load('places').subscribe(places => this.places = places);
        this.load('npcs').subscribe(npcs => this.npcs = npcs);
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

    private load(fileName: string): Observable<{ [index: number]: I18nName }> {
        return this.http.get<{ [index: number]: I18nName }>(`/assets/data/${fileName}.json`);
    }
}
