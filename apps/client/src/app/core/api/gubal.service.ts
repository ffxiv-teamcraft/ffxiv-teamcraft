import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { IpcService } from '../electron/ipc.service';
import { ofPacketSubType } from '../rxjs/of-packet-subtype';
import { buffer, debounceTime } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class GubalService {

  constructor(private http: HttpClient, private ipc: IpcService) {
  }

  public init(): void {
    const desynthResult$ = this.ipc.actorControlPackets$.pipe(
      ofPacketSubType('desynthResult')
    );

    desynthResult$.pipe(
      buffer(desynthResult$.pipe(debounceTime(1000)))
    ).subscribe(packets => {
      console.log(packets);
    });
  }
}
