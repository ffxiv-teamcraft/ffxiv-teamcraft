import { Component } from '@angular/core';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { XivapiEndpoint, XivapiService } from '@xivapi/angular-client';
import { TranslateService } from '@ngx-translate/core';
import { map, switchMapTo, tap } from 'rxjs/operators';
import { subMonths } from 'date-fns';
import { StaticData } from '../../../lazy-data/static-data';
import { LazyDataFacade } from '../../../lazy-data/+state/lazy-data.facade';

@Component({
  selector: 'app-mappy-dashboard',
  templateUrl: './mappy-dashboard.component.html',
  styleUrls: ['./mappy-dashboard.component.less']
})
export class MappyDashboardComponent {

  private static readonly IGNORED_NODES = [174];

  public loading = true;

  public reloader$ = new BehaviorSubject<void>(null);

  public onlyMissingNodes$ = new BehaviorSubject(false);

  public display$ = this.reloader$.pipe(switchMapTo(
    combineLatest([
      this.xivapi.getList('mappy/updates' as XivapiEndpoint, { staging: true }),
      this.xivapi.getList(`mappy/nodes` as XivapiEndpoint, { staging: true }),
      this.onlyMissingNodes$,
      this.lazyData.getEntry('nodes'),
      this.lazyData.getEntry('maps'),
      this.lazyData.getEntry('gatheringPointToNodeId')
    ]).pipe(
      map(([updates, gatheringPointsRegistry, onlyMissingNodes, nodes, maps, gatheringPointToNodeId]) => {
        const acceptedMaps = Object.values<any>(nodes).map(n => n.map);
        return Object.values<any>(maps)
          .filter(m => {
            return acceptedMaps.includes(m.id);
          })
          .map(m => {
            const mapNodes = Object.entries<any>(nodes)
              .map(([id, n]) => ({ id: +id, ...n }))
              .filter(n => n.map === m.id && n.items.length > 0 && !StaticData.ignoredNodes.includes(n.id));
            const gatheringPoints = gatheringPointsRegistry[m.id] || [];
            return {
              ...m,
              updates: updates[m.id],
              old: {
                BNPC: updates[m.id]?.BNPC < subMonths(new Date(), 3).getTime() / 1000,
                Node: updates[m.id]?.Node < subMonths(new Date(), 3).getTime() / 1000
              },
              missingNodes: mapNodes.filter((node) => {
                return !MappyDashboardComponent.IGNORED_NODES.includes(node.id)
                  && !gatheringPoints.some(gatheringPoint => gatheringPointToNodeId[gatheringPoint] === node.id)
                  && node.items.some(i => i < 2000000);
              }).length
            };
          })
          .filter(m => {
            return !onlyMissingNodes || m.missingNodes > 0;
          });
      }),
      tap(() => this.loading = false)
    ))
  );

  constructor(private activatedRoute: ActivatedRoute, private xivapi: XivapiService,
              private lazyData: LazyDataFacade, public translate: TranslateService) {
  }

}
