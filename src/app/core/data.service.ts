import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs/Observable';
import {AngularFireDatabase} from 'angularfire2/database';
import {TranslateService} from '@ngx-translate/core';

@Injectable()
export class DataService {

    private xivdbUrl = 'https://api.xivdb.com';
    private garlandUrl = 'https://www.garlandtools.org/db/data';

    constructor(private http: HttpClient, private af: AngularFireDatabase, private i18n: TranslateService) {
    }

    public getRecipe(id: number): Observable<any> {
        return this.getXivdb(`/recipe/${id}`);
    }

    public getItem(id: number): Observable<any> {
        return this.getGarland(`/item/${id}`);
    }

    public getNpc(id: number): any {
        return this.getGarland(`/npc/${id}`);
    }

    public searchRecipe(query: string): Observable<any> {
        return this.getXivdb(`/search?string=${query}&one=recipes&language=${this.i18n.currentLang}`);
    }

    private getXivdb(uri: string): Observable<any> {
        return this.http.get<any>(this.xivdbUrl + uri);
    }

    private getGarland(uri: string): Observable<any> {
        return this.http.get<any>(this.garlandUrl + uri + '.json');
    }

    private getFirebaseCache(uri: string): Observable<any> {
        return this.af.object(`/xivdb${uri}`);
    }
}
