import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { XivapiEndpoint, XivapiService } from '@xivapi/angular-client';
import { map, mapTo, switchMap, takeUntil } from 'rxjs/operators';
import { NodeTypeIconPipe } from '../../../pipes/pipes/node-type-icon.pipe';
import { MapService } from '../../../modules/map/map.service';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { TeamcraftComponent } from '../../../core/component/teamcraft-component';
import { HttpClient, HttpParams } from '@angular/common/http';
import { SettingsService } from '../../../modules/settings/settings.service';
import { AuthFacade } from '../../../+state/auth.facade';
import { StaticData } from '../../../lazy-data/static-data';
import { LazyDataFacade } from '../../../lazy-data/+state/lazy-data.facade';
import { Memoized } from '../../../core/decorators/memoized';

@Component({
  selector: 'app-mappy',
  templateUrl: './mappy.component.html',
  styleUrls: ['./mappy.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MappyComponent extends TeamcraftComponent {

  reloader$ = new BehaviorSubject<void>(null);

  display$ = this.activatedRoute.paramMap.pipe(
    switchMap(params => {
      return this.reloader$.pipe(mapTo(params));
    }),
    switchMap(params => {
      const mapId = +params.get('mapId');
      return combineLatest([
        this.xivapi.get('mappy/map' as XivapiEndpoint, mapId),
        this.xivapi.getList('mappy/updates' as XivapiEndpoint, { staging: true }),
        this.xivapi.getList(`mappy/map/${mapId}/nodes` as XivapiEndpoint, { staging: true }).pipe(map(res => res as any as number[])),
        this.lazyData.getRow('maps', mapId),
        this.lazyData.getEntry('nodes'),
        this.lazyData.getEntry('gatheringPointToNodeId')
      ])
        .pipe(
          map(([entries, updates, gatheringPoints, mapData, nodes, gatheringPointToNodeId]) => {
            const mapNodes = Object.entries<any>(nodes)
              .map(([id, n]) => ({ id: +id, ...n }))
              .filter(n => n.map === mapId && n.items.length > 0 && !StaticData.ignoredNodes.includes(n.id));
            return {
              entries,
              updates: updates[mapId],
              map: mapData,
              bnpcs: entries.filter(e => e.Type === 'BNPC').map(e => {
                return {
                  ...e,
                  cssCoords: this.mapService.getPositionOnMap(mapData, { x: e.PosX, y: e.PosY })
                };
              }),
              nodes: entries.filter(e => e.Type === 'Node').map(e => {
                return {
                  ...e,
                  cssCoords: this.mapService.getPositionOnMap(mapData, { x: e.PosX, y: e.PosY })
                };
              }),
              missingNodes: mapNodes.filter((node) => {
                return !gatheringPoints.some(gatheringPoint => gatheringPointToNodeId[gatheringPoint] === node.id);
              })
            };
          })
        );
    })
  );

  public isAdmin$ = this.authFacade.user$.pipe(
    map(user => user.admin)
  );

  constructor(private activatedRoute: ActivatedRoute, private xivapi: XivapiService,
              private lazyData: LazyDataFacade, private mapService: MapService,
              public translate: TranslateService, private http: HttpClient,
              private settings: SettingsService, private authFacade: AuthFacade,
              cdr: ChangeDetectorRef) {
    super();
    translate.onLangChange.pipe(
      takeUntil(this.onDestroy$)
    ).subscribe(() => {
      cdr.detectChanges();
    });
  }

  clearMap(mapId: number): void {
    this.deleteRequest(`map/${mapId}`).subscribe(() => {
      this.reloader$.next();
    });
  }

  deleteRequest<T = any>(url: string): Observable<T> {
    const queryParams = new HttpParams().set('private_key', this.settings.xivapiKey);
    return this.http.delete<T>(`https://staging.xivapi.com/mappy/${url}`, { params: queryParams });
  }

  @Memoized()
  getNodeIcon(gatheringPointBaseId: number): Observable<string> {
    return this.lazyData.getRow('gatheringPointToNodeId', gatheringPointBaseId).pipe(
      switchMap(nodeId => this.lazyData.getRow('nodes', nodeId)),
      map(node => {
        if (!node) {
          return './assets/icons/mappy/highlight.png';
        }
        if (node.limited) {
          return NodeTypeIconPipe.timed_icons[node.type];
        }
        return NodeTypeIconPipe.icons[node.type];
      })
    );
  }

  trackByID(index: number, entry: any): string {
    return entry.ID;
  }

}
