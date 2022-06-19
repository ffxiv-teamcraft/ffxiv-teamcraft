import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TeamcraftPageComponent } from '../../../core/component/teamcraft-page-component';
import { combineLatest, Observable, of } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { XivapiEndpoint, XivapiService } from '@xivapi/angular-client';
import { DataService } from '../../../core/api/data.service';
import { I18nToolsService } from '../../../core/tools/i18n-tools.service';
import { TranslateService } from '@ngx-translate/core';
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
import { LazyDataFacade } from '../../../lazy-data/+state/lazy-data.facade';
import { safeCombineLatest } from '../../../core/rxjs/safe-combine-latest';
import { Region } from '../../../modules/settings/region.enum';
import { LazyData } from '../../../lazy-data/lazy-data';

@Component({
  selector: 'app-spearfishing-spot',
  templateUrl: './spearfishing-spot.component.html',
  styleUrls: ['./spearfishing-spot.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SpearfishingSpotComponent extends TeamcraftPageComponent {

  public nodeData$: Observable<any>;

  public bonuses$: Observable<Object[]>;

  public links$: Observable<{ title: string, icon: string, url: string }[]>;

  alarmsLoaded$: Observable<boolean> = this.alarmsFacade.loaded$;

  alarms$: Observable<Alarm[]> = this.alarmsFacade.allAlarms$;

  alarmGroups$: Observable<AlarmGroup[]> = this.alarmsFacade.allGroups$;

  constructor(private route: ActivatedRoute, private xivapi: XivapiService,
              private gt: DataService, private i18n: I18nToolsService, private translate: TranslateService,
              private router: Router, private lazyData: LazyDataFacade,
              private alarmsFacade: AlarmsFacade, private gatheringNodesService: GatheringNodesService,
              private mapService: MapService, public settings: SettingsService, seo: SeoService) {
    super(seo);

    const nodeId$ = this.route.paramMap.pipe(
      map(params => params.get('spotId'))
    );

    this.nodeData$ = nodeId$.pipe(
      switchMap(id => {
        return combineLatest([
          this.xivapi.get(XivapiEndpoint.GatheringPointBase, +id),
          this.lazyData.getEntry('nodes')
        ]);
      }),
      map(([node, lazyNodes]) => {
        node.mappyData = lazyNodes[node.ID];
        node.mappyData.items = node.mappyData.items.map(item => {
          return {
            item: item,
            gatheringItem: this.getGatheringItem(item, lazyNodes),
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
              gatheringItem: this.getGatheringItem(item, lazyNodes),
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
        return combineLatest(base.GameContentLinks.GatheringPoint.GatheringPointBase.map(
          point => {
            return this.xivapi.get(XivapiEndpoint.GatheringPoint, point);
          }
        )).pipe(
          map(points => {
            base.GatheringPoints = points;
            return base;
          })
        );
      }),
      shareReplay({ bufferSize: 1, refCount: true })
    );

    this.bonuses$ = this.nodeData$.pipe(
      switchMap(node => {
        return safeCombineLatest((node.GatheringPoints || []).map(point => {
          return safeCombineLatest(
            [0, 1].filter(index => {
              return point[`GatheringPointBonus${index}`];
            })
              .map(index => {
                const bonus = point[`GatheringPointBonus${index}`];
                const bonusType = this.i18n.xivapiToI18n(bonus.BonusType, 'Text');
                const condition = this.i18n.xivapiToI18n(bonus.Condition, 'Text');
                if (this.settings.region === Region.China) {
                  return this.lazyData.getRow('zhGatheringBonuses', bonus.ID).pipe(
                    map(zhRow => {
                      if (zhRow && zhRow.value === bonus.BonusValue && zhRow.conditionValue === bonus.ConditionValue) {
                        bonusType.zh = zhRow.bonus.zh;
                        condition.zh = zhRow.condition.zh;
                      }
                    })
                  );
                }
                return of({
                  bonus: this.bonusToText(bonusType, bonus.BonusValue),
                  condition: this.bonusToText(condition, bonus.ConditionValue)
                });
              })
          );
        })).pipe(
          map(bonuses => bonuses.flat())
        );
      })
    );

    this.links$ = this.nodeData$.pipe(
      map((xivapiNode) => {
        return [
          {
            title: 'GarlandTools',
            url: `https://www.garlandtools.org/db/#node/${xivapiNode.ID}`,
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

  public getGatheringItem(itemId: number, nodes: LazyData['nodes']): any {
    return Object.values<any>(nodes)
      .find(node => node.items.includes(itemId));
  }

  public getName(node: any): Observable<string> {
    if (!node) return of('');

    if (node.GatheringPoints && node.GatheringPoints.length) {
      const point = node.GatheringPoints[0];
      if (point.PlaceName) {
        return of(this.i18n.getName(this.i18n.xivapiToI18n(point.PlaceName)));
      }
    }

    return this.i18n.getNameObservable('places', node.mappyData.zoneid);
  }

  protected getSeoMeta(): Observable<Partial<SeoMetaConfig>> {
    return this.nodeData$.pipe(
      switchMap(node => {
        return this.getName(node).pipe(
          map(title => {
            return {
              title,
              description: this.getDescription(node),
              url: `https://ffxivteamcraft.com/db/${this.translate.currentLang}/spearfishing-spot/${node.ID}`,
              image: `https://xivapi.com${node.IconMap}`
            };
          })
        );
      })
    );
  }

  private getDescription(node: any): string {
    return `Lvl ${node.GatheringLevel} ${this.i18n.getName(this.i18n.xivapiToI18n(node.GatheringType))}`;
  }
}
