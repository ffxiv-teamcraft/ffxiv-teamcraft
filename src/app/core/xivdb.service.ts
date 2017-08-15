import {Inject, Injectable, LOCALE_ID} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs/Observable';
import {AngularFireDatabase} from 'angularfire2/database';

@Injectable()
export class XivdbService {

    private xivdbUrl = 'https://api.xivdb.com';

    constructor(private http: HttpClient, private af: AngularFireDatabase, @Inject(LOCALE_ID) private locale: string) {
    }

    public getRecipe(id: number): Observable<any> {
        return this.getFirebaseCache(`/recipe/${id}`);
    }

    public getItem(id: number): Observable<any> {
        return this.getFirebaseCache(`/item/${id}`);
    }

    public searchRecipe(query: string): Observable<any> {
        return this.getXivdb(`/search?string=${query}&one=recipes&language=${this.locale.split('-')[0]}`);
    }

    private getXivdb(uri: string): Observable<any> {
        return this.http.get<any>(this.xivdbUrl + uri);
    }

    private getFirebaseCache(uri: string): Observable<any> {
        return this.af.object(`/xivdb${uri}`);
    }

}
