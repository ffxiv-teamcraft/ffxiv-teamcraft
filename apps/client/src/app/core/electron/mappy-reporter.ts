import { IpcService } from './ipc.service';
import { LazyDataService } from '../data/lazy-data.service';
import { Injectable } from '@angular/core';
import { AuthFacade } from '../../+state/auth.facade';
import { EorzeaFacade } from '../../modules/eorzea/+state/eorzea.facade';
import { combineLatest } from 'rxjs';
import { Vector2 } from '../tools/vector2';

export interface MappyReporterState {
  mapId: number;
  zoneId: number;
  playerCoords: Vector2;
  playerRotation: number;
}

@Injectable({
  providedIn: 'root'
})
export class MappyReporterService {

  private state: MappyReporterState;

  constructor(private ipc: IpcService, private lazyData: LazyDataService, private authFacade: AuthFacade,
              private eorzeaFacade: EorzeaFacade) {
  }

  public start(): void {
    // TODO check permission to run mappy
    combineLatest([
      this.eorzeaFacade.mapId$,
      this.eorzeaFacade.zoneId$,
      this.ipc.updatePositionHandlerPackets$
    ])
      .subscribe(([mapId, zoneId, position]) => {
        this.setState({
          mapId: mapId,
          zoneId: zoneId,
          playerCoords: {
            x: position.pos.x,
            y: position.pos.z
          },
          playerRotation: position.rotation
        });
      });
  }

  private setState(newState: MappyReporterState): void {
    this.state = {
      ...(this.state || {}),
      ...newState
    };
    this.ipc.send('mappy-state:set', this.state);
  }
}
