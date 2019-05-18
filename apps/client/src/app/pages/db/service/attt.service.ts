import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ATTTCard } from '../model/attt/attt-card';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ATTTService {

  constructor(private http: HttpClient) {
  }

  public getCard(cardId: number): Observable<ATTTCard> {
    return this.http.get<ATTTCard>(`https://triad.raelys.com/api/cards/${cardId}`);
  }
}
