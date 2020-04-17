import { Injectable } from '@angular/core';
import { combineLatest, Observable, of } from 'rxjs';
import { MapData } from './map-data';
import { Aetheryte } from '../../core/data/aetheryte';
import { Vector2 } from '../../core/tools/vector2';
import { MathToolsService } from '../../core/tools/math-tools';
import { NavigationStep } from './navigation-step';
import { LocalizedDataService } from '../../core/data/localized-data.service';
import { NavigationObjective } from './navigation-objective';
import { map, shareReplay, startWith, switchMap, withLatestFrom } from 'rxjs/operators';
import { XivapiService } from '@xivapi/angular-client';
import * as _ from 'lodash';
import { WorldNavigationStep } from './world-navigation-step';
import { requestsWithDelay } from '../../core/rxjs/requests-with-delay';
import { aetherstream } from '../../core/data/sources/aetherstream';
import { SettingsService } from '../settings/settings.service';
import { LazyDataService } from '../../core/data/lazy-data.service';
import { EorzeaFacade } from '../eorzea/+state/eorzea.facade';
import { Vector3 } from '../../core/tools/vector3';

@Injectable()
export class MapService {

  // Flying mount speed, used as reference for TP over mount comparison, needs a precise recording.
  private static readonly MOUNT_SPEED = 1;

  // TP duration on the same map, this is an average.
  private static readonly TP_DURATION = 8;

  private cache: { [index: number]: Observable<MapData> } = {};

  constructor(private xivapi: XivapiService, private mathService: MathToolsService, private l12n: LocalizedDataService,
              private settings: SettingsService, private lazyData: LazyDataService, private eorzea: EorzeaFacade) {
  }

  getMapById(mapId: number): Observable<MapData> {
    if (this.cache[mapId] === undefined) {
      const _mapData = this.lazyData.data.maps[mapId];
      this.cache[mapId] = of(_mapData).pipe(
        map(mapData => {
          return {
            ...mapData,
            aetherytes: this.getAetherytes(mapId)
          };
        }),
        shareReplay(1)
      );
    }
    return this.cache[mapId];
  }

  public getNearestAetheryte(mapData: MapData, coords: Vector2 | Vector3): Aetheryte {
    let nearest = mapData.aetherytes[0];
    for (const aetheryte of mapData.aetherytes.filter(ae => ae.type === 0)) {
      if (this.mathService.distance(aetheryte, coords) < this.mathService.distance(nearest, coords)) {
        nearest = aetheryte;
      }
    }
    return nearest;
  }

  public getOptimizedPathInWorld(points: NavigationObjective[]): Observable<WorldNavigationStep[]> {
    const allMaps = _.uniq(points.map(point => point.mapId));
    return requestsWithDelay(allMaps.map(mapId => this.getMapById(mapId)), 250)
      .pipe(
        switchMap(maps => {
          return combineLatest(
            maps.map(mapData => {
              return this.getOptimizedPathOnMap(mapData.id, points.filter(point => point.mapId === mapData.id))
                .pipe(
                  map(steps => {
                    return {
                      map: mapData,
                      steps: steps
                    };
                  })
                );
            })
          ).pipe(
            withLatestFrom(this.eorzea.mapId$.pipe(startWith(0))),
            map(([optimizedPaths, mapId]: [WorldNavigationStep[], number]) => {
              const res: WorldNavigationStep[] = [];
              const pool = [...optimizedPaths];
              const startingPoint = this.getAetherytes(mapId || this.settings.startingPlace)[0]
                || this.getAetherytes(this.settings.startingPlace)[0];
              res.push(pool.sort((a, b) => {
                const aCost = this.getTpCost(startingPoint, a.map.aetherytes[0]);
                const bCost = this.getTpCost(startingPoint, b.map.aetherytes[0]);
                return aCost - bCost;
              }).shift());
              while (pool.length > 0) {
                res.push(
                  pool.sort((a, b) => {
                    const aCost = this.getTpCost(res[res.length - 1].map.aetherytes[0], a.map.aetherytes[0]);
                    const bCost = this.getTpCost(res[res.length - 1].map.aetherytes[0], b.map.aetherytes[0]);
                    return aCost - bCost;
                  }).shift()
                );
              }
              return res;
            })
          );
        })
      );
  }

  private getTpCost(from: Aetheryte, to: Aetheryte): number {
    if (from === undefined || to === undefined) {
      return 999;
    }
    if (this.settings.freeAetheryte === to.nameid) {
      return 0;
    }
    const fromCoords = from.aethernetCoords;
    const toCoords = to.aethernetCoords;
    if (fromCoords === undefined || toCoords === undefined) {
      return 999;
    }

    if (from.map === to.map) {
      return 100;
    }

    const base = (Math.sqrt(Math.pow(fromCoords.x - toCoords.x, 2) + Math.pow(fromCoords.y - toCoords.y, 2)) / 2) + 100;
    if (this.settings.favoriteAetherytes.indexOf(to.nameid) > -1) {
      return Math.floor(Math.min(base, 999) / 2);
    }
    return Math.floor(Math.min(base, 999));
  }

