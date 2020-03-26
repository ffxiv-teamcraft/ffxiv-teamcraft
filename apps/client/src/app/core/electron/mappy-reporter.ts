import { IpcService } from './ipc.service';
import { LazyDataService } from '../data/lazy-data.service';
import { Injectable } from '@angular/core';
import { AuthFacade } from '../../+state/auth.facade';
import { EorzeaFacade } from '../../modules/eorzea/+state/eorzea.facade';
import { combineLatest } from 'rxjs';
import { Vector2 } from '../tools/vector2';
import { distinctUntilChanged, tap, filter } from 'rxjs/operators';
import { MapData } from '../../modules/map/map-data';
import { MapService } from '../../modules/map/map.service';
import { NodeTypeIconPipe } from '../../pipes/pipes/node-type-icon.pipe';
import { Aetheryte } from '../data/aetheryte';
import { Npc } from '../../pages/db/model/npc/npc';

export interface MappyMarker {
  position: Vector2;
  displayPosition: Vector2;
  uniqId: string;
  fromGameData?: boolean;
}

export interface BNpcEntry extends MappyMarker {
  nameId: number;
  baseId: number;
  level: number;
  HP: number;
  fateId: number;
}

export interface ObjEntry extends MappyMarker {
  id: number;
  kind: number;
  icon?: string;
}

export interface GameDataEntry<T> extends MappyMarker {
  data: T;
}

export interface MappyReporterState {
  mapId: number;
  map: MapData;
  zoneId: number;
  playerCoords: Vector2;
  player: Vector2;
  playerRotationTransform: string;
  bnpcs: BNpcEntry[];
  objs: ObjEntry[];
  aetherytes: GameDataEntry<Aetheryte>[];
  enpcs: GameDataEntry<Npc>[];
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
            HP: packet.hPMax,
            fateId: packet.fateID
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
      if (this.state.objs.some(row => row.uniqId === uniqId) || packet.objKind !== 6) {
        return;
      }
      const obj: ObjEntry = {
        id: packet.objId,
        kind: packet.objKind,
        position: position,
        displayPosition: this.getPosition(position),
        uniqId: uniqId,
        icon: this.getNodeIcon(packet.objId)
      };
      this.setState({
        objs: [
          ...this.state.objs,
          obj
        ]
      });
    });

    // Reset some stuff on map change
    combineLatest([this.eorzeaFacade.mapId$, this.lazyData.data$]).pipe(
      distinctUntilChanged((a, b) => a[0] === b[0])
    ).subscribe(([mapId, data]) => {
      const enpcs = Object.keys(data.npcs).map(key => data.npcs[key]).filter(npc => npc.position && npc.position.map === mapId);
      const aetherytes = Object.keys(data.aetherytes).map(key => data.aetherytes[key]).filter(aetheryte => aetheryte.map === mapId);
      this.setState({
        bnpcs: [],
        objs: [],
        trail: [],
        enpcs: enpcs.map(row => {
          return {
            uniqId: row.en,
            fromGameData: true,
            position: row.position,
            data: row,
            displayPosition: this.mapService.getPositionOnMap(data.maps[mapId], row.position)
          };
        }),
        aetherytes: aetherytes.map(row => {
          return {
            uniqId: row.id.toString(),
            fromGameData: true,
            position: {
              x: row.x,
              y: row.y
            },
            data: row,
            displayPosition: this.mapService.getPositionOnMap(data.maps[mapId], {
              x: row.x,
              y: row.y
            })
          };
        })
      });
    });
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
