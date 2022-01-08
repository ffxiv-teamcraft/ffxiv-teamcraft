import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ProfitEntry } from './model/profit-entry';
import { pluck } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ProfitsService {

  constructor(private http: HttpClient) {
  }

  public getCraftingProfit(server: string, levels: number[], selfSufficient: boolean, minVelocity: number, maxComplexity: number): Observable<ProfitEntry[]> {
    const params = new HttpParams()
      .set('server', server)
      .set('levels', levels.join(','))
      .set('selfSufficient', selfSufficient.toString())
      .set('minVelocity', minVelocity)
      .set('maxComplexity', maxComplexity);
    return this.http.get<{ items: ProfitEntry[] }>(`https://profits.ffxivteamcraft.com/crafting`, { params }).pipe(
      pluck('items')
    );
  }

  public getGatheringProfit(server: string, levels: number[], minVelocity: number): Observable<ProfitEntry[]> {
    const params = new HttpParams()
      .set('server', server)
      .set('levels', levels.join(','))
      .set('minVelocity', minVelocity);
    return this.http.get<{ items: ProfitEntry[] }>(`https://profits.ffxivteamcraft.com/gathering`, { params }).pipe(
      pluck('items')
    );
  }
}
