import { IpcService } from './ipc.service';
import { LazyDataService } from '../data/lazy-data.service';
import { Injectable } from '@angular/core';
import { AuthFacade } from '../../+state/auth.facade';
import { EorzeaFacade } from '../../modules/eorzea/+state/eorzea.facade';
import { combineLatest } from 'rxjs';
import { Vector2 } from '../tools/vector2';
import { distinctUntilChanged } from 'rxjs/operators';

export interface NpcEntry {
  nameId: number;
  baseId: number;
  position: Vector2;
}

export interface ObjEntry {
  id: number;
  kind: number;
  position: Vector2;
}

export interface MappyReporterState {
  mapId: number;
  zoneId: number;
  playerCoords: Vector2;
  playerRotation: number;
  bnpcs: NpcEntry[];
  objs: ObjEntry[];
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

    // Player tracking
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

    // Monsters
    this.ipc.npcSpawnPackets$.subscribe(packet => {
      this.setState({
        bnpcs: [
          ...this.state.bnpcs,
          {
            nameId: packet.bNPCName,
            baseId: packet.bNPCBase,
            position: {
              x: packet.pos.x,
              y: packet.pos.z
            }
          }
        ]
      });
    });

    // Objects
    this.ipc.objectSpawnPackets$.subscribe(packet => {
      this.setState({
        objs: [
          ...this.state.objs,
          {
            id: packet.objId,
            kind: packet.objKind,
            position: {
              x: packet.pos.x,
              y: packet.pos.z
            }
          }
        ]
      });
    });

    // Reset some stuff on map change
    this.eorzeaFacade.mapId$.pipe(
      distinctUntilChanged()
    ).subscribe(() => this.setState({
      bnpcs: [],
      objs: []
    }));
  }

  private setState(newState: Partial<MappyReporterState>): void {
    this.state = {
      ...(this.state || {}),
      ...(newState as MappyReporterState)
    };
    this.ipc.send('mappy-state:set', this.state);
  }
}
