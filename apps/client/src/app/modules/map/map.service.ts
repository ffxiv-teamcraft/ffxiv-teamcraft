import { Injectable } from '@angular/core';
import { combineLatest, Observable } from 'rxjs';
import { MapData } from './map-data';
import { Vector2 } from '../../core/tools/vector2';
import { MathToolsService } from '../../core/tools/math-tools';
import { NavigationStep } from './navigation-step';
import { NavigationObjective } from './navigation-objective';
import { map, shareReplay, startWith, switchMap, withLatestFrom } from 'rxjs/operators';
import { XivapiService } from '@xivapi/angular-client';
import * as _ from 'lodash';
import { WorldNavigationStep } from './world-navigation-step';
import { requestsWithDelay } from '../../core/rxjs/requests-with-delay';
import { SettingsService } from '../settings/settings.service';
import { EorzeaFacade } from '../eorzea/+state/eorzea.facade';
import { Vector3 } from '../../core/tools/vector3';
import { LazyDataFacade } from '../../lazy-data/+state/lazy-data.facade';
import { I18nToolsService } from '../../core/tools/i18n-tools.service';
import { LazyAetheryte } from '../../lazy-data/model/lazy-aetheryte';

@Injectable()
export class MapService {

  // Flying mount speed, used as reference for TP over mount comparison, needs a precise recording.
  private static readonly MOUNT_SPEED = 1;

  // TP duration on the same map, this is an average.
  private static readonly TP_DURATION = 8;

  private cache: { [index: number]: Observable<MapData> } = {};

  constructor(private xivapi: XivapiService, private mathService: MathToolsService, private i18n: I18nToolsService,
              private settings: SettingsService, private lazyData: LazyDataFacade, private eorzea: EorzeaFacade) {
  }

  getMapById(mapId: number): Observable<MapData> {
    if (this.cache[mapId] === undefined) {
      this.cache[mapId] = this.lazyData.getRow('maps', mapId).pipe(
        switchMap(mapData => {
          return this.getAetherytes(mapId).pipe(
            map(aetherytes => {
              return {
                ...mapData,
                aetherytes
              };
            })
          );
        }),
        shareReplay(1)
      );
    }
    return this.cache[mapId];
  }

  private getDistanceFromAetheryte(aetheryte: LazyAetheryte, target: Vector2 | Vector3): number {
    let distance = this.mathService.distance(aetheryte, target);
    if (aetheryte.id === 173 && target.y > 15) {
      distance *= 2;
    }
    if (aetheryte.id === 147 && target.y > 24) {
      distance *= 2;
    }
    if (aetheryte.id === 148 && target.y <= 24) {
      distance *= 2;
    }
    return distance;
  }

  public getNearestAetheryte(mapData: MapData, coords: Vector2 | Vector3): Observable<LazyAetheryte> {
    return this.getAetherytes(mapData.id, true).pipe(
      map(aetherytes => {
        let nearest = aetherytes[0];
        for (const aetheryte of aetherytes) {
          if (this.getDistanceFromAetheryte(aetheryte, coords) < this.getDistanceFromAetheryte(nearest, coords)) {
            nearest = aetheryte;
          }
        }
        return nearest;
      })
    );
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
            switchMap(([optimizedPaths, mapId]: [WorldNavigationStep[], number]) => {
              const res: WorldNavigationStep[] = [];
              const pool = [...optimizedPaths];
              return this.getAetherytes(mapId || this.settings.startingPlace).pipe(
                map(aetherytes => {
                  const startingPoint = aetherytes[0];
                  res.push(pool.sort((a, b) => {
                    const aCost = this.getTpCost(startingPoint, a.map.aetherytes[0] as LazyAetheryte);
                    const bCost = this.getTpCost(startingPoint, b.map.aetherytes[0] as LazyAetheryte);
                    return aCost - bCost;
                  }).shift());
                  while (pool.length > 0) {
                    res.push(
                      pool.sort((a, b) => {
                        const aCost = this.getTpCost(res[res.length - 1].map.aetherytes[0] as LazyAetheryte, a.map.aetherytes[0] as LazyAetheryte);
                        const bCost = this.getTpCost(res[res.length - 1].map.aetherytes[0] as LazyAetheryte, b.map.aetherytes[0] as LazyAetheryte);
                        return aCost - bCost;
                      }).shift()
                    );
                  }
                  return res;
                })
              );
            })
          );
        })
      );
  }

  public getOptimizedPathOnMap(mapId: number, points: NavigationObjective[], startPoint?: NavigationObjective): Observable<NavigationStep[]> {
    return this.getMapById(mapId)
      .pipe(
        map(mapData => {
          // We only want big aetherytes.
          const bigAetherytes = mapData.aetherytes.filter(ae => ae.type === 0);
          if (mapData.aetherytes.length === 0) {
            return this.getShortestPath({
              x: 12,
              y: 28,
              name: this.i18n.getNameObservable('places', 2566)
            }, points, []);
          }
          // If theres no start point, check from each aetheryte to find the shortest path
          if (startPoint === undefined) {
            const paths = bigAetherytes.map(aetheryte => this.getShortestPath({
              x: aetheryte.x,
              y: aetheryte.y,
              name: this.i18n.getNameObservable('places', aetheryte.nameid)
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

  private getTpCost(from: LazyAetheryte, to: LazyAetheryte): number {
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
      return 70;
    }

    const base = (Math.sqrt(Math.pow(fromCoords.x - toCoords.x, 2) + Math.pow(fromCoords.y - toCoords.y, 2)) / 2) + 100;
    if (this.settings.favoriteAetherytes.indexOf(to.nameid) > -1) {
      return Math.floor(base / 2);
    }
    return Math.floor(base);
  }

  private getAetherytes(id: number, excludeMinis = false): Observable<LazyAetheryte[]> {
    // If it's dravanian forelands, use Idyllshire id instead.
    if (id === 213) {
      id = 257;
    }
    return this.lazyData.getEntry('aetherytes').pipe(
      map(aetherytes => {
        return aetherytes
          .filter((aetheryte) => {
            return aetheryte.map === id && (!excludeMinis || aetheryte.type === 0);
          });
      })
    );
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
                          availableAetherytes: LazyAetheryte[]): NavigationStep[] {
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
      name: this.i18n.getNameObservable('places', aetheryte.nameid)
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
