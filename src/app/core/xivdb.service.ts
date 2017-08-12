import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs/Observable';

@Injectable()
export class XivdbService {

    private baseUrl = 'https://api.xivdb.com';

    constructor(private http: HttpClient) {
    }

    public getRecipe(id: number): Observable<any> {
        return this.get(`/recipe/${id}`);
    }

    private get(uri: string): Observable<any> {
        return this.http.get<any>(this.baseUrl + uri);
    }

}
