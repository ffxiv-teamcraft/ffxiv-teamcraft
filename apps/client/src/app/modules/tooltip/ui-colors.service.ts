import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { UIColor } from './ui-color';
import { Observable } from 'rxjs';
import { publishReplay } from 'rxjs/operators';

@Injectable()
export class UiColorsService {

  constructor(private http: HttpClient) {
  }

  getColors(): Observable<UIColor[]> {
    return this.http.get<UIColor[]>('https://xivapi.com/Colors')
      .pipe(
        publishReplay()
      );
  }
}
