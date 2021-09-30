import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TeamcraftPageComponent } from '../../../core/component/teamcraft-page-component';
import { combineLatest, Observable, of } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { XivapiEndpoint, XivapiService } from '@xivapi/angular-client';
import { DataService } from '../../../core/api/data.service';
import { LocalizedDataService } from '../../../core/data/localized-data.service';
import { I18nToolsService } from '../../../core/tools/i18n-tools.service';
import { TranslateService } from '@ngx-translate/core';
import { LazyDataService } from '../../../core/data/lazy-data.service';
import { SeoService } from '../../../core/seo/seo.service';
import { map, shareReplay, switchMap } from 'rxjs/operators';
import { SeoMetaConfig } from '../../../core/seo/seo-meta-config';
import { I18nName } from '../../../model/common/i18n-name';
import { Alarm } from '../../../core/alarms/alarm';
import { AlarmGroup } from '../../../core/alarms/alarm-group';
import { AlarmsFacade } from '../../../core/alarms/+state/alarms.facade';
import { MapService } from '../../../modules/map/map.service';
import { SettingsService } from '../../../modules/settings/settings.service';
import { GatheringNodesService } from '../../../core/data/gathering-nodes.service';

@Component({
  selector: 'app-spearfishing-spot',
  templateUrl: './spearfishing-spot.component.html',
  styleUrls: ['./spearfishing-spot.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SpearfishingSpotComponent extends TeamcraftPageComponent {

  public nodeData$: Observable<any>;

  public bonuses$: Observable<any[]>;

  public links$: Observable<{ title: string, icon: string, url: string }[]>;

  alarmsLoaded$: Observable<boolean> = this.alarmsFacade.loaded$;

  alarms$: Observable<Alarm[]> = this.alarmsFacade.allAlarms$;

  alarmGroups$: Observable<AlarmGroup[]> = this.alarmsFacade.allGroups$;

  constructor(private route: ActivatedRoute, private xivapi: XivapiService,
              private gt: DataService, private l12n: LocalizedDataService,
              private i18n: I18nToolsService, private translate: TranslateService,
              private router: Router, private lazyData: LazyDataService,
              private alarmsFacade: AlarmsFacade, private gatheringNodesService: GatheringNodesService,
              private mapService: MapService, public settings: SettingsService, seo: SeoService) {
    super(seo);

    const nodeId$ = this.route.paramMap.pipe(
      map(params => params.get('spotId'))
    );

    this.nodeData$ = nodeId$.pipe(
      switchMap(id => {
        return this.xivapi.get(XivapiEndpoint.GatheringPointBase, +id);
      }),
      map(node => {
        node.mappyData = this.lazyData.data.nodes[node.ID];
        node.mappyData.items = node.mappyData.items.map(item => {
          return {
            item: item,
            gatheringItem: this.getGatheringItem(item),
            alarms: node.mappyData.limited ? this.alarmsFacade.generateAlarms({
              ...node.mappyData,
              matchingItemId: item,
              matchingItemIsHidden: false
            }) : []
          };
        });
        if (node.mappyData.hiddenItems) {
          node.mappyData.items.push(...node.mappyData.hiddenItems.map(item => {
            return {
              item: item,
              gatheringItem: this.getGatheringItem(item),
              alarms: node.mappyData.limited ? this.alarmsFacade.generateAlarms({
                ...node.mappyData,
                matchingItemId: item,
                matchingItemIsHidden: true
              }) : []
            };
          }));
        }
        if (node.mappyData.limited) {
          node.alarms = this.alarmsFacade.generateAlarms(node.mappyData);
        }
        return node;
      }),
      switchMap(base => {
        if (!(base.GameContentLinks && base.GameContentLinks.GatheringPoint)) {
          return of(base);
        }
        return combineLatest([base.GameContentLinks.GatheringPoint.GatheringPointBase.map(
          point => {
            return this.xivapi.get(XivapiEndpoint.GatheringPoint, point);
          }
        )]).pipe(
          map(points => {
            base.GatheringPoints = points;
            return base;
          })
        );
      }),
      shareReplay(1)
    );

    this.bonuses$ = this.nodeData$.pipe(
      map(node => {
        const bonuses = [];
        (node.GatheringPoints || []).forEach(point => {
          [0, 1].forEach(index => {
            const bonus = point[`GatheringPointBonus${index}`];
            if (!bonus) return;

            const bonusType = this.l12n.xivapiToI18n(bonus.BonusType, null, 'Text');
            const condition = this.l12n.xivapiToI18n(bonus.Condition, null, 'Text');

            const zhRow = this.lazyData.data.zhGatheringBonuses[bonus.ID];
            if (zhRow && zhRow.value === bonus.BonusValue && zhRow.conditionValue === bonus.ConditionValue) {
              bonusType.zh = zhRow.bonus.zh;
              condition.zh = zhRow.condition.zh;
            }

            bonuses.push({
              bonus: this.bonusToText(bonusType, bonus.BonusValue),
              condition: this.bonusToText(condition, bonus.ConditionValue)
            });
          });
        });
        return bonuses;
      })
    );

    this.links$ = this.nodeData$.pipe(
      map((xivapiNode) => {
        return [
          {
            title: 'GarlandTools',
            url: `http://www.garlandtools.org/db/#node/${xivapiNode.ID}`,
            icon: 'https://garlandtools.org/favicon.png'
          }
        ];
      })
    );
  }

  public bonusToText(entry: I18nName, value: number): I18nName {
    return Object.entries(entry).reduce((obj, [key, text]) => {
      obj[key] = text.replace('<Value>IntegerParameter(1)</Value>', value);
      return obj;
    }, { en: '', fr: '', de: '', ja: '' });
  }

  public canCreateAlarm(generatedAlarm: Partial<Alarm>): Observable<boolean> {
    return this.alarms$.pipe(
      map(alarms => {
        return !alarms.some(alarm => {
          return alarm.itemId === generatedAlarm.itemId
            && alarm.zoneId === generatedAlarm.zoneId;
        });
      })
    );
  }

  public addAlarm(alarm: Alarm, group?: AlarmGroup): void {
    this.alarmsFacade.addAlarmInGroup(alarm, group);
  }

  public getGatheringItem(itemId: number): any {
    return this.lazyData.data.nodes
      .find(node => node.items.includes(itemId));
  }

  private getDescription(node: any): string {
    return `Lvl ${node.GatheringLevel} ${this.i18n.getName(this.l12n.xivapiToI18n(node.GatheringType, 'gatheringTypes'))}`;
  }

  public getName(node: any): string {
    if (!node) return '';

    if (node.GatheringPoints && node.GatheringPoints.length) {
      const point = node.GatheringPoints[0];
      if (point.PlaceName) {
        return this.i18n.getName(this.l12n.xivapiToI18n(point.PlaceName, 'places'));
      }
    }

    return this.i18n.getName(this.l12n.getPlace(node.mappyData.zoneid));
  }

  protected getSeoMeta(): Observable<Partial<SeoMetaConfig>> {
    return this.nodeData$.pipe(
      map(node => {
        return {
          title: this.getName(node),
          description: this.getDescription(node),
          url: `https://ffxivteamcraft.com/db/${this.translate.currentLang}/spearfishing-spot/${node.ID}`,
          image: `https://xivapi.com${node.IconMap}`
        };
      })
    );
  }
}