  public getOptimizedPathOnMap(mapId: number, points: NavigationObjective[], startPoint?: NavigationObjective): Observable<NavigationStep[]> {
    return this.getMapById(mapId)
      .pipe(
        map(mapData => {
          // We only want big aetherytes.
          const bigAetherytes = mapData.aetherytes.filter(ae => ae.type === 0);
          // If theres no start point, check from each aetheryte to fidn the shortest path
          if (startPoint === undefined) {
            const paths = bigAetherytes.map(aetheryte => this.getShortestPath({
              x: aetheryte.x,
              y: aetheryte.y,
              name: this.l12n.getPlace(aetheryte.nameid)
            }, points, bigAetherytes));
            return paths.sort((a, b) => this.totalDuration(a) - this.totalDuration(b))[0];
          } else {
            return this.getShortestPath(startPoint, points, bigAetherytes);
          }
        })
      );
  }

  getPositionOnMap(mapData: MapData, position: Vector2): Vector2 {
    const scale = mapData.size_factor / 100;

    const offset = 1;

    // 20.48 is 2048 / 100, so we get percents in the end.
    const x = (position.x - offset) * 50 * scale / 20.48;
    const y = (position.y - offset) * 50 * scale / 20.48;

    return {
      x: x,
      y: y
    };
  }

  private getAetherytes(id: number): Aetheryte[] {
    // If it's dravanian forelandes, use Idyllshire id instead.
    if (id === 213) {
      id = 257;
    }
    return this.lazyData.data.aetherytes
      .filter((aetheryte) => aetheryte.map === id)
      .map((aetheryte: Aetheryte) => {
        aetheryte.aethernetCoords = aetherstream[id] || { x: 0, y: 0 };
        return aetheryte;
      });
  }

  private totalDuration(path: NavigationStep[]): number {
    let duration = 0;
    path.forEach((step, index) => {
      // Don't take the first tp into consideration.
      if (index === 0) {
        return;
      }
      if (step.isTeleport) {
        duration += MapService.TP_DURATION;
      } else {
        const previousStep = path[index - 1];
        duration += this.mathService.distance(previousStep, step) / MapService.MOUNT_SPEED;
      }
    });
    return duration;
  }

  private getShortestPath(start: NavigationObjective, objectives: NavigationObjective[],
                          availableAetherytes: Aetheryte[]): NavigationStep[] {
    // First of all, compile all steps we have available
    let availablePoints: NavigationStep[] =
      objectives.map(point => ({
        ...point,
        isTeleport: false
      }));
    const availableAetherytesPoints: NavigationStep[] = availableAetherytes.map(aetheryte => ({
      x: aetheryte.x,
      y: aetheryte.y,
      isTeleport: true,
      name: this.l12n.getPlace(aetheryte.nameid)
    }));
    const steps: NavigationStep[] = [];
    steps.push({
      x: start.x,
      y: start.y,
      isTeleport: true,
      name: start.name
    });
    // , name: this.l12n.getPlace(start.nameid)
    // While there's more steps to add
    while (availablePoints.length > 0) {
      // Set base value insanely high for tp plus move, in case we don't have any aetherytes.
      let tpPlusMoveDuration = 99999999999;
      // this might be undefined values but whatever, won't be used if there's no aetherytes available
      let closestTpPlusMove = { tp: availableAetherytesPoints[0], moveTo: availablePoints[0] };
      // If we have aetherytes to tp to
      if (availableAetherytesPoints.length > 0) {
        // First of all, compute teleport + travel times
        for (const tp of availableAetherytesPoints) {
          let closest = availablePoints[0];
          let closestDistance = this.mathService.distance(tp, closest);
          for (const step of availablePoints) {
            if (this.mathService.distance(tp, step) < closestDistance) {
              closest = step;
              closestDistance = this.mathService.distance(tp, closest);
            }
          }
          if (closestDistance < this.mathService.distance(closestTpPlusMove.tp, closestTpPlusMove.moveTo)) {
            closestTpPlusMove = { tp: tp, moveTo: closest };
          }
        }
        // This is the fastest tp + move combination duration.
        tpPlusMoveDuration = MapService.TP_DURATION +
          (this.mathService.distance(closestTpPlusMove.tp, closestTpPlusMove.moveTo) / MapService.MOUNT_SPEED);

      }

      // Now check the closest point without TP.
      // Use our current position as reference
      const currentPosition = steps[steps.length - 1];
      // Fill with the first value to start the comparison.
      let closestPoint = availablePoints[0];
      let closestPointDistance = this.mathService.distance(currentPosition, closestPoint);
      for (const point of availablePoints) {
        if (this.mathService.distance(currentPosition, point) < closestPointDistance) {
          closestPoint = point;
          closestPointDistance = this.mathService.distance(currentPosition, closestPoint);
        }
      }

      // This is the fastest mount travel duration to any of the points.
      const closestPointMountDuration = closestPointDistance / MapService.MOUNT_SPEED;

      // If the closest point can be reached using a mount (or is equal to TP, but in this case we'll use mount).
      if (closestPointMountDuration <= tpPlusMoveDuration) {
        steps.push(closestPoint);
        availablePoints = availablePoints.filter(point => point !== closestPoint);
      } else {
        // Else, add aetheryte step plus move step
        steps.push(closestTpPlusMove.tp, closestTpPlusMove.moveTo);
        availablePoints = availablePoints.filter(point => point !== closestTpPlusMove.moveTo);
      }
    }
    return steps;
  }
}
