import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { I18nToolsService } from '../../../core/tools/i18n-tools.service';
import { TranslateService } from '@ngx-translate/core';
import { SeoService } from '../../../core/seo/seo.service';
import { filter, map, shareReplay, switchMap } from 'rxjs/operators';
import { SeoMetaConfig } from '../../../core/seo/seo-meta-config';
import { TeamcraftPageComponent } from '../../../core/component/teamcraft-page-component';
import { LinkToolsService } from '../../../core/tools/link-tools.service';
import { I18nName } from '@ffxiv-teamcraft/types';
import { SettingsService } from '../../../modules/settings/settings.service';
import { LazyDataFacade } from '../../../lazy-data/+state/lazy-data.facade';
import { LazyLevesDatabasePage } from '@ffxiv-teamcraft/data/model/lazy-leves-database-page';

@Component({
  selector: 'app-leve',
  templateUrl: './leve.component.html',
  styleUrls: ['./leve.component.less']
})
export class LeveComponent extends TeamcraftPageComponent {

  public leve$ = this.route.paramMap.pipe(
    filter(params => params.get('slug') !== null),
    map(params => params.get('leveId')),
    switchMap(id => this.lazyData.getRow('levesDatabasePages', +id)),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  public links$: Observable<{ title: string, icon: string, url: string }[]>;

  public rewards$: Observable<{ type: string, id: number, amount: number, chances: number }[]>;

  public items$: Observable<{ id: number, amount: number }[]>;

  public battleItems$: Observable<{ id: number, name: I18nName, amount: number, dropRate?: number }[]>;

  public enemies$: Observable<{ id: number, level: number }[]>;

  public npcs$: Observable<{ id: number, issuer?: boolean, client?: boolean }[]>;

  constructor(private route: ActivatedRoute, private lazyData: LazyDataFacade,
              private i18n: I18nToolsService, public translate: TranslateService,
              private router: Router, private linkTools: LinkToolsService,
              public settings: SettingsService, seo: SeoService) {
    super(seo);
    this.updateSlug(router, i18n, route, 'leves', 'leveId');

    this.items$ = this.leve$.pipe(
      map(leve => {
        return leve.items;
        // return [0, 1, 2, 3]
        //   .filter(index => leve.CraftLeve[`Item${index}TargetID`] > 0)
        //   .map(index => {
        //     return {
        //       id: leve.CraftLeve[`Item${index}TargetID`],
        //       amount: leve.CraftLeve[`ItemCount${index}`]
        //     };
        //   });
      }),
      filter(Boolean)
    );

    this.battleItems$ = this.leve$.pipe(
      map(leve => {
        return leve.battleItems;
        // return [0, 1, 2, 3]
        //   .filter(index => leve.BattleLeve[`ItemsInvolved${index}TargetID`] > 0)
        //   .map(index => {
        //     const item = leve.BattleLeve[`ItemsInvolved${index}`];
        //     return {
        //       id: item.ID,
        //       name: this.i18n.xivapiToI18n(item, 'eventItems'),
        //       icon: item.Icon,
        //       amount: leve.BattleLeve[`ItemsInvolvedQty${index}`],
        //       dropRate: leve.BattleLeve[`ItemDropRate${index}`]
        //     };
        //   });
      }),
      filter(Boolean)
    );

    this.enemies$ = this.leve$.pipe(
      map(leve => {
        return leve.enemies;
        // return [0, 1, 2, 3, 4, 5, 6, 7]
        //   .filter(index => {
        //     return leve.BattleLeve[`BNpcName${index}TargetID`] > 0;
        //   })
        //   .reduce((enemies, index) => {
        //     const enemy = leve.BattleLeve[`BNpcName${index}`];
        //     enemies.push({
        //       id: enemy.ID,
        //       level: leve.BattleLeve[`EnemyLevel${index}`]
        //     });
        //     return enemies;
        //   }, []);
      }),
      filter(Boolean)
    );

    this.rewards$ = this.leve$.pipe(
      map((leve) => {
        return leve.rewards;
        // return [0, 1, 2, 3, 4, 5, 6, 7]
        //   .filter(index => {
        //     return leve.LeveRewardItem[`LeveRewardItemGroup${index}TargetID`] > 0;
        //   })
        //   .reduce((rewards, index) => {
        //     const group = leve.LeveRewardItem[`LeveRewardItemGroup${index}`];
        //     rewards.push(...[0, 1, 2, 3, 4, 5, 6, 7, 8]
        //       .filter(itemIndex => group[`Item${itemIndex}TargetID`] > 0)
        //       .reduce((items, itemIndex, i, array) => {
        //         items.push({
        //           id: group[`Item${itemIndex}TargetID`],
        //           amount: group[`Count${itemIndex}`],
        //           hq: group[`HQ${itemIndex}`] === 1,
        //           chances: Math.floor(leve.LeveRewardItem[`Probability%${index}`] / array.length)
        //         });
        //         return items;
        //       }, [])
        //     );
        //     return rewards;
        //   }, []);
      }),
      filter(Boolean)
    );

    this.npcs$ = this.leve$.pipe(
      map((leve) => {
        return leve.npcs;
      }),
      filter(Boolean)
    );

    this.links$ = this.leve$.pipe(
      map((leve) => {
        return [
          {
            title: 'GarlandTools',
            url: `https://www.garlandtools.org/db/#leve/${leve.id}`,
            icon: 'https://garlandtools.org/favicon.png'
          },
          {
            title: 'Gamer Escape',
            url: `https://ffxiv.gamerescape.com/wiki/${encodeURIComponent(leve.en.toString().split(' ').join('_'))}`,
            icon: './assets/icons/ge.png'
          }
        ];
      })
    );
  }

  protected getSeoMeta(): Observable<Partial<SeoMetaConfig>> {
    return this.leve$.pipe(
      map((leve) => {
        return {
          title: this.getName(leve),
          description: this.getDescription(leve),
          url: `https://ffxivteamcraft.com/db/${this.translate.currentLang}/leve/${leve.id}/${this.getName(leve).split(' ').join('-')}`,
          image: `https://xivapi.com${leve.icon}`
        };
      })
    );
  }

  private getName(leve: LazyLevesDatabasePage): string {
    // We might want to add more details for some specific items, which is why this is a method.
    return this.i18n.getName(leve);
  }

  private getDescription(leve: LazyLevesDatabasePage): string {
    // We might want to add more details for some specific items, which is why this is a method.
    return this.i18n.getName(leve.description);
  }

}
