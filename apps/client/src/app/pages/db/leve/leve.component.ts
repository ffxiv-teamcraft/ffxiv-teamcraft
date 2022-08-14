import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { XivapiEndpoint, XivapiService } from '@xivapi/angular-client';
import { DataService } from '../../../core/api/data.service';
import { I18nToolsService } from '../../../core/tools/i18n-tools.service';
import { TranslateService } from '@ngx-translate/core';
import { SeoService } from '../../../core/seo/seo.service';
import { filter, map, shareReplay, switchMap } from 'rxjs/operators';
import * as _ from 'lodash';
import { SeoMetaConfig } from '../../../core/seo/seo-meta-config';
import { TeamcraftPageComponent } from '../../../core/component/teamcraft-page-component';
import { LeveData } from '../../../model/garland-tools/leve-data';
import { LinkToolsService } from '../../../core/tools/link-tools.service';
import { levemetes } from '../../../core/data/sources/levemetes';
import { I18nName } from '../../../model/common/i18n-name';
import { SettingsService } from '../../../modules/settings/settings.service';

@Component({
  selector: 'app-leve',
  templateUrl: './leve.component.html',
  styleUrls: ['./leve.component.less']
})
export class LeveComponent extends TeamcraftPageComponent {

  public gtData$: Observable<LeveData>;

  public xivapiLeve$: Observable<any>;

  public links$: Observable<{ title: string, icon: string, url: string }[]>;

  public rewards$: Observable<{ type: string, id: number, amount: number, chances: number }[]>;

  public items$: Observable<{ id: number, amount: number }[]>;

  public battleItems$: Observable<{ id: number, name: I18nName, amount: number, dropRate?: number }[]>;

  public enemies$: Observable<{ id: number, level: number }[]>;

  public npcs$: Observable<{ id: number, issuer?: boolean, client?: boolean }[]>;

  constructor(private route: ActivatedRoute, private xivapi: XivapiService,
              private gt: DataService,
              private i18n: I18nToolsService, public translate: TranslateService,
              private router: Router, private linkTools: LinkToolsService,
              public settings: SettingsService, seo: SeoService) {
    super(seo);
    this.updateSlug(router, i18n, route, 'leves', 'leveId');

    const leveId$ = this.route.paramMap.pipe(
      filter(params => params.get('slug') !== null),
      map(params => params.get('leveId'))
    );

    this.gtData$ = leveId$.pipe(
      switchMap(id => {
        return this.gt.getLeve(+id);
      }),
      shareReplay({ bufferSize: 1, refCount: true })
    );

    this.xivapiLeve$ = leveId$.pipe(
      switchMap(id => {
        return this.xivapi.get(XivapiEndpoint.Leve, +id);
      }),
      shareReplay({ bufferSize: 1, refCount: true })
    );

    this.items$ = this.xivapiLeve$.pipe(
      filter(leve => leve.CraftLeve),
      map(leve => {
        return [0, 1, 2, 3]
          .filter(index => leve.CraftLeve[`Item${index}TargetID`] > 0)
          .map(index => {
            return {
              id: leve.CraftLeve[`Item${index}TargetID`],
              amount: leve.CraftLeve[`ItemCount${index}`]
            };
          });
      })
    );

    this.battleItems$ = this.xivapiLeve$.pipe(
      filter(leve => leve.BattleLeve),
      map(leve => {
        return [0, 1, 2, 3]
          .filter(index => leve.BattleLeve[`ItemsInvolved${index}TargetID`] > 0)
          .map(index => {
            const item = leve.BattleLeve[`ItemsInvolved${index}`];
            return {
              id: item.ID,
              name: this.i18n.xivapiToI18n(item, 'eventItems'),
              icon: item.Icon,
              amount: leve.BattleLeve[`ItemsInvolvedQty${index}`],
              dropRate: leve.BattleLeve[`ItemDropRate${index}`]
            };
          });
      })
    );

    this.enemies$ = this.xivapiLeve$.pipe(
      map(leve => {
        return [0, 1, 2, 3, 4, 5, 6, 7]
          .filter(index => {
            return leve.BattleLeve[`BNpcName${index}TargetID`] > 0;
          })
          .reduce((enemies, index) => {
            const enemy = leve.BattleLeve[`BNpcName${index}`];
            enemies.push({
              id: enemy.ID,
              level: leve.BattleLeve[`EnemyLevel${index}`]
            });
            return enemies;
          }, []);
      })
    );

    this.rewards$ = this.xivapiLeve$.pipe(
      map((leve) => {
        return [0, 1, 2, 3, 4, 5, 6, 7]
          .filter(index => {
            return leve.LeveRewardItem[`LeveRewardItemGroup${index}TargetID`] > 0;
          })
          .reduce((rewards, index) => {
            const group = leve.LeveRewardItem[`LeveRewardItemGroup${index}`];
            rewards.push(...[0, 1, 2, 3, 4, 5, 6, 7, 8]
              .filter(itemIndex => group[`Item${itemIndex}TargetID`] > 0)
              .reduce((items, itemIndex, i, array) => {
                items.push({
                  id: group[`Item${itemIndex}TargetID`],
                  amount: group[`Count${itemIndex}`],
                  hq: group[`HQ${itemIndex}`] === 1,
                  chances: Math.floor(leve.LeveRewardItem[`Probability%${index}`] / array.length)
                });
                return items;
              }, [])
            );
            return rewards;
          }, []);
      })
    );

    this.npcs$ = this.xivapiLeve$.pipe(
      map((leve) => {
        const npcs: any[] = [
          {
            id: leve.LevelLevemete.Object?.ID,
            client: true
          }
        ];
        const levemete = Object.keys(levemetes).find(key => levemetes[key].indexOf(leve.ID) > -1);
        if (levemete !== undefined) {
          npcs.push({
            id: +levemete,
            issuer: true
          });
        }
        return npcs.reverse();
      })
    );

    this.links$ = this.xivapiLeve$.pipe(
      map((xivapiLeve) => {
        return [
          {
            title: 'GarlandTools',
            url: `https://www.garlandtools.org/db/#leve/${xivapiLeve.ID}`,
            icon: 'https://garlandtools.org/favicon.png'
          },
          {
            title: 'Gamer Escape',
            url: `https://ffxiv.gamerescape.com/wiki/${encodeURIComponent(xivapiLeve.Name_en.toString().split(' ').join('_'))}`,
            icon: './assets/icons/ge.png'
          }
        ];
      })
    );
  }

  protected getSeoMeta(): Observable<Partial<SeoMetaConfig>> {
    return this.xivapiLeve$.pipe(
      map((leve) => {
        return {
          title: this.getName(leve),
          description: this.getDescription(leve),
          url: `https://ffxivteamcraft.com/db/${this.translate.currentLang}/leve/${leve.ID}/${this.getName(leve).split(' ').join('-')}`,
          image: `https://xivapi.com/${leve.IconIssuer}`
        };
      })
    );
  }

  private getName(item: any): string {
    // We might want to add more details for some specific items, which is why this is a method.
    return this.i18n.getName(this.i18n.xivapiToI18n(item));
  }

  private getDescription(item: any): string {
    // We might want to add more details for some specific items, which is why this is a method.
    return this.i18n.getName(this.i18n.xivapiToI18n(item, 'Description'));
  }

}
