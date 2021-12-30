import { IpcService } from '../ipc.service';
import { Injectable } from '@angular/core';
import { AuthFacade } from '../../../+state/auth.facade';
import { EorzeaFacade } from '../../../modules/eorzea/+state/eorzea.facade';
import { Vector2 } from '../../tools/vector2';
import { delayWhen, filter, map, switchMap, takeUntil, tap } from 'rxjs/operators';
import { combineLatest, interval, merge, Subject } from 'rxjs';
import { MapData } from '../../../modules/map/map-data';
import { MapService } from '../../../modules/map/map.service';
import { NodeTypeIconPipe } from '../../../pipes/pipes/node-type-icon.pipe';
import { Aetheryte } from '../../data/aetheryte';
import { Npc } from '../../../pages/db/model/npc/npc';
import { Vector3 } from '../../tools/vector3';
import { TerritoryLayer } from '../../data/model/territory-layer';
import { uniqBy } from 'lodash';
import { HttpClient, HttpParams } from '@angular/common/http';
import { SettingsService } from '../../../modules/settings/settings.service';
import { XivapiReportEntry } from './xivapi-report-entry';
import { UpdatePositionHandler } from '@ffxiv-teamcraft/pcap-ffxiv';
import { LazyDataFacade } from '../../../lazy-data/+state/lazy-data.facade';
import { withLazyData } from '../../rxjs/with-lazy-data';
import { LazyData } from '../../../lazy-data/lazy-data';

export interface MappyMarker {
  position: Vector3;
  ingameCoords: Vector3;
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
  timestamp: number;
}

export interface ObjEntry extends MappyMarker {
  id: number;
  kind: number;
  timestamp: number;
  icon?: string;
}

export interface GameDataEntry<T> extends MappyMarker {
  data: T;
}

