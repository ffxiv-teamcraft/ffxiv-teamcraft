import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { TranslateService } from '@ngx-translate/core';
import { map } from 'rxjs/operators';

@Injectable()
export class TooltipDataService {

  constructor(private http: HttpClient, private translator: TranslateService) {
  }

  getTooltipData(id: number): Observable<string> {
    return this.loadFromXivdb(id);
  }

  getActionTooltipData(id: number): Observable<string> {
    return this.loadActionFromXivdb(id);
  }

  loadFromXivdb(id: number): Observable<string> {
    const params = new HttpParams()
      .set('list[item]', id.toString())
      .set('language', this.translator.currentLang);

    return this.http.get<any>('https://secure.xivdb.com/tooltip', { params })
      .pipe(map(res => res.item[0].html));
  }

  loadActionFromXivdb(id: number): Observable<string> {
    const params = new HttpParams()
      .set('list[action]', id.toString())
      .set('language', this.translator.currentLang);

    return this.http.get<any>('https://secure.xivdb.com/tooltip', { params })
      .pipe(map(res => res.action[0].html));
  }
}
