import { Component } from '@angular/core';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { XivapiEndpoint, XivapiService } from '@xivapi/angular-client';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { map, switchMapTo, tap } from 'rxjs/operators';
import { subMonths } from 'date-fns';
import { StaticData } from '../../../lazy-data/static-data';
import { LazyDataFacade } from '../../../lazy-data/+state/lazy-data.facade';
import { SettingsService } from '../../../modules/settings/settings.service';
import { I18nPipe } from '../../../core/i18n.pipe';
import { MapNamePipe } from '../../../pipes/pipes/map-name.pipe';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NgIf, NgFor, AsyncPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzWaveModule } from 'ng-zorro-antd/core/wave';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { FlexModule } from '@angular/flex-layout/flex';
import { NzDividerModule } from 'ng-zorro-antd/divider';

@Component({
    selector: 'app-mappy-dashboard',
    templateUrl: './mappy-dashboard.component.html',
    styleUrls: ['./mappy-dashboard.component.less'],
    standalone: true,
    imports: [NzDividerModule, FlexModule, NzButtonModule, NzWaveModule, NzIconModule, NzSwitchModule, FormsModule, NgIf, NgFor, NzCardModule, NzTagModule, RouterLink, AsyncPipe, DatePipe, MapNamePipe, I18nPipe, TranslateModule]
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

  constructor(private xivapi: XivapiService,
              private lazyData: LazyDataFacade, public translate: TranslateService,
              public settigns: SettingsService) {
  }

}
