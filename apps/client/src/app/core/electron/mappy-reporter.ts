import { IpcService } from './ipc.service';
import { LazyDataService } from '../data/lazy-data.service';
import { Injectable } from '@angular/core';
import { AuthFacade } from '../../+state/auth.facade';
import { EorzeaFacade } from '../../modules/eorzea/+state/eorzea.facade';
import { combineLatest } from 'rxjs';
import { Vector2 } from '../tools/vector2';
import { distinctUntilChanged, tap } from 'rxjs/operators';
import { MapData } from '../../modules/map/map-data';
import { MapService } from '../../modules/map/map.service';
import { NodeTypeIconPipe } from '../../pipes/pipes/node-type-icon.pipe';

export interface MappyMarker {
  position: Vector2;
  displayPosition: Vector2;
  uniqId: string;
}

export interface NpcEntry extends MappyMarker {
  nameId: number;
  baseId: number;
  level: number;
  HP: number;
}

export interface ObjEntry extends MappyMarker {
  id: number;
  kind: number;
  icon?: string;
}

export interface MappyReporterState {
  mapId: number;
  map: MapData;
  zoneId: number;
  playerCoords: Vector2;
  player: Vector2;
  playerRotationTransform: string;
  bnpcs: NpcEntry[];
  objs: ObjEntry[];
  trail: Vector2[];
  debug: any;
}

@Injectable({
  providedIn: 'root'
})
export class MappyReporterService {

  private state: MappyReporterState;

  private dirty = false;

  constructor(private ipc: IpcService, private lazyData: LazyDataService, private authFacade: AuthFacade,
              private eorzeaFacade: EorzeaFacade, private mapService: MapService) {
    setInterval(() => {
      if (this.state && this.dirty) {
        this.ipc.send('mappy-state:set', this.state);
        this.dirty = false;
      }
    }, 100);
  }

  public start(): void {
    // TODO check permission to run mappy

    // Player tracking
    combineLatest([
      this.eorzeaFacade.mapId$,
      this.eorzeaFacade.zoneId$
    ]).subscribe(([mapId, zoneId]) => {
      this.setState({
        mapId: mapId,
        zoneId: zoneId,
        map: this.lazyData.data.maps[mapId]
      });
    });


    let positionTicks = 0;
    this.ipc.updatePositionHandlerPackets$
      .pipe(
        tap(() => {
          positionTicks++;
          if (positionTicks % 50 === 0) {
            this.setState({
              trail: [
                ...this.state.trail,
                { ...this.state.player }
              ]
            });
          }
        })
      )
      .subscribe(position => {
        const pos = {
          x: position.pos.x,
          y: position.pos.z
        };
        this.setState({
          playerCoords: this.getCoords(pos, true),
          player: this.getPosition(pos),
          playerRotationTransform: `rotate(${(position.rotation - Math.PI) * -1}rad)`
        });
      });

    // Monsters
    this.ipc.npcSpawnPackets$.subscribe(packet => {
      if (packet.displayFlags === 262184) {
        return;
      }
      const position = {
        x: packet.pos.x,
        y: packet.pos.z
      };
      const coords = this.getCoords(position, true);
      const uniqId = `${packet.bNPCName}-${Math.floor(coords.x / 2)}/${Math.floor(coords.y / 2)}`;
      if (this.state.bnpcs.some(row => row.uniqId === uniqId)) {
        return;
      }

      // TODO filter out pets and chocobos
      this.setState({
        bnpcs: [
          ...this.state.bnpcs,
          {
            nameId: packet.bNPCName,
            baseId: packet.bNPCBase,
            position: position,
            displayPosition: this.getPosition(position),
            uniqId: uniqId,
            level: packet.level,
            HP: packet.hPMax
          }
        ]
      });
    });

    // Objects
    this.ipc.objectSpawnPackets$.subscribe(packet => {
      const position = {
        x: packet.position.x,
        y: packet.position.z
      };
      const coords = this.getCoords(position, true);
      const uniqId = `${packet.objId}-${Math.floor(coords.x / 2)}/${Math.floor(coords.y / 2)}`;
      if (this.state.objs.some(row => row.uniqId === uniqId)) {
        return;
      }
      const obj: ObjEntry = {
        id: packet.objId,
        kind: packet.objKind,
        position: position,
        displayPosition: this.getPosition(position),
        uniqId: uniqId
      };
      if (obj.kind === 6) {
        obj.icon = this.getNodeIcon(obj.id);
      }
      this.setState({
        objs: [
          ...this.state.objs,
          obj
        ]
      });
    });

    // Reset some stuff on map change
    this.eorzeaFacade.mapId$.pipe(
      distinctUntilChanged()
    ).subscribe(() => this.setState({
      bnpcs: [],
      objs: [],
      trail: []
    }));
  }

  getNodeIcon(gatheringPointBaseId: number): string {
    const nodeId = this.lazyData.data.gatheringPointBaseToNodeId[gatheringPointBaseId];
    const node = this.lazyData.data.nodes[nodeId];
    if (node.limited) {
      return NodeTypeIconPipe.timed_icons[node.type];
    }
    return NodeTypeIconPipe.icons[node.type];
  }

  public getCoords(coords: Vector2, centered: boolean): Vector2 {
    if (this.state.map === undefined) {
      return {
        x: 0,
        y: 0
      };
    }
    const c = this.state.map.size_factor / 100;
    const x = (coords.x + this.state.map.offset_x) * c;
    const y = (coords.y + this.state.map.offset_y) * c;
    return {
      x: (41 / c) * ((x + (centered ? 1024 : 0)) / 2048) + 1,
      y: (41 / c) * ((y + (centered ? 1024 : 0)) / 2048) + 1
    };
  }

  public getPosition(coords: Vector2, centered = true): Vector2 {
    if (this.state.map === undefined) {
      return {
        x: 0,
        y: 0
      };
    }
    const raw = this.getCoords(coords, centered);
    return this.mapService.getPositionOnMap(this.state.map, raw);
  }

  private setState(newState: Partial<MappyReporterState>): void {
    this.state = {
      ...(this.state || {}),
      ...(newState as MappyReporterState)
    };
    this.dirty = true;
  }
}
