import { Component } from '@angular/core';
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
import { gatheringItems } from '../../../core/data/sources/gathering-items';
import { I18nName } from '../../../model/common/i18n-name';
import { BellNodesService } from '../../../core/data/bell-nodes.service';
import { Alarm } from '../../../core/alarms/alarm';
import { AlarmGroup } from '../../../core/alarms/alarm-group';
import { AlarmsFacade } from '../../../core/alarms/+state/alarms.facade';
import { MapService } from '../../../modules/map/map.service';
import { SettingsService } from '../../../modules/settings/settings.service';

@Component({
  selector: 'app-node',
  templateUrl: './node.component.html',
  styleUrls: ['./node.component.less']
})
export class NodeComponent extends TeamcraftPageComponent {

  public xivapiNode$: Observable<any>;

  public bonuses$: Observable<any[]>;

  public links$: Observable<{ title: string, icon: string, url: string }[]>;

  alarmsLoaded$: Observable<boolean> = this.alarmsFacade.loaded$;

  alarms$: Observable<Alarm[]> = this.alarmsFacade.allAlarms$;

  alarmGroups$: Observable<AlarmGroup[]> = this.alarmsFacade.allGroups$;

  constructor(private route: ActivatedRoute, private xivapi: XivapiService,
              private gt: DataService, private l12n: LocalizedDataService,
              private i18n: I18nToolsService, private translate: TranslateService,
              private router: Router, private lazyData: LazyDataService,
              private gtBell: BellNodesService, private alarmsFacade: AlarmsFacade,
              private mapService: MapService, public settings: SettingsService, seo: SeoService) {
    super(seo);

    const nodeId$ = this.route.paramMap.pipe(
      map(params => params.get('nodeId'))
    );

    this.xivapiNode$ = nodeId$.pipe(
      switchMap(id => {
        return this.xivapi.get(XivapiEndpoint.GatheringPointBase, +id);
      }),
      map(base => {
        base.mappyData = this.lazyData.data.nodes[base.ID];
        base.gtNode = this.gtBell.getNode(base.ID);
        if (base.gtNode) {
          base.gtNode.items.forEach(item => {
            if (base.mappyData.items.indexOf(item.id) === -1) {
              base.mappyData.items.push(item.id);
            }
          });
        }
        return base;
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

    this.bonuses$ = this.xivapiNode$.pipe(
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

            /*
            const koRow = this.lazyData.data.koGatheringBonuses[bonus.ID];
            if (koRow && koRow.value === bonus.BonusValue && koRow.conditionValue === bonus.ConditionValue) {
              bonusType.ko = koRow.bonus.ko;
              condition.ko = koRow.condition.ko;
            }
            */

            bonuses.push({
              bonus: this.bonusToText(bonusType, bonus.BonusValue),
              condition: this.bonusToText(condition, bonus.ConditionValue)
            });
          })
        });
        return bonuses;
      })
    );

    this.links$ = this.xivapiNode$.pipe(
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
      obj[key] = text.replace('<Value>IntegerParameter(1)</Value>', value)
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

  public generateAlarm(xivapiNode: any, itemId?: number): Partial<Alarm> {
    const nodes = this.gtBell.getAllNodes({ obj: { i: itemId || xivapiNode.gtNode.items[0].id } });
    const node = nodes.find(n => n.nodeId === xivapiNode.ID);
    const alarm: any = {
      itemId: node.itemId,
      icon: node.icon,
      duration: node.uptime / 60,
      mapId: node.mapId,
      zoneId: node.zoneid,
      type: node.type,
      coords: {
        x: node.x,
        y: node.y
      },
      spawns: node.spawnTimes,
      folklore: node.folklore,
      reduction: node.reduction,
      ephemeral: node.ephemeral,
      nodeContent: node.items,
      weathers: node.weathers,
      weathersFrom: node.weathersFrom,
      snagging: node.snagging,
      fishEyes: node.fishEyes,
      predators: node.predators || []
    };
    if (node.slot) {
      alarm.slot = +node.slot;
    }
    if (node.gig) {
      alarm.gig = node.gig;
    }
    if (node.baits) {
      alarm.baits = node.baits;
    }
    return alarm;
  }

  public addAlarm(alarm: Partial<Alarm>, group?: AlarmGroup): void {
    this.mapService.getMapById(alarm.mapId)
      .pipe(
        map((mapData) => {
          if (mapData !== undefined) {
            return this.mapService.getNearestAetheryte(mapData, alarm.coords);
          } else {
            return undefined;
          }
        }),
        map(aetheryte => {
          if (aetheryte !== undefined) {
            alarm.aetheryte = aetheryte;
          }
          return alarm;
        })
      ).subscribe((result: Alarm) => {
      if (group) {
        alarm.groupId = group.$key;
      }
      this.alarmsFacade.addAlarms(result);
    });
  }

  public getGatheringItem(itemId: number): any {
    return Object.keys(gatheringItems)
      .map(key => gatheringItems[key])
      .find(item => item.itemId === itemId);
  }

  public getSlot(itemId: number, data: any): string {
    if (data === undefined || data.gtNode === undefined) {
      return null;
    }
    const entry = data.gtNode.items.find(i => i.id === itemId);
    if (entry) {
      return entry.slot;
    }
    return null;
  }

  private getDescription(node: any): string {
    return `Lvl ${node.GatheringLevel} ${this.i18n.getName(this.l12n.xivapiToI18n(node.GatheringType, 'gatheringTypes'))}`;
  }

  private getName(node: any): string {
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
    return this.xivapiNode$.pipe(
      map(node => {
        return {
          title: this.getName(node),
          description: this.getDescription(node),
          url: `https://ffxivteamcraft.com/db/${this.translate.currentLang}/node/${node.ID}`,
          image: `https://xivapi.com${node.IconMap}`
        };
      })
    );
  }
}
