import { IpcService } from './ipc.service';
import { LazyDataService } from '../data/lazy-data.service';
import { Injectable } from '@angular/core';
import { AuthFacade } from '../../+state/auth.facade';
import { EorzeaFacade } from '../../modules/eorzea/+state/eorzea.facade';
import { combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class MappyReporterService {

  private state: any = {};

  constructor(private ipc: IpcService, private lazyData: LazyDataService, private authFacade: AuthFacade,
              private eorzeaFacade: EorzeaFacade) {
  }

  public start(): void {
    // TODO check permission to run mappy
    const position$: Observable<any> = this.ipc.updatePositionHandlerPackets$.pipe(
      map(packet => packet.pos)
    );
    combineLatest([
      this.eorzeaFacade.mapId$,
      this.eorzeaFacade.zoneId$,
      position$
    ])
      .subscribe(([mapId, zoneId, position]) => {
        this.setState({
          mapId: mapId,
          zoneId: zoneId,
          playerCoords: {
            x: position.x,
            y: position.z
          }
        });
      });
  }

  private setState(newState: any): void {
    this.state = {
      ...this.state,
      ...newState
    };
    this.ipc.send('mappy-state:set', this.state);
  }
}
