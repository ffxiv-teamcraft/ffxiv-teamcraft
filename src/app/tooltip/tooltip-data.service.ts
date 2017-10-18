import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {URLSearchParams} from '@angular/http';
import {TranslateService} from '@ngx-translate/core';

@Injectable()
export class TooltipDataService {

    constructor(private http: HttpClient, private translator: TranslateService) {
    }

    getTooltipData(id: number): Observable<string> {
        return this.loadFromXivdb(id);
    }

    loadFromXivdb(id: number): Observable<string> {
        const body = new URLSearchParams();
        body.set('list[item]', id.toString());
        body.set('language', this.translator.currentLang);
        const options = {
            headers: new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded')
        };
        return this.http.post<any>('https://secure.xivdb.com/tooltip', body.toString(), options)
            .map(res => res.item[0].html);
    }

}
