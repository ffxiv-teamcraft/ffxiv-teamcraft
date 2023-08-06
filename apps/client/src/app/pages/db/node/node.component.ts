import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TeamcraftPageComponent } from '../../../core/component/teamcraft-page-component';
import { Observable } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { I18nToolsService } from '../../../core/tools/i18n-tools.service';
import { TranslateService } from '@ngx-translate/core';
import { SeoService } from '../../../core/seo/seo.service';
import { map, shareReplay, switchMap } from 'rxjs/operators';
import { SeoMetaConfig } from '../../../core/seo/seo-meta-config';
import { PersistedAlarm } from '../../../core/alarms/persisted-alarm';
import { AlarmGroup } from '../../../core/alarms/alarm-group';
import { AlarmsFacade } from '../../../core/alarms/+state/alarms.facade';
import { MapService } from '../../../modules/map/map.service';
import { SettingsService } from '../../../modules/settings/settings.service';
import { GatheringNodesService } from '../../../core/data/gathering-nodes.service';
import { LazyDataFacade } from '../../../lazy-data/+state/lazy-data.facade';
import { NodeTypeIconPipe } from '../../../pipes/pipes/node-type-icon.pipe';
import { LazyNodesDatabasePage } from '@ffxiv-teamcraft/data/model/lazy-nodes-database-page';

@Component({
  selector: 'app-node',
  templateUrl: './node.component.html',
  styleUrls: ['./node.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NodeComponent extends TeamcraftPageComponent {

  public node$ = this.route.paramMap.pipe(
    map(params => params.get('nodeId')),
    switchMap(id => {
      return this.lazyData.getRow('nodesDatabasePages', +id);
    }),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  public bonuses$: Observable<any[]>;

  public links$: Observable<{ title: string, icon: string, url: string }[]>;

  alarms$: Observable<PersistedAlarm[]> = this.alarmsFacade.allAlarms$;

  alarmGroups$: Observable<AlarmGroup[]> = this.alarmsFacade.allGroups$;

  constructor(private route: ActivatedRoute,
              private i18n: I18nToolsService, private translate: TranslateService,
              private router: Router, private lazyData: LazyDataFacade,
              private alarmsFacade: AlarmsFacade, private gatheringNodesService: GatheringNodesService,
              private mapService: MapService, public settings: SettingsService, seo: SeoService) {
    super(seo);

    this.bonuses$ = this.node$.pipe(
      map(node => {
        return node.bonuses;
      })
    );

    this.links$ = this.node$.pipe(
      map((node) => {
        return [
          {
            title: 'GarlandTools',
            url: `https://www.garlandtools.org/db/#node/${node.id}`,
            icon: 'https://garlandtools.org/favicon.png'
          }
        ];
      })
    );
  }

  public addAlarm(alarm: PersistedAlarm, group?: AlarmGroup): void {
    this.alarmsFacade.addAlarmInGroup(alarm, group);
  }

  protected getSeoMeta(): Observable<Partial<SeoMetaConfig>> {
    return this.node$.pipe(
      map(node => {
        return {
          title: this.i18n.getName(node),
          description: this.getDescription(node),
          url: `https://ffxivteamcraft.com/db/${this.translate.currentLang}/node/${node.id}`,
          image: `https://xivapi.com${(node.limited ? NodeTypeIconPipe.timed_icons : NodeTypeIconPipe.icons)[Math.abs(node.type)]}`
        };
      })
    );
  }

  private getDescription(node: LazyNodesDatabasePage): string {
    return `Lvl ${node.level}`;
  }
}
