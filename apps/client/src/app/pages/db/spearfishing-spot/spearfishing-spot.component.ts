import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TeamcraftPageComponent } from '../../../core/component/teamcraft-page-component';
import { Observable } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { I18nToolsService } from '../../../core/tools/i18n-tools.service';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
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
import { AlarmDisplayPipe } from '../../../core/alarms/alarm-display.pipe';
import { LazyRowPipe } from '../../../pipes/pipes/lazy-row.pipe';
import { IngameStarsPipe } from '../../../pipes/pipes/ingame-stars.pipe';
import { IfMobilePipe } from '../../../pipes/pipes/if-mobile.pipe';
import { I18nRowPipe } from '../../../core/i18n/i18n-row.pipe';
import { TimerPipe } from '../../../core/eorzea/timer.pipe';
import { I18nPipe } from '../../../core/i18n.pipe';
import { PageLoaderComponent } from '../../../modules/page-loader/page-loader/page-loader.component';
import { AlarmButtonComponent } from '../../../modules/alarm-button/alarm-button/alarm-button.component';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { ItemRarityDirective } from '../../../core/item-rarity/item-rarity.directive';
import { ItemIconComponent } from '../../../modules/item-icon/item-icon/item-icon.component';
import { NzListModule } from 'ng-zorro-antd/list';
import { MapComponent } from '../../../modules/map/map/map.component';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { DbCommentsComponent } from '../db-comments/db-comments/db-comments.component';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { DbButtonComponent } from '../../../core/db-button/db-button.component';
import { I18nNameComponent } from '../../../core/i18n/i18n-name/i18n-name.component';
import { FlexModule } from '@angular/flex-layout/flex';
import { NgIf, NgFor, AsyncPipe, DecimalPipe } from '@angular/common';

@Component({
    selector: 'app-spearfishing-spot',
    templateUrl: './spearfishing-spot.component.html',
    styleUrls: ['./spearfishing-spot.component.less'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [NgIf, FlexModule, I18nNameComponent, DbButtonComponent, NgFor, NzToolTipModule, DbCommentsComponent, NzDividerModule, NzCardModule, MapComponent, NzListModule, ItemIconComponent, ItemRarityDirective, NzTagModule, AlarmButtonComponent, PageLoaderComponent, AsyncPipe, DecimalPipe, I18nPipe, TranslateModule, TimerPipe, I18nRowPipe, IfMobilePipe, NodeTypeIconPipe, IngameStarsPipe, LazyRowPipe, AlarmDisplayPipe]
})
export class SpearfishingSpotComponent extends TeamcraftPageComponent {

  public node$ = this.route.paramMap.pipe(
    map(params => params.get('spotId')),
    switchMap(id => {
      return this.lazyData.getRow('nodesDatabasePages', +id);
    }),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  public bonuses$ = this.node$.pipe(
    map(node => {
      return node.bonuses;
    })
  );

  public links$: Observable<{ title: string, icon: string, url: string }[]>;

  alarms$: Observable<PersistedAlarm[]> = this.alarmsFacade.allAlarms$;

  alarmGroups$: Observable<AlarmGroup[]> = this.alarmsFacade.allGroups$;

  constructor(private route: ActivatedRoute, private i18n: I18nToolsService,
              private translate: TranslateService,
              private router: Router, private lazyData: LazyDataFacade,
              private alarmsFacade: AlarmsFacade, private gatheringNodesService: GatheringNodesService,
              private mapService: MapService, public settings: SettingsService, seo: SeoService) {
    super(seo);

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
          url: `https://ffxivteamcraft.com/db/${this.translate.currentLang}/spearfishing-spot/${node.id}`,
          image: `https://xivapi.com${(node.limited ? NodeTypeIconPipe.timed_icons : NodeTypeIconPipe.icons)[Math.abs(node.type)]}`
        };
      })
    );
  }

  private getDescription(node: LazyNodesDatabasePage): string {
    return `Lvl ${node.level}`;
  }
}
