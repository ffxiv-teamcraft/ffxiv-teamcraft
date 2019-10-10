import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { IpcService } from '../electron/ipc.service';
import { ofPacketSubType } from '../rxjs/of-packet-subtype';
import { buffer, debounceTime, shareReplay, switchMap } from 'rxjs/operators';
import { AuthFacade } from '../../+state/auth.facade';
import { combineLatest, Observable, of } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class GubalService {

  private userId$: Observable<string> = this.authFacade.userId$.pipe(shareReplay(1));

  constructor(private http: HttpClient, private ipc: IpcService, private authFacade: AuthFacade) {
  }

  private submitData(dataType: string, data: any): Observable<void> {
    return this.userId$.pipe(
      switchMap(userId => {
        userId = !environment.production ? 'beta' : userId;
        return this.http.post<void>(`https://gubal.ffxivteamcraft.com/${dataType}`, {
          userId: userId,
          ...data
        });
      })
    );
  }

  public init(): void {
    const desynthResult$ = this.ipc.actorControlPackets$.pipe(
      ofPacketSubType('desynthResult')
    );

    desynthResult$.pipe(
      buffer(desynthResult$.pipe(debounceTime(1000))),
      switchMap(packets => {
        const sourceItemPacket = packets.find(p => p.resultType === 4321);
        if (sourceItemPacket === undefined) {
          return of(null);
        }
        const resultItemIds = packets.filter(p => p.resultType === 4322).map(p => p.itemID);
        return combineLatest(resultItemIds
          .map(resultItemId => {
            return this.submitData('desynthresults', {
              itemId: sourceItemPacket.itemID,
              resultItemId: resultItemId,
              itemHQ: sourceItemPacket.itemHQ,
              resultItemHQ: sourceItemPacket.itemHQ
            });
          }));
      })
    ).subscribe();
  }
}