export interface MappyReporterState {
  mapId: number;
  map: MapData;
  layersNotConfigured: boolean;
  territoryMaps: { mapId: number, subZoneId: number }[];
  zoneId: number;
  subZoneId: number;
  playerCoords: Vector3;
  player: Vector2;
  playerRotationTransform: string;
  bnpcs: BNpcEntry[];
  mappyBnpcs: BNpcEntry[];
  outOfBoundsBnpcs: BNpcEntry[];
  objs: ObjEntry[];
  mappyObjs: ObjEntry[];
  outOfBoundsObjs: ObjEntry[];
  aetherytes: GameDataEntry<Aetheryte>[];
  enpcs: GameDataEntry<Npc>[];
  trail: Vector2[];
  reports: number;
  debug: any;
  zoning: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class MappyReporterService {

  private static readonly XIVAPI_URL = 'xivapi.com';

  public available = false;

  private reportedUntil = Date.now();

  private state: MappyReporterState = {
    zoning: false,
    aetherytes: [],
    bnpcs: [],
    mappyBnpcs: [],
    debug: undefined,
    enpcs: [],
    map: undefined,
    layersNotConfigured: false,
    territoryMaps: [],
    mapId: 0,
    objs: [],
    outOfBoundsBnpcs: [],
    mappyObjs: [],
    outOfBoundsObjs: [],
    player: undefined,
    playerCoords: undefined,
    playerRotationTransform: '',
    subZoneId: 0,
    trail: [],
    zoneId: 0,
    reports: 0
  };

  private dirty = false;

  private intervals: any[] = [];

  private stop$ = new Subject<void>();

  constructor(private ipc: IpcService, private lazyData: LazyDataFacade, private authFacade: AuthFacade,
              private eorzeaFacade: EorzeaFacade, private mapService: MapService,
              private http: HttpClient, private settings: SettingsService) {
  }

  public start(): void {
    const queryParams = new HttpParams().set('private_key', this.settings.xivapiKey);
    this.http.get<{ ok: boolean, username: string }>(`https://${MappyReporterService.XIVAPI_URL}/mappy/check-key`, {
      params: queryParams
    }).subscribe(result => {
      this.available = result.ok;
      if (this.available) {
        this.initReporter();
      }
    });
  }

  stop(): void {
    this.intervals.forEach(i => clearInterval(i));
    this.intervals = [];
    this.stop$.next();
  }

  private isInLayer(coords: Vector3, layerBounds: Vector3<{ min: number, max: number }>): boolean {
    let matches = true;
    if (layerBounds.z.min || layerBounds.z.max) {
      matches = matches && (coords.z >= layerBounds.z.min && coords.z <= layerBounds.z.max);
    }
    if (layerBounds.y.min || layerBounds.y.max) {
      matches = matches && (coords.y >= layerBounds.y.min && coords.y <= layerBounds.y.max);
    }
    if (layerBounds.x.min || layerBounds.x.max) {
      matches = matches && (coords.x >= layerBounds.x.min && coords.x <= layerBounds.x.max);
    }
    return matches;
  }

  private initReporter(): void {

    this.ipc.on('mappy:reload', () => {
      this.addMappyData(this.state.mapId);
    });

    this.intervals.push(setInterval(() => {
      if (this.state && this.dirty) {
        this.ipc.send('mappy-state:set', this.state);
        this.dirty = false;
      }
    }, 200));

    this.intervals.push(setInterval(() => {
      this.pushReports();
    }, 10000));
    // Base map tracker
    this.lazyData.getEntry('nodes').pipe(
      switchMap((nodes) => {
        const acceptedMaps = Object.values(nodes).map(n => n.map);
        return this.eorzeaFacade.mapId$.pipe(
          map(mapId => {
            return acceptedMaps.includes(mapId) ? mapId : 0;
          })
        );
      })
    ).subscribe((mapId) => {
      this.setMap(mapId, true);
    });

    this.ipc.prepareZoningPackets$
      .pipe(
        takeUntil(this.stop$)
      ).subscribe((packet) => {
      this.setState({
        zoning: true
      });
    });

    let positionTicks = 0;
    combineLatest([
      this.lazyData.getEntry('territoryLayers'),
      this.lazyData.getEntry('maps')
    ]).pipe(
      switchMap(([territoryLayers, maps]) => {
        return merge(
          this.ipc.updatePositionHandlerPackets$,
          this.ipc.updatePositionInstancePackets$,
          this.ipc.initZonePackets$
        ).pipe(
          takeUntil(this.stop$),
          filter(() => {
            return !!this.state.mapId;
          }),
          tap((p) => {
            positionTicks++;
            if (positionTicks % 50 === 0) {
              this.setState({
                trail: [
                  ...this.state.trail,
                  { ...this.state.player }
                ]
              });
            }
          }),
          map(position => ({ position, territoryLayers, maps }))
        );
      })
    ).subscribe(({ position, territoryLayers, maps }) => {
      const pos = {
        x: position.pos.x,
        y: position.pos.z,
        z: position.pos.y
      };
      const playerCoords = this.getCoords(pos);
      let mapId = this.state.mapId;
      const possibleLayers = (territoryLayers[maps[this.state.mapId].territory_id] || []).filter(layer => !layer.ignored && layer.placeNameId > 0);
      if (possibleLayers.length > 0) {
        const currentLayer = possibleLayers.length === 1 ? possibleLayers[0] : possibleLayers.find(layer => {
          return this.isInLayer(playerCoords, layer.bounds);
        });
        const hasUnconfiguredLayer = possibleLayers.length > 1 && possibleLayers.some(layer => {
          return (layer.bounds.z.min === 0 && layer.bounds.z.max === 0)
            && (layer.bounds.x.min === 0 && layer.bounds.x.max === 0)
            && (layer.bounds.y.min === 0 && layer.bounds.y.max === 0);
        });
        if (hasUnconfiguredLayer) {
          this.setState({
            layersNotConfigured: true,
            territoryMaps: possibleLayers.map(layer => {
              return {
                mapId: layer.mapId,
                subZoneId: maps[layer.mapId].placename_sub_id || maps[layer.mapId].placename_id
              };
            })
          });
        } else {
          this.setState({
            layersNotConfigured: false
          });
        }
        mapId = currentLayer ? currentLayer.mapId : this.state.mapId;
      } else {
        this.setState({
          layersNotConfigured: false
        });
      }

      if (mapId !== this.state.mapId) {
        this.setMap(mapId, false);
      }

      this.setState({
        playerCoords: playerCoords,
        player: this.getPosition(pos),
        playerRotationTransform: `rotate(${((position as UpdatePositionHandler).rotation - Math.PI) * -1}rad)`
      });
    });

    // Monsters
    this.ipc.npcSpawnPackets$.pipe(
      takeUntil(this.stop$),
      delayWhen(() => {
        return this.state.zoning ? interval(2000) : interval(0);
      }),
      withLazyData(this.lazyData, 'territoryLayers', 'maps')
    ).subscribe(([packet, territoryLayers, maps]) => {
      const isPet = packet.bNpcName >= 1398 && packet.bNpcName <= 1404;
      const isChocobo = packet.bNpcName === 780;
      if (isPet || isChocobo) {
        return;
      }

      const position = {
        x: packet.pos.x,
        y: packet.pos.z,
        z: packet.pos.y
      };
      const coords = this.getCoords(position);
      const uniqId = `${packet.bNpcName}-${coords.x}/${coords.y}`;
      if (this.state.bnpcs.some(row => row.uniqId === uniqId)
        || this.state.outOfBoundsBnpcs.some(row => row.uniqId === uniqId)) {
        return;
      }

      const newEntry: BNpcEntry = {
        nameId: packet.bNpcName,
        baseId: packet.bNpcBase,
        position: position,
        ingameCoords: coords,
        displayPosition: this.getPosition(position),
        uniqId: uniqId,
        level: packet.level,
        HP: packet.hPMax,
        fateId: packet.fateId,
        timestamp: Date.now()
      };

      if (this.isInLayer(coords, this.getCurrentLayer(territoryLayers, maps).bounds)) {
        this.setState({
          bnpcs: [
            ...this.state.bnpcs,
            newEntry
          ]
        });
      } else {
        this.setState({
          outOfBoundsBnpcs: [
            ...this.state.outOfBoundsBnpcs,
            newEntry
          ]
        });
      }
    });

    // Objects
    this.ipc.objectSpawnPackets$.pipe(
      takeUntil(this.stop$),
      delayWhen(() => {
        return this.state.zoning ? interval(2000) : interval(0);
      }),
      filter(() => this.state !== undefined),
      withLazyData(this.lazyData, 'territoryLayers', 'maps', 'gatheringPointToNodeId', 'nodes')
    ).subscribe(([packet, territoryLayers, maps, gatheringPointToNodeId, nodes]) => {
      const position = {
        x: packet.position.x,
        y: packet.position.z,
        z: packet.position.y
      };
      const coords = this.getCoords(position);
      const uniqId = `${packet.objId}-${Math.floor(coords.x)}/${Math.floor(coords.y)}`;
      if (this.state.objs.some(row => row.uniqId === uniqId)
        || this.state.outOfBoundsObjs.some(row => row.uniqId === uniqId)
        || packet.objKind !== 6) {
        return;
      }
      const obj: ObjEntry = {
        id: packet.objId,
        kind: packet.objKind,
        position: position,
        ingameCoords: coords,
        displayPosition: this.getPosition(position),
        uniqId: uniqId,
        icon: this.getNodeIcon(packet.objId, gatheringPointToNodeId, nodes),
        timestamp: Date.now()
      };

      if (this.isInLayer(coords, this.getCurrentLayer(territoryLayers, maps).bounds)) {
        this.setState({
          objs: [
            ...this.state.objs,
            obj
          ]
        });
      } else {
        this.setState({
          outOfBoundsObjs: [
            ...this.state.outOfBoundsObjs,
            obj
          ]
        });
      }
    });
  }

  private getCurrentLayer(territoryLayers: LazyData['territoryLayers'], maps: LazyData['maps']): TerritoryLayer {
    const placeholderLayer = {
      mapId: this.state.mapId,
      index: 0,
      placeNameId: this.state.zoneId,
      bounds: {
        x: {
          min: -50,
          max: 999
        },
        y: {
          min: -50,
          max: 999
        },
        z: {
          min: -50,
          max: 999
        }
      }
    };

    // This case only happens when we're loading a new map
    if (!this.state.mapId) {
      return placeholderLayer;
    }
    const possibleLayers = territoryLayers[maps[this.state.mapId].territory_id];
    if (!possibleLayers) {
      return placeholderLayer;
    }
    return possibleLayers.find(layer => {
      return layer.mapId === this.state.mapId;
    });
  }

  private setMap(mapId: number, territoryChanged: boolean): void {
    if (!mapId) {
      return;
    }
    // Start by pushing current reports
    this.pushReports();
    this.addMappyData(mapId);

    combineLatest([
      this.lazyData.getEntry('npcs'),
      this.lazyData.getEntry('aetherytes'),
      this.lazyData.getEntry('maps'),
      this.lazyData.getEntry('territoryLayers')
    ]).subscribe(([npcs, lazyAetherytes, maps, territoryLayers]) => {

      const enpcs = Object.keys(npcs).map(key => npcs[key]).filter(npc => npc.position && npc.position.map === mapId);
      const aetherytes = Object.keys(lazyAetherytes).map(key => lazyAetherytes[key]).filter(aetheryte => aetheryte.map === mapId);

      const newState: Partial<MappyReporterState> = {
        zoning: false,
        mapId: mapId,
        zoneId: maps[mapId].placename_id,
        subZoneId: maps[mapId].placename_sub_id || maps[mapId].placename_id,
        map: maps[mapId],
        bnpcs: [],
        outOfBoundsBnpcs: [],
        objs: [],
        outOfBoundsObjs: [],
        trail: [],
        enpcs: enpcs.map(row => {
          return {
            uniqId: row.en,
            fromGameData: true,
            position: row.position,
            ingameCoords: this.getCoords(row.position),
            data: row,
            displayPosition: this.mapService.getPositionOnMap(maps[mapId], row.position)
          };
        }),
        aetherytes: aetherytes.map(row => {
          return {
            uniqId: row.id.toString(),
            fromGameData: true,
            position: {
              x: row.x,
              y: row.y,
              z: row.z
            },
            ingameCoords: this.getCoords(row),
            data: row,
            displayPosition: this.mapService.getPositionOnMap(maps[mapId], {
              x: row.x,
              y: row.y
            })
          };
        })
      };


      /**
       *  If we just changed layer, keep everything, just filter for display purpose.
       *  Else, all the arrays will be reset as we can't have out of bounds stuff.
       */
      if (!territoryChanged) {
        const newBnpcs = this.state.outOfBoundsBnpcs.filter(bnpc => {
          return this.isInLayer(bnpc.ingameCoords, this.getCurrentLayer(territoryLayers, maps).bounds);
        });

        const newObjs = this.state.outOfBoundsObjs.filter(obj => {
          return this.isInLayer(obj.ingameCoords, this.getCurrentLayer(territoryLayers, maps).bounds);
        });

        newState.outOfBoundsBnpcs = uniqBy([
          ...this.state.bnpcs,
          ...this.state.outOfBoundsBnpcs
        ], 'uniqId');

        newState.outOfBoundsObjs = uniqBy([
          ...this.state.objs,
          ...this.state.outOfBoundsObjs
        ], 'uniqId');

        newState.bnpcs = newBnpcs.map(row => {
          const newCoords = this.getCoords(row.position);
          return {
            ...row,
            ingameCoords: newCoords,
            displayPosition: this.mapService.getPositionOnMap(newState.map, newCoords),
            timestamp: Date.now()
          };
        });
        newState.objs = newObjs.map(row => {
          const newCoords = this.getCoords(row.position);
          return {
            ...row,
            ingameCoords: newCoords,
            displayPosition: this.mapService.getPositionOnMap(newState.map, newCoords),
            timestamp: Date.now()
          };
        });
      }
      this.setState(newState);
    });
  }

  private addMappyData(mapId: number): void {
    if (mapId === 0) {
      return;
    }
    this.http.get<XivapiReportEntry[]>(`https://${MappyReporterService.XIVAPI_URL}/mappy/map/${mapId}`)
      .pipe(
        withLazyData(this.lazyData, 'gatheringPointToNodeId', 'nodes')
      )
      .subscribe(([reports, gatheringPointToNodeId, nodes]) => {
        this.setState({
          mappyBnpcs: reports
            .filter(report => report.Type === 'BNPC')
            .map(report => {
              return {
                nameId: report.BNpcNameID,
                baseId: report.BNpcBaseID,
                level: report.Level,
                HP: report.HP,
                fateId: report.FateID,
                timestamp: 0,
                position: {
                  x: report.CoordinateX,
                  y: report.CoordinateY,
                  z: report.CoordinateZ
                },
                ingameCoords: {
                  x: report.PosX,
                  y: report.PosY,
                  z: report.PosZ
                },
                displayPosition: {
                  x: report.PixelX / 20.48,
                  y: report.PixelY / 20.48
                },
                uniqId: ''
              };
            }),
          mappyObjs: reports
            .filter(report => report.Type === 'Node')
            .map(report => {
              return {
                id: report.NodeID,
                kind: 6,
                icon: this.getNodeIcon(report.NodeID, gatheringPointToNodeId, nodes),
                timestamp: 0,
                position: {
                  x: report.CoordinateX,
                  y: report.CoordinateY,
                  z: report.CoordinateZ
                },
                ingameCoords: {
                  x: report.PosX,
                  y: report.PosY,
                  z: report.PosZ
                },
                displayPosition: {
                  x: report.PixelX / 20.48,
                  y: report.PixelY / 20.48
                },
                uniqId: ''
              };
            })
        });
      });
  }

  private getNodeIcon(gatheringPointBaseId: number, gatheringPointToNodeId: LazyData['gatheringPointToNodeId'], nodes: LazyData['nodes']): string {
    const nodeId = gatheringPointToNodeId[gatheringPointBaseId];
    const node = nodes[nodeId];
    if (!node) {
      return './assets/icons/mappy/highlight.png';
    }
    if (node.limited) {
      return NodeTypeIconPipe.timed_icons[node.type];
    }
    return NodeTypeIconPipe.icons[node.type];
  }

  private getCoords(coords: Vector2 | Vector3): Vector3 {
    if (!(this.state && this.state.map)) {
      return {
        x: 0,
        y: 0,
        z: 0
      };
    }
    const c = this.state.map.size_factor / 100;
    const x = (coords.x + this.state.map.offset_x) * c;
    const y = (coords.y + this.state.map.offset_y) * c;
    return {
      x: (41 / c) * ((x + 1024) / 2048) + 1,
      y: (41 / c) * ((y + 1024) / 2048) + 1,
      z: Math.floor(((<Vector3>coords).z - this.state.map.offset_z)) / 100
    };
  }

  private getPosition(coords: Vector2): Vector2 {
    if (this.state.map === undefined) {
      return {
        x: 0,
        y: 0
      };
    }
    const raw = this.getCoords(coords);
    return this.mapService.getPositionOnMap(this.state.map, raw);
  }

  private setState(newState: Partial<MappyReporterState>): void {
    this.state = {
      ...(this.state || {}),
      ...(newState as MappyReporterState)
    };
    this.dirty = true;
  }

  private pushReports(): void {
    if (this.state.mapId === 0) {
      return;
    }
    // As we're doing a snapshot, we need to register date before we send data, not after.
    const newReport = Date.now();
    const snapshot = { ...this.state };
    const bnpcReports: XivapiReportEntry[] = snapshot.bnpcs
      .filter(bnpc => bnpc.timestamp > this.reportedUntil)
      .map(bnpc => {
        return {
          BNpcBaseID: bnpc.baseId,
          BNpcNameID: bnpc.nameId,
          CoordinateX: bnpc.position.x,
          CoordinateY: bnpc.position.y,
          CoordinateZ: bnpc.position.z,
          FateID: bnpc.fateId,
          HP: bnpc.HP,
          Level: bnpc.level,
          MapID: snapshot.mapId,
          MapTerritoryID: snapshot.map.territory_id,
          NodeID: 0,
          PixelX: Math.floor(bnpc.displayPosition.x * 20.48),
          PixelY: Math.floor(bnpc.displayPosition.y * 20.48),
          PlaceNameID: snapshot.map.placename_id,
          PosX: bnpc.ingameCoords.x,
          PosY: bnpc.ingameCoords.y,
          PosZ: bnpc.ingameCoords.z,
          Type: 'BNPC'
        };
      });

    const objReports: XivapiReportEntry[] = snapshot.objs
      .filter(obj => obj.timestamp > this.reportedUntil && obj.id !== undefined)
      .map(obj => {
        return {
          BNpcBaseID: 0,
          BNpcNameID: 0,
          CoordinateX: obj.position.x,
          CoordinateY: obj.position.y,
          CoordinateZ: obj.position.z,
          FateID: 0,
          HP: 0,
          Level: 0,
          MapID: snapshot.mapId,
          MapTerritoryID: snapshot.map.territory_id,
          NodeID: obj.id,
          PixelX: Math.floor(obj.displayPosition.x * 20.48),
          PixelY: Math.floor(obj.displayPosition.y * 20.48),
          PlaceNameID: snapshot.map.placename_id,
          PosX: obj.ingameCoords.x,
          PosY: obj.ingameCoords.y,
          PosZ: obj.ingameCoords.z,
          Type: 'Node'
        };
      });

    const reports = [...bnpcReports, ...objReports];

    if (reports.length === 0) {
      return;
    }

    const queryParams = new HttpParams().set('private_key', this.settings.xivapiKey);
    this.http.post(`https://${MappyReporterService.XIVAPI_URL}/mappy/submit`, reports, { params: queryParams }).subscribe(() => {
      this.setState({
        reports: this.state.reports + 1
      });
      this.reportedUntil = newReport;
    });
  }
}
